import { MatchDetails, MatchAPIRequest } from '@/types';
import { makeAstrologyApiCall } from './astrologyApi';

export async function getMatchCharacteristics(details: MatchDetails): Promise<{
    ashtakootPoints: any;
    dashakootPoints: any;
    obstructions: any;
}> {
    // Parse dates and times
    const maleDate = new Date(`${details.male.date}T${details.male.time}`);
    const femaleDate = new Date(`${details.female.date}T${details.female.time}`);

    const requestData: MatchAPIRequest = {
        m_day: maleDate.getDate(),
        m_month: maleDate.getMonth() + 1,
        m_year: maleDate.getFullYear(),
        m_hour: maleDate.getHours(),
        m_min: maleDate.getMinutes(),
        m_lat: details.male.location.latitude,
        m_lon: details.male.location.longitude,
        m_tzone: 5.5,
        f_day: femaleDate.getDate(),
        f_month: femaleDate.getMonth() + 1,
        f_year: femaleDate.getFullYear(),
        f_hour: femaleDate.getHours(),
        f_min: femaleDate.getMinutes(),
        f_lat: details.female.location.latitude,
        f_lon: details.female.location.longitude,
        f_tzone: 5.5
    };

    try {
        // Make all API calls in parallel
        const [ashtakootPoints, dashakootPoints, obstructions] = await Promise.all([
            makeAstrologyApiCall('match_ashtakoot_points', requestData),
            makeAstrologyApiCall('match_dashakoot_points', requestData),
            makeAstrologyApiCall('match_obstructions', requestData),
        ]);

        // Combine all responses
        return {
            ashtakootPoints,
            dashakootPoints,
            obstructions
        };
    } catch (error) {
        console.error('Match Characteristics API Error:', error);
        throw error;
    }
}
