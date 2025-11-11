"""
Test heat wave prediction with lower threshold for demonstration
"""

from weather_prediction import HeatWavePredictor
import json

class TestHeatWavePredictor(HeatWavePredictor):
    def predict_heat_wave(self, city="Delhi"):
        """Modified version with lower thresholds for testing"""
        forecast = self.get_weather_forecast(city)
        
        if "error" in forecast:
            return {"error": forecast["error"]}
        
        heat_wave_days = []
        warnings = []
        
        # LOWER thresholds for testing (since it's winter)
        HEAT_WAVE_TEMP = 25  # 25°C for testing
        SEVERE_HEAT_WAVE_TEMP = 30  # 30°C severe heat wave
        
        for item in forecast.get("list", [])[:8]:  # Next 2 days
            temp = item["main"]["temp"]
            date = item["dt_txt"] if "dt_txt" in item else "Unknown date"
            
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
            "heat_wave_days": heat_wave_days,
            "warnings": warnings,
            "safety_advice": self.get_heat_wave_advice(len(heat_wave_days))
        }

# Test with lower thresholds
api_key = "44ff1c9277f3249525c8130e8921f139"
test_predictor = TestHeatWavePredictor(api_key)

result = test_predictor.predict_heat_wave("Delhi")
print("TEST PREDICTION WITH LOWER THRESHOLDS:")
print(json.dumps(result, indent=2))