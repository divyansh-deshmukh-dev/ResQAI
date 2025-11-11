from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Simple in-memory storage for demo
alerts = []
announcements = []

@app.route('/api/alerts', methods=['GET', 'POST'])
def handle_alerts():
    if request.method == 'POST':
        alert = request.get_json()
        alert['id'] = len(alerts) + 1
        alerts.append(alert)
        return jsonify(alert), 201
    else:
        return jsonify(alerts)

@app.route('/api/announcements', methods=['GET', 'POST'])
def handle_announcements():
    if request.method == 'POST':
        announcement = request.get_json()
        announcement['id'] = len(announcements) + 1
        announcements.append(announcement)
        return jsonify(announcement), 201
    else:
        return jsonify(announcements)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'alerts': len(alerts), 'announcements': len(announcements)})

if __name__ == '__main__':
    print("Simple ResQ Server starting...")
    print("Server running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)