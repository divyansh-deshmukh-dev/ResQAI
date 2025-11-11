"""
Test client for ResQAI chatbot
Use this to test the Flask backend locally
"""

import requests
import json

# Backend URL
BASE_URL = "http://localhost:5000"

def test_health():
    """Test if the server is running"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print("🏥 Health Check:", response.json())
        return response.status_code == 200
    except:
        print("❌ Server not running. Start with: python app.py")
        return False

def test_chat(message):
    """Test chat functionality"""
    try:
        response = requests.post(
            f"{BASE_URL}/chat",
            json={"message": message},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n🤖 ResQAI Response:")
            print(f"📝 Message: {data['response']}")
            print(f"📚 Retrieved Context: {len(data.get('retrieved_context', []))} entries")
            return True
        else:
            print(f"❌ Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing ResQAI Backend...")
    
    # Test server health
    if not test_health():
        exit(1)
    
    # Test sample queries
    test_queries = [
        "What should I do during an earthquake?",
        "How to stay safe during floods?",
        "Fire safety tips for home",
        "Emergency contacts for disasters"
    ]
    
    for query in test_queries:
        print(f"\n📤 Testing: {query}")
        test_chat(query)
        print("-" * 50)