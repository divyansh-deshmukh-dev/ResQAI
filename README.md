# ResQAI - RAG Chatbot for Disaster Management

A Retrieval-Augmented Generation (RAG) chatbot that provides verified, calm, and practical guidance during disasters like earthquakes, floods, and fires.

## 🏗️ Project Structure

```
ResQ/
├── app.py              # Flask backend server with RAG functionality
├── create_index.py     # Script to index dataset into vector database
├── test_client.py      # Test client for backend API
├── dataset.json        # Disaster management knowledge base
├── requirements.txt    # Python dependencies
├── .env               # Environment variables (OpenAI API key)
└── README.md          # This file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set up Environment
Create `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Create Knowledge Base
```bash
python create_index.py
```

### 4. Start Backend Server
```bash
python app.py
```

### 5. Test the System
```bash
python test_client.py
```

## 📡 API Endpoints

### POST /chat
Send a message to ResQAI chatbot
```json
{
  "message": "What should I do during an earthquake?"
}
```

Response:
```json
{
  "response": "During an earthquake: 1. Drop to hands and knees...",
  "retrieved_context": ["Earthquake: Drop, Cover, Hold..."],
  "status": "success"
}
```

### GET /health
Check server health and knowledge base status

## 🤖 Chatbot Behavior

ResQAI follows these principles:
- ✅ Speaks calmly and clearly
- ✅ Provides step-by-step emergency safety advice
- ✅ Only uses verified information from dataset
- ✅ Never hallucinates or makes up information
- ✅ Always ends with: "For verified help, contact NDMA Helpline: 1078 or local authorities."

## 🔧 Technical Details

- **Backend**: Flask with CORS support
- **Vector Database**: ChromaDB (local storage)
- **Embeddings**: OpenAI text-embedding-3-small
- **LLM**: GPT-4o-mini for response generation
- **Retrieval**: Top 2 most relevant entries per query

## 📊 Dataset Format

The `dataset.json` should contain disaster management entries:
```json
[
  {
    "disaster": "earthquake",
    "tip": "Drop, Cover, and Hold On. Get under a desk or table.",
    "helpline": "NDMA: 1078"
  }
]
```

## 🔒 Security Notes

- Keep your OpenAI API key secure in `.env` file
- Never commit `.env` to version control
- Use environment variables in production
