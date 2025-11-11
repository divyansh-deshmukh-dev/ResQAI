"""
ResQAI Demo Server - With Simulated Heat Wave Predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from demo_heat_predictor import DemoHeatWavePredictor

app = Flask(__name__)
CORS(app)

# Initialize DEMO heat wave predictor
heat_predictor = DemoHeatWavePredictor()

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
        
        # PRIORITY: Check for weather prediction requests FIRST
        if ('predict' in message and ('heat' in message or 'weather' in message)) or \
           ('forecast' in message and 'weather' in message) or \
           'heat wave prediction' in message or \
           'weather prediction' in message:
            # Extract city from message
            city = 'Delhi'  # default
            city_keywords = ['delhi', 'mumbai', 'chennai', 'bangalore', 'kolkata', 'hyderabad', 'pune', 'ahmedabad']
            for city_name in city_keywords:
                if city_name in message:
                    city = city_name.title()
                    break
            
            # Get DEMO heat wave prediction
            prediction = heat_predictor.predict_heat_wave(city)
            
            if prediction.get('heat_wave_days'):
                warnings = prediction.get('warnings', [])
                advice = prediction.get('safety_advice', '')
                response = f"🌡️ HEAT WAVE PREDICTION for {city}:\n\n"
                response += "\n".join(warnings) + "\n\n"
                response += f"SAFETY ADVICE: {advice}\n\n"
                response += "For emergency help, contact NDMA: 1078 or call 102/108"
            else:
                response = f"✅ No heat wave predicted for {city} in next 2 days. Stay hydrated and avoid peak sun hours (12-3 PM)."
            
            return jsonify({
                'response': response,
                'retrieved_context': [f"Heat wave prediction for {city}"],
                'status': 'success',
                'prediction_data': prediction
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

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'knowledge_base_entries': len(kb['entries']),
        'mode': 'demo',
        'weather_prediction': 'demo mode - simulated data'
    })

if __name__ == '__main__':
    print("ResQAI DEMO Server starting...")
    print("Server running at http://localhost:5000")
    print("DEMO MODE: Simulated heat wave predictions for testing")
    app.run(debug=True, host='0.0.0.0', port=5000)