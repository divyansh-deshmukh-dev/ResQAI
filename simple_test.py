"""
Simple test for exact phrases
"""

import requests

def test_exact_phrases():
    url = "http://localhost:5000/chat"
    
    # Test exact phrases that should trigger prediction
    test_queries = [
        "heat wave prediction",
        "weather forecast",
        "predict weather"
    ]
    
    for query in test_queries:
        try:
            response = requests.post(url, json={"message": query})
            result = response.json()
            print(f"Query: '{query}'")
            print(f"Response: {result.get('response')}")
            print("=" * 60)
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_exact_phrases()