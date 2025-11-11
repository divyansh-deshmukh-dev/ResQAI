import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import DisasterAgent from './agent/reasoning.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const agent = new DisasterAgent();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId = 'default', sensorData = {}, isVoice = false } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await agent.processMessage(userId, message, sensorData, isVoice);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Voice to text endpoint
app.post('/api/voice/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const result = await agent.voice.speechToText(req.file.buffer, req.file.originalname);
    res.json(result);
  } catch (error) {
    console.error('Voice transcription error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// Text to speech endpoint
app.post('/api/voice/speak', async (req, res) => {
  try {
    const { text, voice = 'alloy' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await agent.voice.textToSpeech(text, voice);
    
    if (result.success) {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': result.audio.length
      });
      res.send(result.audio);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Text to speech error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Voice command processing
app.post('/api/voice/command', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const { userId = 'default', sensorData = {} } = req.body;
    const voiceResult = await agent.voice.processVoiceCommand(req.file.buffer);
    
    if (voiceResult.success) {
      const chatResponse = await agent.processMessage(userId, voiceResult.text, sensorData, true);
      res.json({ 
        transcription: voiceResult, 
        response: chatResponse 
      });
    } else {
      res.status(500).json(voiceResult);
    }
  } catch (error) {
    console.error('Voice command error:', error);
    res.status(500).json({ error: 'Failed to process voice command' });
  }
});

// Weather endpoint
app.get('/api/weather/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const weatherData = await agent.tools.getWeatherData(parseFloat(lat), parseFloat(lon));
    res.json(weatherData);
  } catch (error) {
    console.error('Weather error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Disaster events endpoint
app.get('/api/disasters', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const disasters = await agent.tools.getDisasterEvents(limit);
    res.json(disasters);
  } catch (error) {
    console.error('Disasters error:', error);
    res.status(500).json({ error: 'Failed to fetch disaster events' });
  }
});

// Predictions endpoint
app.post('/api/predict', async (req, res) => {
  try {
    const { sensorData, location } = req.body;
    const weatherData = await agent.tools.getWeatherData(location.lat, location.lon);
    const predictions = await agent.tools.predictDisaster(sensorData, weatherData);
    res.json({ predictions, weatherData });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

// SOS endpoint
app.post('/api/sos', async (req, res) => {
  try {
    const alertData = req.body;
    const result = await agent.supabase.sendSOSAlert(alertData);
    res.json(result);
  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({ error: 'Failed to send SOS alert' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 ResQ Backend running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
});

export default app;