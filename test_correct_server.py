"""
Test the CORRECT server on port 5001
"""

import requests

def test_correct_server():
    # CORRECT URL - port 5001
    url = "http://localhost:5001/chat"
    
    try:
        response = requests.post(url, json={"message": "predict heat wave"})
        result = response.json()
        
        print(f"Testing NEW server on port 5001:")
        print(f"Response: {result.get('response')}")
        
        if "HEAT WAVE PREDICTION for Delhi" in result.get('response', ''):
            print("✅ WORKING! Using the correct server.")
        else:
            print("❌ Wrong server or not working")
            
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure you're running: python resq_server_new.py")

if __name__ == "__main__":
    test_correct_server()