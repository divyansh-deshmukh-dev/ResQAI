"""
Super Simple Test Server - Just for prediction testing
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '').lower()
    
    print(f"SIMPLE SERVER - Got: '{message}'")
    
    if message == 'predict heat wave':
        print("PREDICTION WORKING!")
        return jsonify({
            'response': 'HEAT WAVE PREDICTION for Delhi: 42.5°C SEVERE WARNING!',
            'status': 'success'
        })
    
    return jsonify({
        'response': 'Regular response - prediction not triggered',
        'status': 'success'
    })

if __name__ == '__main__':
    print("SIMPLE TEST SERVER on port 5002")
    app.run(debug=True, host='0.0.0.0', port=5002)