import OpenAI from 'openai';
import DisasterTools from './tools.js';
import SupabaseService from './supabase.js';
import VoiceService from './voice.js';

class DisasterAgent {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.tools = new DisasterTools();
    this.supabase = new SupabaseService();
    this.voice = new VoiceService();
  }

  async processMessage(userId, message, sensorData = {}, isVoice = false) {
    try {
      const userMemory = await this.supabase.getMemory(userId);
      const chatHistory = await this.supabase.getChatHistory(userId, 5);
      const userLocation = userMemory.location || { lat: 22.7196, lon: 75.8577 };

      const intent = await this.analyzeIntentWithContext(message, chatHistory, sensorData, isVoice);
      const response = await this.executeActions(intent, userId, userLocation, sensorData, userMemory);
      
      await this.supabase.saveMemory(userId, {
        ...userMemory,
        lastMessage: message,
        lastIntent: intent.type,
        location: userLocation,
        sensorData: sensorData
      });

      await this.supabase.saveChatMessage(userId, message, response.text);
      return response;
    } catch (error) {
      console.error('Agent processing error:', error);
      return {
        text: "I'm experiencing technical difficulties. Please try again or contact emergency services directly if this is urgent.",
        type: 'error'
      };
    }
  }

  async analyzeIntentWithContext(message, chatHistory, sensorData, isVoice) {
    const contextPrompt = `You are an AI disaster response agent. Analyze this message with full context:

Current Message: "${message}"
Voice Input: ${isVoice}
Recent Chat: ${chatHistory.slice(0, 2).map(h => `User: ${h.message} | Bot: ${h.response.substring(0, 100)}`).join(' | ')}
Sensor Data: Earthquake: ${sensorData.earthquake || 0}, Flood: ${sensorData.flood || 0}%, Fire: ${sensorData.fire || 0}%

Classify intent and extract entities:
- emergency_help: Immediate assistance needed
- weather_check: Weather/disaster information request
- prediction_request: Disaster prediction request
- location_update: Location sharing/update
- status_check: System/sensor status check
- voice_command: Voice-specific command
- followup_question: Follow-up to previous conversation
- general_chat: General conversation

Respond with JSON: {"type": "intent_name", "confidence": 0.9, "urgency": "high/medium/low", "entities": {"location": "city", "disaster_type": "flood", "action": "predict"}}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: contextPrompt }],
        temperature: 0.2
      });

      const intent = JSON.parse(completion.choices[0].message.content);
      
      if (sensorData.earthquake > 5 || sensorData.flood > 70 || sensorData.fire > 80) {
        intent.urgency = 'high';
        if (intent.type === 'general_chat') intent.type = 'emergency_help';
      }

      return intent;
    } catch (error) {
      const msg = message.toLowerCase();
      const hasEmergencyKeywords = ['help', 'emergency', 'sos', 'urgent', 'danger'].some(k => msg.includes(k));
      const hasSensorAlert = sensorData.earthquake > 5 || sensorData.flood > 70 || sensorData.fire > 80;
      
      if (hasEmergencyKeywords || hasSensorAlert) {
        return { type: 'emergency_help', confidence: 0.9, urgency: 'high' };
      }
      if (msg.includes('weather') || msg.includes('predict')) {
        return { type: 'weather_check', confidence: 0.8, urgency: 'medium' };
      }
      return { type: 'general_chat', confidence: 0.6, urgency: 'low' };
    }
  }

  async executeActions(intent, userId, location, sensorData, memory) {
    switch (intent.type) {
      case 'emergency_help':
        return await this.handleEmergency(userId, location, sensorData);
      case 'weather_check':
        return await this.handleWeatherCheck(location);
      case 'prediction_request':
        return await this.handlePredictionRequest(location, sensorData);
      case 'status_check':
        return await this.handleStatusCheck(sensorData);
      default:
        return await this.handleGeneralChat(intent, memory);
    }
  }

  async handleEmergency(userId, location, sensorData) {
    const weatherData = await this.tools.getWeatherData(location.lat, location.lon);
    const disasters = await this.tools.getDisasterEvents(5);
    
    await this.supabase.sendSOSAlert({
      userId,
      location,
      type: 'EMERGENCY_REQUEST',
      sensorData,
      weatherData: weatherData.current,
      severity: this.calculateEmergencySeverity(sensorData, weatherData)
    });

    const hospitals = [
      { name: "CHL Hospitals", distance: "2.5 km", contact: "0731-4044444" },
      { name: "Bombay Hospital", distance: "3.2 km", contact: "0731-2566666" },
      { name: "MY Hospital", distance: "1.8 km", contact: "0731-2540999" }
    ];

    return {
      text: `🚨 **EMERGENCY RESPONSE ACTIVATED** 🚨

📍 **Your Location**: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}
🚨 **SOS Alert**: Sent to emergency services

📞 **Emergency Contacts**:
• Police: 100 • Ambulance: 102 • Fire: 101 • Emergency: 112

🏥 **Nearest Hospitals**:
${hospitals.map(h => `• ${h.name} - ${h.distance} - ${h.contact}`).join('\n')}

${weatherData.floodRisk === 'HIGH' ? '⚠️ **FLOOD RISK HIGH** - Move to higher ground!' : ''}
${sensorData.earthquake > 5 ? '⚠️ **EARTHQUAKE ALERT** - Stay outdoors!' : ''}

Stay safe! Help is on the way.`,
      type: 'emergency',
      data: { hospitals, alerts: disasters.events?.slice(0, 3) }
    };
  }

  async handleWeatherCheck(location) {
    const weatherData = await this.tools.getWeatherData(location.lat, location.lon);
    const disasters = await this.tools.getDisasterEvents(3);

    return {
      text: `🌦️ **Weather Report**

📍 **Location**: ${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}
🌡️ **Temperature**: ${weatherData.current?.temperature || 'N/A'}°C
🌧️ **Rainfall**: ${weatherData.current?.rainfall || 0}mm
💨 **Wind Speed**: ${weatherData.current?.windSpeed || 'N/A'} km/h
📊 **Daily Rain**: ${weatherData.current?.dailyRain || 0}mm

⚠️ **Flood Risk**: ${weatherData.floodRisk}

${disasters.events?.length > 0 ? `🛰️ **Active Disasters Nearby**:\n${disasters.events.slice(0, 2).map(e => `• ${e.title} (${e.category})`).join('\n')}` : ''}`,
      type: 'weather',
      data: weatherData
    };
  }

  async handlePredictionRequest(location, sensorData) {
    const weatherData = await this.tools.getWeatherData(location.lat, location.lon);
    const predictions = await this.tools.predictDisaster(sensorData, weatherData);

    if (predictions.length === 0) {
      return {
        text: "✅ **All Clear** - No immediate disaster threats detected based on current data.",
        type: 'prediction',
        data: { predictions: [] }
      };
    }

    const predictionText = predictions.map(p => 
      `🔮 **${p.type.toUpperCase()}** - ${p.probability}% probability\n   Severity: ${p.severity} | Timeframe: ${p.timeframe}`
    ).join('\n\n');

    return {
      text: `🔮 **Disaster Predictions**

${predictionText}

⚠️ **Recommendations**:
${predictions.map(p => this.getRecommendation(p.type)).join('\n')}`,
      type: 'prediction',
      data: { predictions }
    };
  }

  async handleStatusCheck(sensorData) {
    const status = {
      earthquake: sensorData.earthquake > 5 ? 'ALERT' : 'NORMAL',
      flood: sensorData.flood > 70 ? 'ALERT' : 'NORMAL',
      fire: sensorData.fire > 80 ? 'ALERT' : 'NORMAL'
    };

    return {
      text: `📊 **System Status**

🌍 **Earthquake Monitor**: ${status.earthquake} (${sensorData.earthquake || 0})
🌊 **Flood Monitor**: ${status.flood} (${sensorData.flood || 0}%)
🔥 **Fire Monitor**: ${status.fire} (${sensorData.fire || 0}%)

${Object.values(status).includes('ALERT') ? '⚠️ **Action Required** - Check alerts tab for details' : '✅ **All Systems Normal**'}`,
      type: 'status',
      data: { status, sensorData }
    };
  }

  async handleGeneralChat(intent, memory) {
    return {
      text: `Hello! I'm your disaster response AI assistant. I can help you with:

🚨 Emergency assistance
🌦️ Weather & disaster information  
🔮 Disaster predictions
📊 System status checks

How can I help you stay safe today?`,
      type: 'general'
    };
  }

  calculateEmergencySeverity(sensorData, weatherData) {
    let severity = 'LOW';
    if (sensorData.earthquake > 6 || sensorData.flood > 80 || sensorData.fire > 90) severity = 'CRITICAL';
    else if (sensorData.earthquake > 5 || sensorData.flood > 70 || sensorData.fire > 80) severity = 'HIGH';
    else if (weatherData.floodRisk === 'HIGH') severity = 'MEDIUM';
    return severity;
  }

  getRecommendation(disasterType) {
    const recommendations = {
      earthquake: '• Stay outdoors, avoid buildings\n• Drop, Cover, Hold if indoors',
      flood: '• Move to higher ground immediately\n• Avoid walking/driving through water',
      fire: '• Evacuate the area\n• Stay low, cover nose/mouth'
    };
    return recommendations[disasterType] || '• Follow local emergency guidelines';
  }
}

export default DisasterAgent;