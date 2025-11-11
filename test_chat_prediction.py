"""
Test chat with prediction
"""

import requests
import json

def test_chat_prediction():
    url = "http://localhost:5000/chat"
    
    # Test different prediction queries
    queries = [
        "predict heat wave",
        "weather forecast Delhi", 
        "will there be heat wave in Mumbai?",
        "hot weather prediction",
        "temperature forecast Chennai"
    ]
    
    print("Testing chat predictions...")
    
    for query in queries:
        try:
            response = requests.post(url, json={"message": query})
            result = response.json()
            
            print(f"\nQuery: '{query}'")
            print(f"Response: {result.get('response', 'No response')}")
            print("-" * 50)
            
        except Exception as e:
            print(f"Error testing '{query}': {e}")

if __name__ == "__main__":
    test_chat_prediction()