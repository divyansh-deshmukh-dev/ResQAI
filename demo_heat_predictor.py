"""
Demo Heat Wave Predictor - Simulates heat wave conditions for testing
"""

from datetime import datetime

class DemoHeatWavePredictor:
    def __init__(self):
        pass
    
    def predict_heat_wave(self, city="Delhi"):
        """Demo version that simulates heat wave conditions"""
        
        # Simulate different scenarios based on city
        if city.lower() == "delhi":
            return {
                "city": city,
                "prediction_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "heat_wave_days": [
                    {
                        "date": "2024-11-10 15:00",
                        "temp": 42.5,
                        "severity": "HEAT WAVE",
                        "risk": "HIGH"
                    },
                    {
                        "date": "2024-11-11 12:00", 
                        "temp": 46.2,
                        "severity": "SEVERE HEAT WAVE",
                        "risk": "EXTREME"
                    }
                ],
                "warnings": [
                    "Heat Wave Alert: 42.5°C on 2024-11-10 15:00",
                    "SEVERE HEAT WAVE WARNING: 46.2°C on 2024-11-11 12:00"
                ],
                "safety_advice": "SEVERE heat wave conditions! Avoid outdoor activities, stay in AC/cooled areas, drink ORS, watch for heat stroke symptoms."
            }
        elif city.lower() == "mumbai":
            return {
                "city": city,
                "prediction_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "heat_wave_days": [
                    {
                        "date": "2024-11-10 14:00",
                        "temp": 41.8,
                        "severity": "HEAT WAVE", 
                        "risk": "HIGH"
                    }
                ],
                "warnings": ["Heat Wave Alert: 41.8°C on 2024-11-10 14:00"],
                "safety_advice": "Heat wave conditions expected. Stay indoors 12-3 PM, drink water frequently, wear light clothes."
            }
        else:
            # No heat wave for other cities
            return {
                "city": city,
                "prediction_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "heat_wave_days": [],
                "warnings": [],
                "safety_advice": "No heat wave predicted. Stay hydrated and avoid peak sun hours."
            }