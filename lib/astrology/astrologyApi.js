const fetch = require('node-fetch'); // Make sure to install node-fetch if not already

const BASE_URL = 'https://json.astrologyapi.com/v1';

const USER_ID = process.env.ASTROLOGY_USER_ID;
const API_KEY = process.env.ASTROLOGY_API_KEY;

async function makeAstrologyApiCall(endpoint, requestData) {

    if (!USER_ID || !API_KEY) {
        throw new Error(`Astrology API credentials not configured - UserId: ${!!USER_ID}, ApiKey: ${!!API_KEY}`);
    }

    const auth = Buffer.from(`${USER_ID}:${API_KEY}`).toString('base64');

    try {
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

module.exports = { makeAstrologyApiCall };
