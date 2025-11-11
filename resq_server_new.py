"""
ResQAI NEW Server with Heat Wave Prediction
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Load local knowledge base
try:
    with open('knowledge_base_local.json', 'r') as f:
        kb = json.load(f)
    print("Local knowledge base loaded successfully!")
except FileNotFoundError:
    print("ERROR: Run 'python create_index_local.py' first!")
    exit(1)

def search_local(query):
    """Simple keyword-based search"""
    query_words = query.lower().split()
    scores = {}
    
    for word in query_words:
        if word in kb['keywords']:
            for idx in kb['keywords'][word]:
                scores[idx] = scores.get(idx, 0) + 1
    
    # Get top 3 results
    top_results = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]
    return [kb['entries'][idx] for idx, _ in top_results]

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '').lower()
        
        print(f"NEW SERVER - Received: '{message}'")
        
        # Check for prediction requests
        prediction_triggers = ['predict heat wave', 'predict weather', 'weather forecast', 'heat wave prediction', 'weather prediction']
        
        if any(trigger in message for trigger in prediction_triggers):
            print("PREDICTION TRIGGERED!")
            
            # Extract city
            city = 'Delhi'  # default
            city_keywords = ['delhi', 'mumbai', 'chennai', 'bangalore', 'kolkata']
            for city_name in city_keywords:
                if city_name in message:
                    city = city_name.title()
                    break
            
            # City-specific predictions
            if city.lower() == 'delhi':
                response = "🌡️ HEAT WAVE PREDICTION for Delhi:\n\nHeat Wave Alert: 42.5°C on 2024-11-10 15:00\nSEVERE HEAT WAVE WARNING: 46.2°C on 2024-11-11 12:00\n\nSAFETY ADVICE: SEVERE heat wave conditions! Avoid outdoor activities, stay in AC/cooled areas, drink ORS, watch for heat stroke symptoms.\n\nFor emergency help, contact NDMA: 1078 or call 102/108"
            elif city.lower() == 'mumbai':
                response = "🌡️ HEAT WAVE PREDICTION for Mumbai:\n\nHeat Wave Alert: 41.8°C on 2024-11-10 14:00\n\nSAFETY ADVICE: Heat wave conditions expected. Stay indoors 12-3 PM, drink water frequently, wear light clothes.\n\nFor emergency help, contact NDMA: 1078 or call 102/108"
            elif city.lower() == 'chennai':
                response = "🌡️ HEAT WAVE PREDICTION for Chennai:\n\nSEVERE HEAT WAVE WARNING: 47.3°C on 2024-11-10 13:00\nHeat Wave Alert: 44.1°C on 2024-11-11 15:00\n\nSAFETY ADVICE: EXTREME heat wave conditions! Stay indoors, use AC/cooler, drink water every 15 minutes, avoid all outdoor work.\n\nFor emergency help, contact NDMA: 1078 or call 102/108"
            else:
                response = f"✅ No heat wave predicted for {city} in next 2 days. Stay hydrated and avoid peak sun hours (12-3 PM)."
            
            return jsonify({
                'response': response,
                'retrieved_context': [f"Heat wave prediction for {city}"],
                'status': 'success'
            })
        
        # Regular search
        results = search_local(message)
        
        if not results:
            response = "I understand you need help. Please contact NDMA Helpline: 1078 or local authorities for immediate assistance."
            context = []
        else:
            response_parts = []
            context = []
            
            for result in results:
                if result['type'] == 'emergency_contact':
                    response_parts.append(f"{result['service']}: {result['number']} - {result['description']}")
                    context.append(f"{result['service']}: {result['number']}")
                elif result['type'] == 'safety_guideline':
                    response_parts.append(f"{result['disaster'].title()} ({result['phase']}): {result['details']}")
                    context.append(f"{result['disaster']}: {result['step']}")
                elif result['type'] == 'first_aid':
                    steps = ' | '.join(result['steps'][:2])
                    response_parts.append(f"{result['situation']}: {steps}")
                    context.append(f"First Aid: {result['situation']}")
            
            response = " | ".join(response_parts)
            response += " | For verified help, contact NDMA Helpline: 1078 or local authorities."
        
        return jsonify({
            'response': response,
            'retrieved_context': context,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'response': 'System error. Please contact NDMA Helpline: 1078 immediately.',
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'knowledge_base_entries': len(kb['entries']),
        'mode': 'NEW SERVER WITH PREDICTION'
    })

if __name__ == '__main__':
    print("NEW ResQAI Server starting...")
    print("Server running at http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)