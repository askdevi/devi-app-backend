import { AzureOpenAI } from "openai";
import { BirthDetails, GPTMessage, MatchDetails } from "@/types";
import { getCurrentPlanetaryPositions } from "./astrology/currentTransits";
import { getCurrentDasha } from "./astrology/currentDasha";
import { systemPrompt, humanizePrompt, splitMessagePrompt, splitThreeWayPrompt, prompt3 } from "./prompts";
import { getDailyNakshatraReport } from './astrology/dailyNakshatraReport';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
// import { useAuth } from '@/context/AuthContext';
import { getMatchCharacteristics } from './astrology/matchCharacteristics';

// Add these global variables at the top of the file
let cachedBirthChart: any = null;
let cachedCurrentPositions: any = null;
let cachedCurrentDasha: any = null;
let cachedUserData: any = null;
let cachedUserId: string | null = null;
let cachedDailyNakshatra: any = null;
let cachedMatchCharacteristics: any = null;

// Update the tool definition
const tools = [
    {
        type: "function" as const,
        function: {
            name: 'getDailyNakshatraReport',
            description: 'Get the daily nakshatra prediction for the user if they ask you to make predictions for the day',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    // {
    //     type: "function" as const,
    //     function: {
    //         name: 'getMatchCharacteristics',
    //         description: 'Get compatibility information for the user with a potential partner if asked, or even if asked about specific marriage aspects like sex life, kids, prosperity, etc.',
    //         parameters: {
    //             type: 'object',
    //             properties: {},
    //             required: []
    //         }
    //     }
    // }
];

type AvailableFunctions = {
    getDailyNakshatraReport: (birthDetails: BirthDetails) => Promise<any>;
    getMatchCharacteristics: (matchDetails: MatchDetails) => Promise<any>;
};

const humanizeResponse = async (response: string, client: AzureOpenAI) => {

    const messages = [
        {
            role: "system",
            content: humanizePrompt
        },
        {
            role: "user",
            content: response
        }
    ]

    const completion = await client.chat.completions.create({
        messages: messages as any[],
        model: "gpt-4o",    
    });

    return completion.choices[0].message.content || '';
}

// Add the function implementation map
const availableFunctions: AvailableFunctions = {
    getDailyNakshatraReport: async (birthDetails: BirthDetails) => {
        if (!cachedDailyNakshatra) {
            const result = await getDailyNakshatraReport(birthDetails);
            cachedDailyNakshatra = result;
        }
        return cachedDailyNakshatra;
    },
    getMatchCharacteristics: async (matchDetails: MatchDetails) => {
        if (!cachedMatchCharacteristics) {
            const result = await getMatchCharacteristics(matchDetails);
            cachedMatchCharacteristics = result;
        }
        return cachedMatchCharacteristics;
    }
};

// Add this helper function at the top of the file
function cleanResponse(response: string): string {
    return response.replace(/\*/g, '');
}

const splitResponseTwoWay = async (response: string, client: AzureOpenAI) => {
    const messages = [
        {
            role: "system",
            content: splitMessagePrompt
        },
        {
            role: "user",
            content: response
        }
    ];

    const completion = await client.chat.completions.create({
        messages: messages as any[],
        model: "gpt-4o",
    });

    const splitText = completion.choices[0].message.content?.split('|||') || [response];
    return splitText.length === 2 ? splitText : [response, ''];
};

const splitResponseThreeWay = async (response: string, client: AzureOpenAI) => {
    const messages = [
        {
            role: "system",
            content: splitThreeWayPrompt
        },
        {
            role: "user",
            content: response
        }
    ];

    const completion = await client.chat.completions.create({
        messages: messages as any[],
        model: "gpt-4o",
    });

    const splitText = completion.choices[0].message.content?.split('|||') || [response];
    return splitText.length === 3 ? splitText : [response, '', ''];
};

// Update the response handling in getAstrologicalReading
const handleResponseSplitting = async (response: string, client: AzureOpenAI) => {
    const random = Math.random();
    
    // Only attempt splits if response is long enough
    if (response.length <= 100) {
        return {
            splitResponse: false,
            parts: [response]
        };
    }

    // 15% chance for three-way split
    if (random < 0.15) {
        console.log('Attempting three-way split');
        const [first, second, third] = await splitResponseThreeWay(response, client);
        if (second && third) {
            return {
                splitResponse: true,
                parts: [first.trim(), second.trim(), third.trim()]
            };
        }
    }
    // 25% chance for two-way split
    else if (random < 0.40) {
        console.log('Attempting two-way split');
        const [first, second] = await splitResponseTwoWay(response, client);
        if (second) {
            return {
                splitResponse: true,
                parts: [first.trim(), second.trim()]
            };
        }
    }

    // Default to single response
    return {
        splitResponse: false,
        parts: [response]
    };
};

// Modify the getAstrologicalReading function to potentially split responses
export async function getAstrologicalReading(
    prompt: string,
    previousMessages: GPTMessage[] = [],
    userId: string
) {
    try {
        // If this is the first message or we don't have cached data, fetch the data
        if (previousMessages.length === 0 || !cachedBirthChart || !cachedUserData || cachedUserId !== userId) {
            
            try {
                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (!userDoc.exists()) {
                    console.error('User document not found for userId:', userId);
                    throw new Error('User data not found');
                }

                const userData = userDoc.data();
                const birthDetails: BirthDetails = {
                    date: userData.birthDate,
                    time: userData.birthTime,
                    location: userData.birthPlace
                };

                cachedUserData = userData;
                cachedUserId = userId;
                
                // Use stored birth chart and fetch only current data
                const [currentPositions, currentDasha] = await Promise.all([
                    getCurrentPlanetaryPositions(new Date()),
                    getCurrentDasha(birthDetails)
                ]);

                // Cache the data
                cachedBirthChart = userData.birthChart; // Use stored birth chart
                cachedCurrentPositions = currentPositions;
                cachedCurrentDasha = currentDasha;

                // console.log('Astrological data fetched and cached');
            } catch (firestoreError: any) {
                console.error('Firestore Error Details:', {
                    code: firestoreError.code,
                    message: firestoreError.message,
                    providedUserId: userId,
                    // currentAuthUid: user?.uid || 'no auth user',
                    timestamp: new Date().toISOString()
                });
                
                if (firestoreError.code === 'permission-denied') {
                        throw new Error(`Unable to access user data due to permissions. Requested User ID: ${userId}`);
                }
                throw firestoreError;
            }
        }

        const client = new AzureOpenAI({
            apiKey: process.env.AZURE_OPENAI_API_KEY,
            deployment: "gpt-4o",
            apiVersion: "2024-10-21",
            endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        });

        const messages: GPTMessage[] = [
            { 
                role: "system",
                content: `
                    ${prompt3}
                    For reference, the current date and time is: ${new Date().toISOString()}
                    Always respond in the following language: ${cachedUserData.preferredLanguage}
                `
            }
        ]; 

        let responseMessage: any;
        const maxRetries = 3; // Add safety limit to prevent infinite loops
        let retryCount = 0;

        while (true) {
            try {
                if (retryCount === 0) {
                    // First attempt with full message
                    const userMessage = {
                        role: "user" as const,
                        content: `
                            User Question to be answered: ${prompt}. Details you may use when relevant to the question: 
                            {
                                Birth Chart Data to Focus On: ${JSON.stringify(cachedBirthChart)}
                                Current Planetary Positions You May Use For Transits Alongside Birth Chart if Needed: ${JSON.stringify(cachedCurrentPositions)}
                                Current Vimshottari Dasha You May Use if Needed: ${JSON.stringify(cachedCurrentDasha)}
                                Current date and time to help with the reading: ${new Date().toISOString()}
                                User Name: ${cachedUserData.firstName}
                                User Gender: ${cachedUserData.gender}
                                User Relationship Status: ${cachedUserData.relationshipStatus}
                                User Occupation: ${cachedUserData.occupation}
                            }
                        `
                    };

                    const limitedPreviousMessages = previousMessages.slice(-10);
                    messages.push(...limitedPreviousMessages, userMessage);
                } else {
                    // Subsequent attempts with simplified message
                    console.log("retryCount", retryCount);
                    const simplifiedUserMessage = {
                        role: "user" as const,
                        content: "?"
                    };
                    messages.push(simplifiedUserMessage);
                }

                const completion = await client.chat.completions.create({
                    messages: messages as any[],
                    model: "gpt-4o",
                    tools: tools,
                    tool_choice: "auto"
                });

                responseMessage = completion.choices[0].message;
                break; // Success! Exit the loop

            } catch (error: any) {
                if (error.code === 'content_filter' && retryCount < maxRetries) {
                    retryCount++;
                    continue; // Try again with simplified message
                }
                // If it's not a content filter error or we've hit max retries, rethrow
                throw error;
            }
        }

        if (responseMessage.tool_calls) {
            console.log('Tool call detected:', {
                functionName: responseMessage.tool_calls[0].function.name,
                arguments: responseMessage.tool_calls[0].function.arguments,
                timestamp: new Date().toISOString()
            });
            const toolCall = responseMessage.tool_calls[0];
            const functionName = toolCall.function.name as keyof AvailableFunctions;
            
            let functionResult;
            if (functionName === 'getDailyNakshatraReport') {
                console.log('Calling getDailyNakshatraReport');
                const birthDetails: BirthDetails = {
                    date: cachedUserData.birthDate,
                    time: cachedUserData.birthTime,
                    location: cachedUserData.birthPlace
                };
                functionResult = await availableFunctions[functionName](birthDetails);
                console.log('getDailyNakshatraReport result:', functionResult);
            // } else if (functionName === 'getMatchCharacteristics') {
            //     console.log('Calling getMatchCharacteristics');
            //     const mockBirthDetails = {
            //         date: '2002-12-12',
            //         time: '12:00',
            //         location: {
            //             latitude: cachedUserData.birthPlace.latitude,
            //             longitude: cachedUserData.birthPlace.longitude
            //         }
            //     };
            //     const matchDetails: MatchDetails = 
            //         cachedUserData.gender === 'female' 
            //             ? {
            //                 female: {
            //                     date: cachedUserData.birthDate,
            //                     time: cachedUserData.birthTime,
            //                     location: {
            //                         latitude: cachedUserData.birthPlace.latitude,
            //                         longitude: cachedUserData.birthPlace.longitude
            //                     }
            //                 },
            //                 male: mockBirthDetails
            //             }
            //             : {
            //                 male: {
            //                     date: cachedUserData.birthDate,
            //                     time: cachedUserData.birthTime,
            //                     location: {
            //                         latitude: cachedUserData.birthPlace.latitude,
            //                         longitude: cachedUserData.birthPlace.longitude
            //                     }
            //                 },
            //                 female: mockBirthDetails
            //             };
            //     functionResult = await availableFunctions[functionName](matchDetails);
            //     console.log('getMatchCharacteristics result:', functionResult);
            }
            
            // Convert OpenAI message to GPTMessage format
            const assistantMessage: GPTMessage = {
                role: 'assistant',
                content: responseMessage.content || '',
                tool_calls: responseMessage.tool_calls
            };

            // Add the assistant's message and tool response
            messages.push(
                assistantMessage,
                {
                    role: 'tool',
                    content: `
                    ${JSON.stringify(functionResult)} 
                    `,
                    tool_call_id: toolCall.id
                }
            );

            // Make a second API call to get the final response
            const secondResponse = await client.chat.completions.create({
                messages: messages as any[],
                model: "gpt-4o",
            });

            const finalResponse = cleanResponse(secondResponse.choices[0].message.content || '');

            return await handleResponseSplitting(finalResponse, client);
        }

        const finalResponse = cleanResponse(responseMessage.content || '');
        return await handleResponseSplitting(finalResponse, client);

    } catch (error: any) {
        // const { user } = useAuth();
        
        console.error('GPT Service Error:', {
            error: error.message,
            code: error.code,
            providedUserId: userId,
            // currentAuthUid: user?.uid || 'no auth user',
            timestamp: new Date().toISOString(),
            stack: error.stack
        });
        throw error;
    }
}
