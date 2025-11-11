const API_BASE = 'http://localhost:3001/api';

export interface ChatResponse {
  text: string;
  type: 'emergency' | 'weather' | 'prediction' | 'status' | 'general' | 'error';
  data?: any;
}

export interface SensorData {
  earthquake: number;
  flood: number;
  fire: number;
}

class ChatService {
  async sendMessage(message: string, userId: string = 'default', sensorData?: SensorData, isVoice: boolean = false): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId, sensorData, isVoice })
      });
      
      if (!response.ok) throw new Error('Chat request failed');
      return await response.json();
    } catch (error) {
      console.error('Chat service error:', error);
      return {
        text: 'Sorry, I\'m having trouble connecting. Please try again.',
        type: 'error'
      };
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<{ text: string; success: boolean }> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      
      const response = await fetch(`${API_BASE}/voice/transcribe`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Transcription failed');
      return await response.json();
    } catch (error) {
      console.error('Transcription error:', error);
      return { text: '', success: false };
    }
  }

  async textToSpeech(text: string, voice: string = 'alloy'): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE}/voice/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice })
      });
      
      if (!response.ok) throw new Error('TTS failed');
      return await response.blob();
    } catch (error) {
      console.error('TTS error:', error);
      return null;
    }
  }

  async processVoiceCommand(audioBlob: Blob, userId: string = 'default', sensorData?: SensorData) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      formData.append('userId', userId);
      formData.append('sensorData', JSON.stringify(sensorData || {}));
      
      const response = await fetch(`${API_BASE}/voice/command`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Voice command failed');
      return await response.json();
    } catch (error) {
      console.error('Voice command error:', error);
      return { error: 'Failed to process voice command' };
    }
  }

  async getWeather(lat: number, lon: number) {
    try {
      const response = await fetch(`${API_BASE}/weather/${lat}/${lon}`);
      if (!response.ok) throw new Error('Weather request failed');
      return await response.json();
    } catch (error) {
      console.error('Weather service error:', error);
      return { error: 'Failed to fetch weather data' };
    }
  }

  async getDisasters(limit: number = 10) {
    try {
      const response = await fetch(`${API_BASE}/disasters?limit=${limit}`);
      if (!response.ok) throw new Error('Disasters request failed');
      return await response.json();
    } catch (error) {
      console.error('Disasters service error:', error);
      return { error: 'Failed to fetch disaster events' };
    }
  }

  async getPredictions(sensorData: SensorData, location: { lat: number; lon: number }) {
    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensorData, location })
      });
      
      if (!response.ok) throw new Error('Prediction request failed');
      return await response.json();
    } catch (error) {
      console.error('Prediction service error:', error);
      return { error: 'Failed to generate predictions' };
    }
  }

  async sendSOS(alertData: any) {
    try {
      const response = await fetch(`${API_BASE}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      });
      
      if (!response.ok) throw new Error('SOS request failed');
      return await response.json();
    } catch (error) {
      console.error('SOS service error:', error);
      return { error: 'Failed to send SOS alert' };
    }
  }
}

export default new ChatService();