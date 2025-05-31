const { makeAstrologyApiCall } = require('./astrologyApi');

async function getCompatibilityReport(details) {

    const m_date = new Date(`${details.m_date}T${details.m_time}`);
    const f_date = new Date(`${details.f_date}T${details.f_time}`);

    const requestData = {
        m_day: m_date.getDate(),
        m_month: m_date.getMonth() + 1,
        m_year: m_date.getFullYear(),
        m_hour: m_date.getHours(),
        m_min: m_date.getMinutes(),
        m_lat: details.m_location.latitude,
        m_lon: details.m_location.longitude,
        m_tzone: 5.5,
        f_day: f_date.getDate(),
        f_month: f_date.getMonth() + 1,
        f_year: f_date.getFullYear(),
        f_hour: f_date.getHours(),
        f_min: f_date.getMinutes(),
        f_lat: details.f_location.latitude,
        f_lon: details.f_location.longitude,
        f_tzone: 5.5
    };

    try {
        const compatibilityReport = await makeAstrologyApiCall('match_ashtakoot_points', requestData);

        return { compatibilityReport };
    }
    catch (error) {
        console.error('Compatibility Report API Error:', error);
        throw error;
    }
}

module.exports = { getCompatibilityReport };