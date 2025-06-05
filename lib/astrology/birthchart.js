const { makeAstrologyApiCall } = require('./astrologyApi');

async function getBirthChart(details) {
    // Parse date and time
    const date = new Date(`${details.date}T${details.time}`);

    const requestData = {
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
        const [birthDetails, astroDetails, planets] = await Promise.all([
            makeAstrologyApiCall('birth_details', requestData),
            makeAstrologyApiCall('astro_details', requestData),
            makeAstrologyApiCall('planets', requestData),
        ]);

        return {
            birthDetails,
            astroDetails,
            planets
        };
    } catch (error) {
        console.error('Birth Chart API Error:', error);
        throw error;
    }
}

module.exports = { getBirthChart };
