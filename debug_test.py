"""
Debug test to check if prediction logic is working
"""

import requests
import json

def debug_prediction():
    url = "http://localhost:5000/chat"
    
    # Test with exact trigger phrase
    test_message = "predict heat wave"
    
    try:
        response = requests.post(url, json={"message": test_message})
        result = response.json()
        
        print(f"Input: '{test_message}'")
        print(f"Response: {result.get('response')}")
        print(f"Status: {result.get('status')}")
        
        # Check if it contains our hardcoded prediction
        if "HEAT WAVE PREDICTION for Delhi" in result.get('response', ''):
            print("✅ PREDICTION LOGIC IS WORKING!")
        else:
            print("❌ Still getting knowledge base response")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_prediction()