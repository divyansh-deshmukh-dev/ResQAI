"""
Test all heat wave predictions
"""

import requests

def test_all_predictions():
    url = "http://localhost:5001/chat"
    
    test_cases = [
        "predict heat wave",
        "predict weather Mumbai", 
        "weather forecast Chennai",
        "heat wave prediction Delhi",
        "weather prediction Bangalore"
    ]
    
    for query in test_cases:
        try:
            response = requests.post(url, json={"message": query})
            result = response.json()
            
            print(f"Query: '{query}'")
            print(f"Response: {result.get('response')[:100]}...")
            print("=" * 60)
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_all_predictions()