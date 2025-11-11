"""
Check actual current temperatures
"""

from weather_prediction import HeatWavePredictor

api_key = "44ff1c9277f3249525c8130e8921f139"
predictor = HeatWavePredictor(api_key)

forecast = predictor.get_weather_forecast("Delhi")

print("Current forecast for Delhi:")
if "list" in forecast:
    for i, item in enumerate(forecast["list"][:5]):
        temp = item["main"]["temp"]
        date = item.get("dt_txt", "Unknown")
        print(f"{i+1}. {date}: {temp}°C")
else:
    print("Error:", forecast)