const { makeAstrologyApiCall } = require('./astrologyApi');

async function getDailyNumerologyPrediction(details) {
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
    const prediction = await makeAstrologyApiCall('numero_prediction/daily', requestData);

    return {
      luckyNumber: prediction.lucky_number,
      luckyColor: prediction.lucky_color
    };
  } catch (error) {
    console.error('Daily Numerology Prediction API Error:', error);
    throw error;
  }
}

module.exports = { getDailyNumerologyPrediction };
