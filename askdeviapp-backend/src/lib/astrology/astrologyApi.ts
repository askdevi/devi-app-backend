const BASE_URL = 'https://json.astrologyapi.com/v1';
// const USER_ID = process.env.ASTROLOGY_USER_ID;
// const API_KEY = process.env.ASTROLOGY_API_KEY;

export async function makeAstrologyApiCall(endpoint: string, requestData: any) {
    // Debug logging
    // console.log('Making API call to endpoint:', endpoint);
    // console.log('Environment check:', {
    //     hasUserId: !!USER_ID,
    //     hasApiKey: !!API_KEY,
    //     baseUrl: BASE_URL
    // });

    const USER_ID = "635773";
    const API_KEY = "4a7bb0afe0afce4f3945d3b934424fb95e21183e";

    if (!USER_ID || !API_KEY) {
        throw new Error(`Astrology API credentials not configured - UserId: ${!!USER_ID}, ApiKey: ${!!API_KEY}`);
    }

    const auth = Buffer.from(`${USER_ID}:${API_KEY}`).toString('base64');
    
    try {
        // console.log('Sending request to:', `${BASE_URL}/${endpoint}`);
        
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${endpoint}):`, {
                status: response.status,
                statusText: response.statusText,
                errorText,
                requestData
            });
            throw new Error(`Failed to fetch ${endpoint} details: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        // console.log(`Successful response from ${endpoint}:`, {
        //     dataReceived: !!data,
        //     dataType: typeof data
        // });

        return data;
    } catch (error) {
        console.error('Detailed API error:', {
            endpoint,
            error: error instanceof Error ? error.message : 'Unknown error',
            requestData,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}
