"""
Test weather prediction directly
"""

from weather_prediction import HeatWavePredictor

# Test the weather API directly
api_key = "44ff1c9277f3249525c8130e8921f139"
predictor = HeatWavePredictor(api_key)

print("Testing weather prediction...")

try:
    result = predictor.predict_heat_wave("Delhi")
    print("SUCCESS!")
    print(result)
except Exception as e:
    print(f"ERROR: {e}")
    
    # Test basic weather fetch
    try:
        weather = predictor.get_weather_forecast("Delhi")
        print("Weather fetch result:")
        print(weather)
    except Exception as e2:
        print(f"Weather fetch error: {e2}")