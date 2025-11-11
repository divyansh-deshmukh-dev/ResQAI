"""
Test the NEW server
"""

import requests

def test_new_server():
    url = "http://localhost:5001/chat"  # Different port
    
    try:
        response = requests.post(url, json={"message": "predict heat wave"})
        result = response.json()
        
        print(f"Input: 'predict heat wave'")
        print(f"Response: {result.get('response')}")
        
        if "HEAT WAVE PREDICTION for Delhi" in result.get('response', ''):
            print("✅ NEW SERVER PREDICTION WORKING!")
        else:
            print("❌ Still not working")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_new_server()