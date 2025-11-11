"""
Heat Wave Prediction for ResQ AI
Uses OpenWeatherMap free API to predict heat waves
"""

import requests
import json
from datetime import datetime, timedelta

class HeatWavePredictor:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "http://api.openweathermap.org/data/2.5"
        
    def get_weather_forecast(self, city="Delhi"):
        """Get 5-day weather forecast"""
        try:
            url = f"{self.base_url}/forecast?q={city},IN&appid={self.api_key}&units=metric"
            response = requests.get(url)
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def predict_heat_wave(self, city="Delhi"):
        """Predict heat wave conditions"""
        forecast = self.get_weather_forecast(city)
        
        if "error" in forecast:
            return {"error": forecast["error"]}
        
        heat_wave_days = []
        warnings = []
        
        # Heat wave thresholds for India
        HEAT_WAVE_TEMP = 40  # 40°C for plains
        SEVERE_HEAT_WAVE_TEMP = 45  # 45°C severe heat wave
        
        for item in forecast.get("list", [])[:8]:  # Next 2 days (8 forecasts)
            temp = item["main"]["temp"]
            date = datetime.fromtimestamp(item["dt"]).strftime("%Y-%m-%d %H:%M")
            
            if temp >= SEVERE_HEAT_WAVE_TEMP:
                heat_wave_days.append({
                    "date": date,
                    "temp": temp,
                    "severity": "SEVERE HEAT WAVE",
                    "risk": "EXTREME"
                })
                warnings.append(f"SEVERE HEAT WAVE WARNING: {temp}°C on {date}")
            elif temp >= HEAT_WAVE_TEMP:
                heat_wave_days.append({
                    "date": date,
                    "temp": temp,
                    "severity": "HEAT WAVE",
                    "risk": "HIGH"
                })
                warnings.append(f"Heat Wave Alert: {temp}°C on {date}")
        
        return {
            "city": city,
            "prediction_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "heat_wave_days": heat_wave_days,
            "warnings": warnings,
            "safety_advice": self.get_heat_wave_advice(len(heat_wave_days))
        }
    
    def get_heat_wave_advice(self, heat_wave_count):
        """Get safety advice based on heat wave prediction"""
        if heat_wave_count == 0:
            return "No heat wave predicted. Stay hydrated and avoid peak sun hours."
        elif heat_wave_count <= 2:
            return "Heat wave conditions expected. Stay indoors 12-3 PM, drink water frequently, wear light clothes."
        else:
            return "SEVERE heat wave conditions! Avoid outdoor activities, stay in AC/cooled areas, drink ORS, watch for heat stroke symptoms."

# Test function
def test_heat_wave_prediction():
    # You need to get free API key from openweathermap.org
    api_key = "your_openweather_api_key_here"  # Replace with actual key
    
    predictor = HeatWavePredictor(api_key)
    result = predictor.predict_heat_wave("Delhi")
    
    print("HEAT WAVE PREDICTION:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_heat_wave_prediction()