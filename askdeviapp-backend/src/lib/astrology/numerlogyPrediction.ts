import { BirthDetails, AstrologyAPIRequest } from '@/types';
import { makeAstrologyApiCall } from './astrologyApi';

interface NumerologyPrediction {
  lucky_number: string;
  lucky_color: string;
}

export async function getDailyNumerologyPrediction(details: BirthDetails): Promise<{
  luckyNumber: string;
  luckyColor: string;
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
    const prediction = await makeAstrologyApiCall('numero_prediction/daily', requestData) as NumerologyPrediction;

    return {
      luckyNumber: prediction.lucky_number,
      luckyColor: prediction.lucky_color
    };
  } catch (error) {
    console.error('Daily Numerology Prediction API Error:', error);
    throw error;
  }
} 