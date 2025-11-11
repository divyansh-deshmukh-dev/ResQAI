"""
Test current weather to see actual temperatures
"""

import requests

def test_current_weather():
    # Test the direct weather API
    url = "http://localhost:5000/predict-heatwave?city=Delhi"
    
    try:
        response = requests.get(url)
        result = response.json()
        
        print("Current weather prediction for Delhi:")
        print(f"Heat wave days: {len(result.get('heat_wave_days', []))}")
        print(f"Warnings: {result.get('warnings', [])}")
        print(f"Safety advice: {result.get('safety_advice', '')}")
        
        # Test with a typically hot city
        url2 = "http://localhost:5000/predict-heatwave?city=Chennai"
        response2 = requests.get(url2)
        result2 = response2.json()
        
        print("\nCurrent weather prediction for Chennai:")
        print(f"Heat wave days: {len(result2.get('heat_wave_days', []))}")
        print(f"Warnings: {result2.get('warnings', [])}")
        print(f"Safety advice: {result2.get('safety_advice', '')}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_current_weather()