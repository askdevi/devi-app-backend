const { makeAstrologyApiCall } = require('./astrologyApi');

async function getCurrentDasha(details) {
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
        const currentVdasha = await makeAstrologyApiCall('current_vdasha', requestData);

        return { currentVdasha };
    } catch (error) {
        console.error('Current Vimshottari Dasha API Error:', error);
        throw error;
    }
}

module.exports = { getCurrentDasha };
