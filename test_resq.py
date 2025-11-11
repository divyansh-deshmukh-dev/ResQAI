"""
Test ResQ AI System
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_chat(message):
    """Test chat functionality"""
    try:
        response = requests.post(f"{BASE_URL}/chat", 
                               json={"message": message})
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def test_heatwave(city="Delhi"):
    """Test heat wave prediction"""
    try:
        response = requests.get(f"{BASE_URL}/predict-heatwave?city={city}")
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        return response.json()
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print("=== ResQ AI Test ===\n")
    
    # Test 1: Health check
    print("1. Health Check:")
    health = test_health()
    print(json.dumps(health, indent=2))
    print()
    
    # Test 2: Chat - Earthquake
    print("2. Chat Test - Earthquake:")
    chat_result = test_chat("What to do during earthquake?")
    print(json.dumps(chat_result, indent=2))
    print()
    
    # Test 3: Chat - Emergency numbers
    print("3. Chat Test - Emergency Numbers:")
    emergency = test_chat("emergency contact numbers")
    print(json.dumps(emergency, indent=2))
    print()
    
    # Test 4: Heat wave prediction
    print("4. Heat Wave Prediction - Delhi:")
    heatwave = test_heatwave("Delhi")
    print(json.dumps(heatwave, indent=2))
    print()
    
    print("=== Test Complete ===")