"""
Test the demo heat wave prediction logic
"""

import requests
import json

def test_demo_predictions():
    url = "http://localhost:5000/chat"
    
    test_cases = [
        {
            "query": "predict heat wave",
            "expected": "Should show Delhi heat wave with 42.5°C and 46.2°C"
        },
        {
            "query": "weather forecast Mumbai", 
            "expected": "Should show Mumbai heat wave with 41.8°C"
        },
        {
            "query": "predict weather Chennai",
            "expected": "Should show no heat wave for Chennai"
        },
        {
            "query": "heat wave prediction Delhi",
            "expected": "Should show severe heat wave warning"
        }
    ]
    
    print("🌡️ TESTING DEMO HEAT WAVE PREDICTION LOGIC\n")
    
    for i, test in enumerate(test_cases, 1):
        try:
            response = requests.post(url, json={"message": test["query"]})
            result = response.json()
            
            print(f"TEST {i}: {test['query']}")
            print(f"Expected: {test['expected']}")
            print(f"Response: {result.get('response', 'No response')}")
            print("=" * 80)
            
        except Exception as e:
            print(f"ERROR in test {i}: {e}")
            print("=" * 80)

if __name__ == "__main__":
    test_demo_predictions()