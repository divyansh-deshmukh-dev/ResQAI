"""
ResQAI Knowledge Base Indexer (Simple Version)
Reads disaster management dataset and creates embeddings for local storage
"""

import json
import pickle
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load dataset
try:
    with open("dataset.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Loaded {len(data)} entries from dataset.json")
except FileNotFoundError:
    print("ERROR: dataset.json not found!")
    exit(1)

# Prepare texts from nested structure
texts = []

# Process emergency contacts
for contact in data.get('emergency_contacts', {}).get('national_numbers', []):
    text = f"Emergency Service: {contact.get('service', 'Unknown')}\nNumber: {contact.get('number', 'N/A')}\nDescription: {contact.get('description', 'No description')}"
    texts.append(text)

# Process disaster guidelines
for disaster_type, guidelines in data.get('disaster_safety_guidelines', {}).items():
    for phase, steps in guidelines.items():
        if isinstance(steps, list):
            for step in steps:
                text = f"Disaster: {disaster_type}\nPhase: {phase}\nStep: {step.get('step', 'Unknown')}\nDetails: {step.get('details', 'No details')}"
                texts.append(text)

# Process first aid
for emergency in data.get('basic_first_aid', {}).get('common_emergencies', []):
    text = f"First Aid: {emergency.get('situation', 'Unknown')}\nSteps: {' | '.join(emergency.get('steps', []))}"
    texts.append(text)

# Generate embeddings
print("Generating embeddings...")
embeddings = []

for i, text in enumerate(texts):
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        embeddings.append(response.data[0].embedding)
        print(f"Generated embedding {i+1}/{len(texts)}")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        exit(1)

# Save to local files
knowledge_base = {
    'texts': texts,
    'embeddings': embeddings
}

with open('knowledge_base.pkl', 'wb') as f:
    pickle.dump(knowledge_base, f)

print(f"Successfully indexed {len(texts)} entries!")
print("You can now run 'python app.py' to start the server")
