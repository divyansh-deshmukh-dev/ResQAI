"""
Test the simple server
"""

import requests

def test_simple():
    url = "http://localhost:5002/chat"
    
    try:
        response = requests.post(url, json={"message": "predict heat wave"})
        result = response.json()
        
        print(f"Simple server response: {result.get('response')}")
        
        if "HEAT WAVE PREDICTION" in result.get('response', ''):
            print("✅ SIMPLE SERVER WORKS!")
        else:
            print("❌ Even simple server not working")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_simple()