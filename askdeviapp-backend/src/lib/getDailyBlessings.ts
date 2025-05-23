import { AzureOpenAI } from "openai";
import { BirthDetails } from "@/types";
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { getDailyNumerologyPrediction } from "./astrology/numerlogyPrediction";

// In-memory cache to avoid repeated Firebase calls
const dailyBlessingsCache = new Map<string, {   
  data: any;
  timestamp: number;
}>();

// System prompts for the GPT models
const luckyMantraPrompt = `You are an expert in Vedic astrology and Sanskrit mantras. 
Based on the user's birth chart (Kundli) and current planetary positions, recommend a powerful and 
appropriate mantra for the day that will bring positive energy and blessings.

You must respond with a valid JSON object containing exactly these three properties:
{
  "latinScript": "The mantra in Latin script (e.g., Om Shreem Hreem Kleem)",
  "sanskritScript": "The same mantra in Sanskrit script (e.g., ॐ श्रीं ह्रीं क्लीं)",
  "direction": "A brief 5-10 word long, specific direction for how to use the mantra"
}

The mantra should:
- Be authentic and traditionally used in Vedic practices
- Be relevant to the user's current astrological influences based on their birth chart
- Be respectful of Hindu traditions and practices
- Address a specific need indicated by the user's birth chart (prosperity, protection, clarity, etc.)

Your direction should specify:
- How many times to chant (typically 11, 21, 108, or 1008 times)
- What specific benefit the mantra will provide (e.g., mental peace, financial prosperity, protection from negative energies)

Ensure your response is a valid, parseable JSON object with these three properties only.`;

const auspiciousTimePrompt = `You are an expert in Muhurta, the Vedic astrological practice of determining 
auspicious times for activities. Based on the user's birth chart and today's planetary positions, 
identify the most auspicious time period for the user today.

You must respond with ONLY a time frame in the format "H:MM AM/PM - H:MM AM/PM" (for example: "1:30 PM - 3:30 PM" or "11:00 AM - 12:30 PM").

The time frame should:
1. Be between 1-3 hours in duration
2. Represent the most auspicious period of the day according to Vedic astrology principles
3. Be based on the user's birth chart and current planetary positions
4. Be in standard 12-hour format with AM/PM designation

Do not include any explanations, introductions, or additional text. Your entire response should be just the time frame.`;

function cleanResponse(response: string): string {
    // Remove asterisks
    let cleaned = response.replace(/\*/g, '');
    
    // Remove single or double quotes if they wrap the entire message
    cleaned = cleaned.replace(/^["'](.+)["']$/, '$1');
    return cleaned;
}

// Add this function to clean the response
function cleanJsonResponse(response: string): string {
    // Remove markdown code block syntax if present
    if (response.startsWith('```') && response.endsWith('```')) {
        // Extract content between the code block markers
        const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            return codeBlockMatch[1].trim();
        }
    }
    
    // If no code block or extraction failed, return the original
    return response;
}

// Helper to get today's date in IST format (YYYY-MM-DD)
function getTodayDateIST(): string {
    const now = new Date();
    // IST is UTC+5:30
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return istTime.toISOString().split('T')[0];
}

// Define a consistent set of colors that can be used throughout the app
const LUCKY_COLORS = [
    "Red", "Blue", "Green", "Yellow", "Purple", 
    "Orange", "Pink", "White", "Gold", "Silver", 
    "Turquoise", "Indigo", "Violet", "Saffron", "Maroon",
    "Crimson", "Magenta", "Black", "Brown", "Saffron Orange"
];

// Predefined list of mantras
const MANTRA_LIST = [
  {
    "latinScript": "Om Shreem Hreem Kleem",
    "sanskritScript": "ॐ श्रीं ह्रीं क्लीं",
    "direction": "Chant 108 times for wealth and attraction."
  },
  {
    "latinScript": "Om Namah Shivaya",
    "sanskritScript": "ॐ नमः शिवाय",
    "direction": "Chant 108 times for inner peace and protection."
  },
  {
    "latinScript": "Om Namo Narayanaya",
    "sanskritScript": "ॐ नमो नारायणाय",
    "direction": "Chant 108 times for spiritual growth and calm."
  },
  {
    "latinScript": "Om Aim Hreem Kleem",
    "sanskritScript": "ॐ ऐं ह्रीं क्लीं",
    "direction": "Chant 108 times for clarity, power, and magnetism."
  },
  {
    "latinScript": "Om Kleem Krishnaya Namah",
    "sanskritScript": "ॐ क्लीं कृष्णाय नमः",
    "direction": "Chant 108 times for love and divine joy."
  },
  {
    "latinScript": "Om Hreem Namah Shivaya",
    "sanskritScript": "ॐ ह्रीं नमः शिवाय",
    "direction": "Chant 108 times for purification and spiritual strength."
  },
  {
    "latinScript": "Om Shreem Maha Lakshmiyei",
    "sanskritScript": "ॐ श्रीं महालक्ष्म्यै",
    "direction": "Chant 108 times for financial prosperity."
  },
  {
    "latinScript": "Om Dum Durgayei Namah",
    "sanskritScript": "ॐ दुं दुर्गायै नमः",
    "direction": "Chant 108 times for protection from negative forces."
  },
  {
    "latinScript": "Om Gam Ganapataye Namah",
    "sanskritScript": "ॐ गं गणपतये नमः",
    "direction": "Chant 108 times to remove obstacles and begin anew."
  },
  {
    "latinScript": "Om Namo Bhagavate Vasudevaya",
    "sanskritScript": "ॐ नमो भगवते वासुदेवाय",
    "direction": "Chant 108 times for liberation and divine grace."
  },
  {
    "latinScript": "Om Hreem Shreem Krim",
    "sanskritScript": "ॐ ह्रीं श्रीं क्रीं",
    "direction": "Chant 108 times for energy balance and inner power."
  },
  {
    "latinScript": "Om Aim Saraswatyai Namah",
    "sanskritScript": "ॐ ऐं सरस्वत्यै नमः",
    "direction": "Chant 108 times for wisdom and academic success."
  },
  {
    "latinScript": "Om Ram Rahave Namah",
    "sanskritScript": "ॐ रां राहवे नमः",
    "direction": "Chant 108 times to reduce Rahu's astrological impact."
  },
  {
    "latinScript": "Om Krem Krom Hum Krom",
    "sanskritScript": "ॐ क्रें क्रों हुं क्रों",
    "direction": "Chant 108 times for intense spiritual transformation."
  },
  {
    "latinScript": "Om Krim Kaliye Namah",
    "sanskritScript": "ॐ क्रीं काल्यै नमः",
    "direction": "Chant 108 times for strength and destruction of ego."
  },
  {
    "latinScript": "Om Hanumate Namah",
    "sanskritScript": "ॐ हनुमते नमः",
    "direction": "Chant 108 times for courage and protection."
  },
  {
    "latinScript": "Om Sri Rama Jai Rama",
    "sanskritScript": "ॐ श्री राम जय राम",
    "direction": "Chant 108 times for peace and devotion."
  },
  {
    "latinScript": "Om Dram Dattatreyaya Namah",
    "sanskritScript": "ॐ द्रां दत्तात्रेयाय नमः",
    "direction": "Chant 108 times for knowledge and healing."
  },
  {
    "latinScript": "Om Vajra Sattva Hum",
    "sanskritScript": "ॐ वज्रसत्त्व हुं",
    "direction": "Chant 108 times for purification and karma cleansing."
  },
  {
    "latinScript": "Om Shanti Shanti Shanti",
    "sanskritScript": "ॐ शान्ति शान्ति शान्ति",
    "direction": "Chant 11 times for peace in body, mind, and soul."
  }
];

// Helper function to generate a random time window
function generateRandomTimeWindow(): string {
    // Generate a random hour between 5 AM and 8 PM (reasonable hours for spiritual activities)
    const startHour = Math.floor(Math.random() * 16) + 5; // 5 AM to 8 PM
    const startMinute = Math.floor(Math.random() * 60); // Any minute between 0-59
    
    // Generate a random duration between 1 and 3 hours
    const durationHours = Math.floor(Math.random() * 2) + 1; // 1 or 2 hours
    const durationMinutes = Math.floor(Math.random() * 60); // Any minute between 0-59
    
    // Calculate end time
    let endHour = startHour + durationHours;
    let endMinute = startMinute + durationMinutes;
    
    // Handle minute overflow
    if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
    }
    
    // Format times
    const formatTime = (hour: number, minute: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    };
    
    return `${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`;
}

export async function getDailyBlessings(userId: string): Promise<{ 
  luckyMantra: { 
    latinScript: string; 
    sanskritScript: string; 
    direction: string 
  }; 
  auspiciousTime: string;
  luckyNumber: string;
  luckyColor: string;
  date: string;
}> {
    try {
        const todayIST = getTodayDateIST();
        const cacheKey = `${userId}_${todayIST}`;
        
        // Check in-memory cache first
        if (dailyBlessingsCache.has(cacheKey)) {
            console.log('Using in-memory cache for daily blessings');
            return dailyBlessingsCache.get(cacheKey)!.data;
        }
        
        // Check Firebase for existing daily blessings
        const blessingsRef = doc(db, 'dailyBlessings', cacheKey);
        const blessingsDoc = await getDoc(blessingsRef);
        
        // If we have today's blessings in Firebase, use them
        if (blessingsDoc.exists()) {
            const cachedBlessings = blessingsDoc.data();
            console.log('Using Firebase cached daily blessings');
            
            // Store in memory cache
            dailyBlessingsCache.set(cacheKey, {
                data: cachedBlessings,
                timestamp: Date.now()
            });
            
            return cachedBlessings as any;
        }
        
        // If we don't have cached data, generate new blessings
        console.log('Generating new daily blessings');
        
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            throw new Error('User data not found');
        }

        const userData = userDoc.data();
        const birthDetails: BirthDetails = {
            date: userData.birthDate,
            time: userData.birthTime,
            location: userData.birthPlace
        };

        // Instead of calling numerology prediction, randomly select lucky numbers and color
        const luckyNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        
        const luckyNumber = luckyNumbers[Math.floor(Math.random() * luckyNumbers.length)];
        const luckyColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];

        // Randomly select a mantra from the predefined list
        const luckyMantra = MANTRA_LIST[Math.floor(Math.random() * MANTRA_LIST.length)];

        // Generate random auspicious time
        const auspiciousTime = generateRandomTimeWindow();

        const dailyBlessings = {
            luckyMantra,
            auspiciousTime,
            luckyNumber,
            luckyColor,
            date: todayIST,
            userId: userId
        };

        // Store the results in Firebase
        await setDoc(blessingsRef, dailyBlessings);
        
        // Store in memory cache
        dailyBlessingsCache.set(cacheKey, {
            data: dailyBlessings,
            timestamp: Date.now()
        });
        
        // Log the final result
        console.log('Final daily blessings result:', dailyBlessings);

        return dailyBlessings;

    } catch (error: any) {
        console.error('Daily Blessings Generation Error:', {
            error: error.message,
            code: error.code,
            providedUserId: userId,
            timestamp: new Date().toISOString(),
            stack: error.stack
        });
        
        // Return default values in case of error
        const todayIST = getTodayDateIST();
        return {
            luckyMantra: MANTRA_LIST[0], // Use first mantra as default
            auspiciousTime: "10:00 AM - 12:00 PM",
            luckyNumber: "9",
            luckyColor: "Saffron Orange",
            date: todayIST
        };
    }
} 