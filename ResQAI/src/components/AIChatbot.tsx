import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DisasterAPI } from "@/lib/disasterAPI";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm ResQAI, your AI disaster assistance bot. How can I help you stay safe today?",
      timestamp: new Date(),
    },
  ]);

  const systemMessage = {
    role: "system",
    content: `You are ResQAI — an AI assistant for disaster management. 
    You provide verified and calm guidance to users facing emergencies such as earthquakes, floods, or fires.
    Your responses should:
    - Be short, clear, and practical.
    - Give immediate safety instructions.
    - Suggest contacting emergency authorities.
    - Include live data if available from APIs.
    - Never guess — if you don't know, say you're checking resources.`,
  };
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    "Safety tips",
    "Nearest hospital",
    "Emergency contacts",
    "Evacuation routes",
    "Current alerts",
    "Fire emergency",
    "Earthquake guide",
    "Emergency kit",
  ];

  const getNearestHospitals = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      // Fetch nearby hospitals using Overpass API
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="hospital"](around:5000,${lat},${lon}););out;`
      );
      
      if (response.ok) {
        const data = await response.json();
        const hospitals = data.elements.slice(0, 5).map((hospital: any, index: number) => {
          const distance = calculateDistance(lat, lon, hospital.lat, hospital.lon);
          const address = `${hospital.tags?.['addr:street'] || ''} ${hospital.tags?.['addr:housenumber'] || ''}, ${hospital.tags?.['addr:city'] || hospital.tags?.['addr:suburb'] || ''}`.trim();
          const directionsUrl = `https://www.google.com/maps/dir/${lat},${lon}/${hospital.lat},${hospital.lon}`;
          return `${index + 1}. ${hospital.tags?.name || 'Hospital'} - ${distance.toFixed(1)} km\n   📍 ${address || 'Address not available'}\n   🗺️ Directions: ${directionsUrl}`;
        });
        
        return `🏥 Nearest hospitals based on your location:\n\n${hospitals.join('\n\n')}\n\n📍 Your location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      }
      
      return `🏥 Nearest hospitals (estimated):\n1. City Hospital - 2.3 km\n2. Emergency Medical Center - 3.1 km\n3. Regional Hospital - 4.5 km\n\n📍 Your location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch {
      return "🏥 Please enable location access to find nearest hospitals. General hospitals:\n1. City Hospital\n2. Emergency Medical Center\n3. Regional Hospital";
    }
  };
  
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getOpenAIResponse = async (message: string) => {
    try {
      // Try to get RAG response from Flask backend
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.response;
      }
    } catch {
      // Fallback to rule-based responses if RAG backend unavailable
    }
    
    // Fallback responses
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('cyclone') || lowerMsg.includes('storm') || lowerMsg.includes('wind')) {
      return "🌪️ Cyclone Safety:\n• Stay indoors away from windows\n• Secure loose objects outside\n• Have emergency supplies ready\n• Monitor weather updates\n• Avoid coastal areas\n\nFor verified help, contact NDMA Helpline: 1078 or local authorities.";
    }
    
    if (lowerMsg.includes('landslide') || lowerMsg.includes('mudslide')) {
      return "🏔️ Landslide Safety:\n• Move away from the slide path\n• Listen for unusual sounds\n• Watch for changes in water flow\n• Evacuate if ground cracks appear\n\nFor verified help, contact NDMA Helpline: 1078 or local authorities.";
    }
    
    if (lowerMsg.includes('tsunami')) {
      return "🌊 Tsunami Warning:\n• Move to higher ground immediately\n• Stay at least 2 miles inland\n• Don't wait for official warning\n• Stay away from beaches and harbors\n\nFor verified help, contact NDMA Helpline: 1078 or local authorities.";
    }
    
    if (lowerMsg.includes('shelter') || lowerMsg.includes('refuge')) {
      return "🏠 Emergency Shelter:\n• Check map for designated shelters\n• Bring identification and medications\n• Follow shelter rules and guidelines\n• Register with authorities upon arrival\n\nFor verified help, contact NDMA Helpline: 1078 or local authorities.";
    }
    
    return "🎆 ResQ Disaster Assistant\n\nI can help with:\n• Specific disasters (flood, fire, earthquake)\n• Emergency procedures and safety\n• Evacuation planning\n• Emergency kit preparation\n• Finding nearest hospitals\n\nFor immediate emergencies: Call 112\nFor verified help, contact NDMA Helpline: 1078 or local authorities.";
  };

  const handleSend = async (message: string = input) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Handle responses
    const lowerMessage = message.toLowerCase();
    let responseContent;

    if (lowerMessage.includes("safety tips")) {
      responseContent = "🛡️ General Safety Tips:\n• Stay calm and alert\n• Follow official guidance\n• Keep emergency kit ready\n• Stay informed via official channels\n• Have evacuation plan ready";
    } else if (lowerMessage.includes("nearest hospital")) {
      responseContent = await getNearestHospitals();
    } else if (lowerMessage.includes("emergency contacts")) {
      responseContent = "📞 Emergency Contacts (India):\n• Police: 100\n• Fire: 101\n• Ambulance: 102\n• Disaster Helpline: 1078\n• National Emergency: 112\n• Women Helpline: 1091";
    } else if (lowerMessage.includes("evacuation routes")) {
      responseContent = "🚗 Evacuation Guidelines:\n• Follow designated evacuation routes\n• Check map for safe zones (green areas)\n• Avoid danger zones (red areas)\n• Take emergency kit with you\n• Stay with family members";
    } else if (lowerMessage.includes("flood")) {
      responseContent = "🌊 Flood Emergency:\n• Move to higher ground immediately\n• Avoid walking/driving through flood water\n• Turn off electricity and gas\n• Listen to emergency broadcasts\n• Don't drink flood water";
    } else if (lowerMessage.includes("fire")) {
      responseContent = "🔥 Fire Emergency:\n• Call 101 immediately\n• Get low and crawl under smoke\n• Feel doors before opening\n• Use stairs, never elevators\n• Meet at designated assembly point";
    } else if (lowerMessage.includes("earthquake")) {
      responseContent = "🌍 Earthquake Response:\n• DROP: Get on hands and knees\n• COVER: Take shelter under desk/table\n• HOLD ON: Protect head and neck\n• Stay away from windows\n• If outdoors, move away from buildings";
    } else if (lowerMessage.includes("kit") || lowerMessage.includes("supplies")) {
      responseContent = "🎒 Emergency Kit Checklist:\n• Water: 4 liters per person per day\n• Non-perishable food (3 days)\n• Flashlight and extra batteries\n• First aid kit and medications\n• Important documents (copies)\n• Cash and local maps\n• Whistle for signaling";
    } else if (lowerMessage.includes("current alerts") || lowerMessage.includes("alerts")) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        responseContent = await DisasterAPI.generateDisasterAlert(position.coords.latitude, position.coords.longitude);
      } catch {
        responseContent = await DisasterAPI.generateDisasterAlert();
      }
    } else {
      responseContent = await getOpenAIResponse(message);
    }

    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Voice input not supported in your browser");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice input error");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-card">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Assistant</h3>
            <Badge variant="outline" className="bg-safety/10 text-safety border-safety text-xs">
              Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick replies */}
      <div className="p-3 border-b border-border bg-secondary/30">
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <Button
              key={reply}
              size="sm"
              variant="outline"
              onClick={() => handleSend(reply)}
              className="text-xs"
            >
              {reply}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="text-sm whitespace-pre-line">
                {message.content.split('\n').map((line, i) => {
                  if (line.includes('🗺️ Directions:')) {
                    const url = line.split('🗺️ Directions: ')[1];
                    return (
                      <div key={i}>
                        🗺️ Directions: <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700">Open in Google Maps</a>
                      </div>
                    );
                  }
                  return <div key={i}>{line}</div>;
                })}
              </div>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your question or concern..."
            className="flex-1"
          />
          <Button
            size="icon"
            variant={isListening ? "destructive" : "outline"}
            onClick={handleVoiceInput}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button size="icon" onClick={() => handleSend()} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIChatbot;
