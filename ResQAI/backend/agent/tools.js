import fetch from 'node-fetch';

class DisasterTools {
  // Weather & Rainfall Data
  async getWeatherData(lat, lon) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,rain,wind_speed_10m&daily=rain_sum,temperature_2m_max&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();
      
      const current = {
        temperature: data.hourly.temperature_2m[0],
        rainfall: data.hourly.rain[0],
        windSpeed: data.hourly.wind_speed_10m[0],
        dailyRain: data.daily.rain_sum[0]
      };

      return {
        location: { lat, lon },
        current,
        floodRisk: current.dailyRain > 50 ? 'HIGH' : current.dailyRain > 20 ? 'MEDIUM' : 'LOW',
        raw: data
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return { error: 'Failed to fetch weather data' };
    }
  }

  // NASA Satellite Disaster Events
  async getDisasterEvents(limit = 10) {
    try {
      const response = await fetch(`${process.env.NASA_API_URL}?limit=${limit}&status=open`);
      const data = await response.json();
      
      const events = data.events.map(event => ({
        id: event.id,
        title: event.title,
        category: event.categories[0]?.title || 'Unknown',
        location: event.geometry?.[0]?.coordinates || null,
        date: event.geometry?.[0]?.date || null,
        severity: this.calculateSeverity(event)
      }));

      return { events, total: events.length };
    } catch (error) {
      console.error('NASA API error:', error);
      return { error: 'Failed to fetch disaster events' };
    }
  }

  // Enhanced Disaster Prediction Logic
  async predictDisaster(sensorData, weatherData) {
    const predictions = [];

    // Earthquake prediction with ML-like scoring
    if (sensorData.earthquake > 3.0) {
      const probability = Math.min(sensorData.earthquake * 15 + (Math.random() * 10), 95);
      predictions.push({
        type: 'earthquake',
        probability: Math.round(probability),
        severity: sensorData.earthquake > 6 ? 'CRITICAL' : sensorData.earthquake > 5 ? 'HIGH' : 'MEDIUM',
        timeframe: sensorData.earthquake > 6 ? '1-6 hours' : '24-48 hours',
        confidence: sensorData.earthquake > 5 ? 0.9 : 0.7
      });
    }

    // Advanced flood prediction
    const floodScore = (weatherData.current?.dailyRain || 0) + (sensorData.flood || 0);
    if (floodScore > 60) {
      predictions.push({
        type: 'flood',
        probability: Math.min(floodScore * 0.8, 90),
        severity: floodScore > 120 ? 'CRITICAL' : floodScore > 90 ? 'HIGH' : 'MEDIUM',
        timeframe: floodScore > 120 ? '2-4 hours' : '6-12 hours',
        confidence: weatherData.current?.dailyRain > 30 ? 0.85 : 0.6
      });
    }

    // Fire prediction with weather correlation
    const fireRisk = sensorData.fire + 
      (weatherData.current?.temperature > 35 ? 20 : 0) + 
      (weatherData.current?.windSpeed > 20 ? 15 : 0);
    
    if (fireRisk > 70) {
      predictions.push({
        type: 'fire',
        probability: Math.min(fireRisk * 1.1, 95),
        severity: fireRisk > 100 ? 'CRITICAL' : fireRisk > 85 ? 'HIGH' : 'MEDIUM',
        timeframe: fireRisk > 100 ? '30 minutes - 2 hours' : '2-6 hours',
        confidence: sensorData.fire > 80 ? 0.9 : 0.7
      });
    }

    return predictions;
  }

  // Helper Methods
  calculateSeverity(event) {
    const category = event.categories[0]?.title?.toLowerCase() || '';
    if (category.includes('severe') || category.includes('major')) return 'CRITICAL';
    if (category.includes('moderate')) return 'HIGH';
    return 'MEDIUM';
  }
}

export default DisasterTools;