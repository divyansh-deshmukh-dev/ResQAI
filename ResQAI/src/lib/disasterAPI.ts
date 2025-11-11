// Disaster API service for real-time data
export class DisasterAPI {
  
  // Get recent earthquakes from USGS
  static async getEarthquakes(lat?: number, lon?: number) {
    try {
      const radius = lat && lon ? `&latitude=${lat}&longitude=${lon}&maxradiuskm=500` : '';
      const response = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=5&minmagnitude=3${radius}`
      );
      const data = await response.json();
      
      return data.features.map((eq: any) => ({
        magnitude: eq.properties.mag,
        location: eq.properties.place,
        time: new Date(eq.properties.time),
        coordinates: eq.geometry.coordinates
      }));
    } catch {
      return [];
    }
  }

  // Get weather alerts from OpenWeatherMap (Free API)
  static async getWeatherAlerts(lat: number, lon: number) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=demo&units=metric`
      );
      
      if (!response.ok) {
        // Fallback to IMD Open Data (India Meteorological Department)
        const imdResponse = await fetch(
          `https://mausam.imd.gov.in/imd_latest/contents/rainfall_data.php`
        );
        return {
          weather: 'Rain',
          description: 'Heavy rainfall expected',
          source: 'IMD'
        };
      }
      
      const data = await response.json();
      return {
        weather: data.weather[0]?.main,
        description: data.weather[0]?.description,
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity
      };
    } catch {
      return null;
    }
  }

  // Get active fires from NASA FIRMS (Free API)
  static async getActiveFires(lat: number, lon: number) {
    try {
      // NASA FIRMS API (Free - no key required for MODIS data)
      const response = await fetch(
        `https://firms.modaps.eosdis.nasa.gov/api/country/csv/7d/IND`
      );
      
      if (response.ok) {
        const csvData = await response.text();
        const lines = csvData.split('\n').slice(1, 6); // Get first 5 fires
        
        return lines.map(line => {
          const [country, lat_fire, lon_fire, brightness, scan, track, acq_date, acq_time, satellite, confidence] = line.split(',');
          const distance = this.calculateDistance(lat, lon, parseFloat(lat_fire), parseFloat(lon_fire));
          
          return {
            location: `Fire detected ${distance.toFixed(1)}km away`,
            confidence: parseInt(confidence) || 0,
            brightness: parseFloat(brightness) || 0,
            distance: `${distance.toFixed(1)} km`,
            detected: new Date(`${acq_date} ${acq_time}`)
          };
        }).filter(fire => parseFloat(fire.distance) < 100); // Within 100km
      }
      
      return [];
    } catch {
      return [];
    }
  }

  // Calculate distance between two coordinates
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Generate disaster alert message
  static async generateDisasterAlert(lat?: number, lon?: number) {
    const alerts = [];
    
    // Check earthquakes
    const earthquakes = await this.getEarthquakes(lat, lon);
    if (earthquakes.length > 0) {
      const recent = earthquakes[0];
      const timeAgo = Math.floor((Date.now() - recent.time.getTime()) / (1000 * 60));
      alerts.push(
        `🚨 Earthquake Alert: Magnitude ${recent.magnitude} detected near ${recent.location} (${timeAgo} mins ago). Stay away from buildings and avoid elevators.`
      );
    }

    // Check weather if location available
    if (lat && lon) {
      const weather = await this.getWeatherAlerts(lat, lon);
      if (weather && (weather.weather === 'Rain' || weather.weather === 'Thunderstorm')) {
        alerts.push(
          `🌧️ Weather Alert: ${weather.description} in your area. Heavy rainfall possible - avoid low-lying areas and flooded roads.`
        );
      }
    }

    // Check fires
    const fires = await this.getActiveFires(lat || 0, lon || 0);
    if (fires.length > 0) {
      const fire = fires[0];
      alerts.push(
        `🔥 Fire Alert: Active fire detected ${fire.location} (${fire.distance} away). Monitor air quality and prepare for evacuation if needed.`
      );
    }

    return alerts.length > 0 
      ? alerts.join('\n\n') 
      : '✅ No immediate disaster alerts in your area. Stay prepared and monitor official channels.';
  }
}