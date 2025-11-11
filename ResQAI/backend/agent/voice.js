import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

class VoiceService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // Speech to Text
  async speechToText(audioBuffer, filename = 'audio.wav') {
    try {
      const tempPath = path.join(process.cwd(), 'temp', filename);
      
      // Ensure temp directory exists
      await fs.promises.mkdir(path.dirname(tempPath), { recursive: true });
      
      // Write audio buffer to file
      await fs.promises.writeFile(tempPath, audioBuffer);
      
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: 'whisper-1',
        language: 'en'
      });

      // Clean up temp file
      await fs.promises.unlink(tempPath);
      
      return { text: transcription.text, success: true };
    } catch (error) {
      console.error('Speech to text error:', error);
      return { error: 'Failed to transcribe audio', success: false };
    }
  }

  // Text to Speech
  async textToSpeech(text, voice = 'alloy') {
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text.substring(0, 4096) // Limit text length
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return { audio: buffer, success: true };
    } catch (error) {
      console.error('Text to speech error:', error);
      return { error: 'Failed to generate speech', success: false };
    }
  }

  // Voice Command Processing
  async processVoiceCommand(audioBuffer) {
    try {
      const transcription = await this.speechToText(audioBuffer);
      if (!transcription.success) return transcription;

      // Detect emergency keywords
      const emergencyKeywords = ['help', 'emergency', 'fire', 'flood', 'earthquake', 'sos', 'urgent'];
      const isEmergency = emergencyKeywords.some(keyword => 
        transcription.text.toLowerCase().includes(keyword)
      );

      return {
        text: transcription.text,
        isEmergency,
        confidence: transcription.text.length > 5 ? 0.9 : 0.6,
        success: true
      };
    } catch (error) {
      console.error('Voice command processing error:', error);
      return { error: 'Failed to process voice command', success: false };
    }
  }
}

export default VoiceService;