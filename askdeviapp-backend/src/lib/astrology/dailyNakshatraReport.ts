import { BirthDetails, AstrologyAPIRequest } from '@/types';
import { makeAstrologyApiCall } from './astrologyApi';

export async function getDailyNakshatraReport(details: BirthDetails): Promise<{
    dailyNakshatra: any;
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
        const dailyNakshatra = await makeAstrologyApiCall('daily_nakshatra_prediction', requestData);

        return {
            dailyNakshatra
        };
    } catch (error) {
        console.error('Daily Nakshatra Report API Error:', error);
        throw error;
    }
}
