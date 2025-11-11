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
OPENWEATHER_API_KEY = "44ff1c9277f3249525c8130e8921f139"
heat_predictor = HeatWavePredictor(OPENWEATHER_API_KEY)

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
        message = data.get('message', '')
        
        # Search knowledge base
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
            'retrieved_context': context,
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
        'weather_prediction': 'available'
    })

if __name__ == '__main__':
    print("ResQAI Local Server starting...")
    print("Server running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)