import { BirthDetails, AstrologyAPIRequest } from '@/types';
import { makeAstrologyApiCall } from './astrologyApi';

export async function getBirthChart(details: BirthDetails): Promise<{
    birthDetails: any;
    astroDetails: any;
    planets: any;
    ghatChakra: any;
}> {

    // Parse date and time
    const date = new Date(`${details.date}T${details.time}`);

    const requestData: AstrologyAPIRequest = {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        hour: date.getHours(),
        min: date.getMinutes(),
        lat: details.location.latitude,
        lon: details.location.longitude,
        tzone: 5.5
    };

    try {

        // Make all API calls in parallel
        const [birthDetails, astroDetails, planets, ghatChakra] = await Promise.all([
            makeAstrologyApiCall('birth_details', requestData),
            makeAstrologyApiCall('astro_details', requestData),
            makeAstrologyApiCall('planets', requestData),
            makeAstrologyApiCall('ghat_chakra', requestData),
        ]);

        // Combine all responses with headers
        return {
            birthDetails,
            astroDetails,
            planets,
            ghatChakra
        };
    } catch (error) {
        console.error('Birth Chart API Error:', error);
        throw error;
    }
} 