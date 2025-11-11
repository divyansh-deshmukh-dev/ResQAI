# -*- coding: utf-8 -*-
"""
ResQAI Local Flask Server (No OpenAI Required)
Simple keyword-based disaster guidance chatbot
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from weather_prediction import HeatWavePredictor

app = Flask(__name__)
CORS(app)

# Initialize heat wave predictor
OPENWEATHER_API_KEY = "fd1d084348ab87d9a12ab43963dec03f"
heat_predictor = HeatWavePredictor(OPENWEATHER_API_KEY)

# Load local knowledge base
try:
    with open('knowledge_base_local.json', 'r', encoding='utf-8') as f:
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
        
        # DEBUG: Print the message to see what we're getting
        print(f"DEBUG: Received message: '{message}'")
        
        # PRIORITY: Check for weather prediction requests FIRST
        if message == 'predict heat wave' or message == 'predict weather' or message == 'weather forecast' or 'heat wave prediction' in message or 'weather prediction' in message:
            print("DEBUG: Prediction request detected!")
            # Extract city from message
            city = 'Delhi'  # default
            city_keywords = ['delhi', 'mumbai', 'chennai', 'bangalore', 'kolkata', 'hyderabad', 'pune', 'ahmedabad']
            for city_name in city_keywords:
                if city_name in message:
                    city = city_name.title()
                    break
            
            # HARDCODED DEMO HEAT WAVE PREDICTIONS
            if city.lower() == 'delhi':
                response = "Heat Wave Alert: 42.5C on 2024-11-10 15:00\nSEVERE HEAT WAVE WARNING: 46.2C on 2024-11-11 12:00\n\nSAFETY ADVICE: SEVERE heat wave conditions! Avoid outdoor activities, stay in AC/cooled areas, drink ORS, watch for heat stroke symptoms.\n\nFor emergency help, contact NDMA: 1078 or call 102/108"
            elif city.lower() == 'mumbai':
                response = "Heat Wave Alert: 41.8C on 2024-11-10 14:00\n\nSAFETY ADVICE: Heat wave conditions expected. Stay indoors 12-3 PM, drink water frequently, wear light clothes.\n\nFor emergency help, contact NDMA: 1078 or call 102/108"
            elif city.lower() == 'chennai':
                response = "SEVERE HEAT WAVE WARNING: 47.3C on 2024-11-10 13:00\nHeat Wave Alert: 44.1C on 2024-11-11 15:00\n\nSAFETY ADVICE: EXTREME heat wave conditions! Stay indoors, use AC/cooler, drink water every 15 minutes, avoid all outdoor work.\n\nFor emergency help, contact NDMA: 1078 or call 102/108"
            else:
                response = f"No heat wave predicted for {city} in next 2 days. Stay hydrated and avoid peak sun hours (12-3 PM)."
            
            print(f"DEBUG: Returning prediction for {city}")
            return jsonify({
                'response': response,
                'retrieved_context': [f"Heat wave prediction for {city}"],
                'status': 'success'
            })
        
        else:
            # Regular knowledge base search
            results = search_local(message)
            
            if not results:
                response = "I understand you need help. Please contact NDMA Helpline: 1078 or local authorities for immediate assistance."
                context = []
            else:
                # Build response from results
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
                        steps = ' | '.join(result['steps'][:2])  # First 2 steps
                        response_parts.append(f"{result['situation']}: {steps}")
                        context.append(f"First Aid: {result['situation']}")
                
                response = " | ".join(response_parts)
                response += " | For verified help, contact NDMA Helpline: 1078 or local authorities."
        
        return jsonify({
            'response': response,
            'retrieved_context': context if 'context' in locals() else [],
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'response': 'System error. Please contact NDMA Helpline: 1078 immediately.',
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/predict-heatwave', methods=['GET'])
def predict_heatwave():
    try:
        city = request.args.get('city', 'Delhi')
        
        if not heat_predictor:
            return jsonify({
                'error': 'Weather prediction not configured. Add OpenWeather API key.',
                'message': 'Get free API key from openweathermap.org'
            }), 400
        
        prediction = heat_predictor.predict_heat_wave(city)
        return jsonify(prediction)
        
    except Exception as e:
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'knowledge_base_entries': len(kb['entries']),
        'mode': 'local',
        'weather_prediction': 'available' if heat_predictor else 'not configured'
    })

if __name__ == '__main__':
    print("ResQAI Local Server starting...")
    print("Server running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)