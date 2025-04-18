import { BirthDetails, AstrologyAPIRequest } from '@/types';
import { makeAstrologyApiCall } from './astrologyApi';

export async function getCurrentDasha(details: BirthDetails): Promise<{
    currentVdasha: any;
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
        const currentVdasha = await makeAstrologyApiCall('current_vdasha', requestData);

        return {
            currentVdasha
        };
    } catch (error) {
        console.error('Current Vimshottari Dasha API Error:', error);
        throw error;
    }
}
