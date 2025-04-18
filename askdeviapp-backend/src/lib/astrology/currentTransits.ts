import { makeAstrologyApiCall } from './astrologyApi';

const DELHI_COORDINATES = {
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5 // IST
};

export async function getCurrentPlanetaryPositions(date: Date) {
    try {
        const requestData = {
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            hour: date.getHours(),
            min: date.getMinutes(),
            lat: DELHI_COORDINATES.latitude,
            lon: DELHI_COORDINATES.longitude,
            tzone: DELHI_COORDINATES.timezone
        };

        return await makeAstrologyApiCall('planets', requestData);
    } catch (error) {
        console.error('Planetary Positions API Error:', error);
        throw error;
    }
}
