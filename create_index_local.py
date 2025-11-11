"""
ResQAI Local Knowledge Base (No OpenAI Required)
Simple keyword-based matching for disaster guidance
"""

import json

# Load dataset
try:
    with open("dataset.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Loaded dataset from dataset.json")
except FileNotFoundError:
    print("ERROR: dataset.json not found!")
    exit(1)

# Create simple keyword index
knowledge_base = {
    'data': data,
    'keywords': {}
}

# Build keyword index from complex dataset
entries = []
entry_id = 0

# Process emergency contacts
for contact in data.get('emergency_contacts', {}).get('national_numbers', []):
    entry = {
        'type': 'emergency_contact',
        'service': contact.get('service', ''),
        'number': contact.get('number', ''),
        'description': contact.get('description', '')
    }
    entries.append(entry)
    
    # Index keywords
    text = f"{entry['service']} {entry['description']}".lower()
    for word in text.split():
        if len(word) > 2:
            if word not in knowledge_base['keywords']:
                knowledge_base['keywords'][word] = []
            knowledge_base['keywords'][word].append(entry_id)
    entry_id += 1

# Process disaster guidelines
for disaster_type, guidelines in data.get('disaster_safety_guidelines', {}).items():
    for phase, steps in guidelines.items():
        if isinstance(steps, list):
            for step in steps:
                entry = {
                    'type': 'safety_guideline',
                    'disaster': disaster_type,
                    'phase': phase,
                    'step': step.get('step', ''),
                    'details': step.get('details', '')
                }
                entries.append(entry)
                
                # Index keywords
                text = f"{disaster_type} {phase} {entry['step']} {entry['details']}".lower()
                for word in text.split():
                    if len(word) > 2:
                        if word not in knowledge_base['keywords']:
                            knowledge_base['keywords'][word] = []
                        knowledge_base['keywords'][word].append(entry_id)
                entry_id += 1

# Process first aid
for emergency in data.get('basic_first_aid', {}).get('common_emergencies', []):
    entry = {
        'type': 'first_aid',
        'situation': emergency.get('situation', ''),
        'steps': emergency.get('steps', [])
    }
    entries.append(entry)
    
    # Index keywords
    text = f"{entry['situation']} {' '.join(entry['steps'])}".lower()
    for word in text.split():
        if len(word) > 2:
            if word not in knowledge_base['keywords']:
                knowledge_base['keywords'][word] = []
            knowledge_base['keywords'][word].append(entry_id)
    entry_id += 1

knowledge_base['entries'] = entries

# Save to local file
with open('knowledge_base_local.json', 'w') as f:
    json.dump(knowledge_base, f, indent=2)

print(f"Successfully indexed {len(entries)} entries locally!")
print("You can now run 'python app_local.py' to start the server")