"""
ResQAI Flask Backend - RAG Chatbot for Disaster Management
Provides verified emergency guidance using retrieval-augmented generation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import pickle
import numpy as np
from scipy.spatial.distance import cosine

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load knowledge base from pickle file
try:
    with open('knowledge_base.pkl', 'rb') as f:
        knowledge_base = pickle.load(f)
    print("✅ Connected to knowledge base")
except:
    print("❌ Knowledge base not found. Run create_index.py first!")
    knowledge_base = None

@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint for ResQAI
    Accepts user query, retrieves relevant context, generates response
    """
    try:
        # Get user message from request
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
            
        if not knowledge_base:
            return jsonify({'error': 'Knowledge base not available'}), 500
        
        # Generate embedding for user query
        query_embedding = client.embeddings.create(
            model="text-embedding-3-small",
            input=user_message
        ).data[0].embedding
        
        # Find most similar entries using cosine similarity
        similarities = []
        for i, doc_embedding in enumerate(knowledge_base['embeddings']):
            similarity = 1 - cosine(query_embedding, doc_embedding)
            similarities.append((similarity, i))
        
        # Get top 2 most relevant entries
        similarities.sort(reverse=True)
        top_indices = [idx for _, idx in similarities[:2]]
        
        retrieved_docs = [knowledge_base['texts'][i] for i in top_indices]
        context = "\n\n".join(retrieved_docs) if retrieved_docs else "No specific guidance found in knowledge base."
        
        # Create system prompt for ResQAI
        system_prompt = """You are ResQAI, an AI assistant for disaster management. 
        You provide verified, calm, and practical guidance during emergencies.
        
        CRITICAL RULES:
        - Speak calmly and clearly
        - Provide step-by-step emergency safety advice
        - Only use information from the provided context or general emergency protocols
        - Never hallucinate or make up information
        - Be concise but thorough
        - Always end with: "For verified help, contact NDMA Helpline: 1078 or local authorities."
        
        Use the following verified information to answer the user's question:
        """ + context
        
        # Generate response using GPT
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=300,
            temperature=0.3  # Low temperature for consistent, reliable responses
        )
        
        ai_response = response.choices[0].message.content
        
        # Ensure the response ends with the required helpline message
        if "NDMA Helpline: 1078" not in ai_response:
            ai_response += "\n\nFor verified help, contact NDMA Helpline: 1078 or local authorities."
        
        return jsonify({
            'response': ai_response,
            'retrieved_context': retrieved_docs,
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'error': 'An error occurred processing your request',
            'status': 'error'
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'knowledge_base': 'connected' if knowledge_base else 'not_found',
        'entries': len(knowledge_base['texts']) if knowledge_base else 0
    })

if __name__ == '__main__':
    print("🚀 Starting ResQAI Backend Server...")
    print("📚 Knowledge Base Status:", "✅ Ready" if collection else "❌ Not Found")
    app.run(debug=True, host='0.0.0.0', port=5000)