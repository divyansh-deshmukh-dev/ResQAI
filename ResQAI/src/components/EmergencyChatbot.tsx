// App.tsx
import React, { useState, useEffect, useRef } from "react";
import ChatbotIcon from "./ChatbotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

interface ChatMessageType {
  role: "user" | "assistant";
  text: string;
}

const EmergencyChatbot: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chatHistory]);

  // Get user location
  const getUserLocation = (): Promise<{ latitude: number; longitude: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });

  // Reverse geocode
  const getCityFromCoordinates = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      return data.address;
    } catch {
      return null;
    }
  };

  // Calculate distance (Haversine)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDefaultIndoreHospitals = () => [
    { name: "CHL Hospitals", display_name: "CHL Hospitals, AB Road, Indore", distance: 2.5 },
    { name: "Bombay Hospital", display_name: "Bombay Hospital, Scheme No 94, Indore", distance: 3.2 },
    { name: "SAIMS", display_name: "Sri Aurobindo Institute, Indore-Ujjain Rd", distance: 4.1 },
    { name: "MY Hospital", display_name: "Maharaja Yashwantrao Hospital, Indore", distance: 1.8 },
    { name: "Apollo Hospitals", display_name: "Apollo Hospitals, MR-10 Rd, Indore", distance: 5.7 },
  ];

  const getEmergencyContacts = () => ({
    police: "100",
    ambulance: "102",
    fire: "101",
    emergency: "112",
    womenHelpline: "1091",
    childHelpline: "1098",
    disasterManagement: "108",
  });

  // Find nearby hospitals
  const findNearbyHospitals = async (
    latitude: number,
    longitude: number,
    cityName?: string
  ) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `hospital in ${cityName || "India"}`
        )}&limit=8&countrycodes=in`
      );
      let hospitals = await response.json();

      if (!hospitals.length) return getDefaultIndoreHospitals();

      return hospitals
        .map((h: any) => ({
          name: h.display_name.split(",")[0] || "Hospital",
          display_name: h.display_name,
          distance: calculateDistance(latitude, longitude, +h.lat, +h.lon),
        }))
        .sort((a: any, b: any) => a.distance - b.distance);
    } catch {
      return getDefaultIndoreHospitals();
    }
  };

  // Main bot response
  const generateBotResponse = async (history: ChatMessageType[]) => {
    const userMessage = history.at(-1)?.text?.toLowerCase() || "";

    if (
      userMessage.includes("help") ||
      userMessage.includes("hospital") ||
      userMessage.includes("emergency") ||
      userMessage.includes("doctor") ||
      userMessage.includes("medical")
    ) {
      try {
        const loc = await getUserLocation();
        const addr = await getCityFromCoordinates(loc.latitude, loc.longitude);
        const city = addr?.city || addr?.town || addr?.county || "your location";

        const hospitals = await findNearbyHospitals(
          loc.latitude,
          loc.longitude,
          city
        );
        const contacts = getEmergencyContacts();

        let response = `🚑 **Emergency Help - India** 🚑\n\n📍 **Your Location:** ${city}, India\n\n📞 **Emergency Contacts:**\n`;
        Object.entries(contacts).forEach(([k, v]) => {
          response += `• ${k.replace(/([A-Z])/g, " $1")}: ${v}\n`;
        });

        response += `\n🏥 **Nearby Hospitals:**\n`;
        hospitals.slice(0, 5).forEach((h, i) => {
          response += `\n${i + 1}. **${h.name}**\n   📍 ${
            h.display_name.split(",").slice(0, 3).join(", ")
          }\n   📏 ${h.distance.toFixed(1)} km away\n`;
        });

        response +=
          "\n\n⚠️ **Important:** In case of serious emergency, please call the numbers above immediately!";

        setChatHistory((prev) => [
          ...prev.filter((m) => m.text !== "Thinking..."),
          { role: "assistant", text: response },
        ]);
        return;
      } catch {
        const contacts = getEmergencyContacts();
        let errorRes = `🚑 **Emergency Help - India** 🚑\n\n📞 **Emergency Contacts:**\n`;
        Object.entries(contacts).forEach(([k, v]) => {
          errorRes += `• ${k.replace(/([A-Z])/g, " $1")}: ${v}\n`;
        });

        errorRes += `\n🏥 **Major Hospitals (Default):**\n`;
        getDefaultIndoreHospitals().forEach((h, i) => {
          errorRes += `\n${i + 1}. **${h.name}**\n   📍 ${h.display_name}\n`;
        });

        setChatHistory((prev) => [
          ...prev.filter((m) => m.text !== "Thinking..."),
          { role: "assistant", text: errorRes },
        ]);
        return;
      }
    }

    // Default fallback
    setChatHistory((prev) => [
      ...prev.filter((m) => m.text !== "Thinking..."),
      { role: "assistant", text: "How can I help you today?" },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition z-50"
      >
        <ChatbotIcon />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-16 w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-600 p-4">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-full">
                <ChatbotIcon />
              </div>
              <h2 className="text-white font-semibold text-lg">
                Emergency ChatBot
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white text-2xl hover:bg-indigo-500 rounded-full px-2"
            >
              ⌄
            </button>
          </div>

          {/* Chat Body */}
          <div
            ref={chatBodyRef}
            className="flex flex-col gap-4 p-5 h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 mb-20"
          >
            <div className="flex items-start gap-3">
              <div className="bg-indigo-600 p-1.5 rounded-full text-white">
                <ChatbotIcon />
              </div>
              <p className="bg-indigo-50 border border-indigo-100 text-gray-800 px-4 py-3 rounded-xl whitespace-pre-line">
                🚑 **Emergency Help Available** 🚑
                {"\n\n"}Hey there! I'm here to help. If you need:
                {"\n"}• 🏥 Nearby hospitals in India
                {"\n"}• 📞 Emergency contacts
                {"\n"}• 🚑 Medical assistance
                {"\n\n"}Just type "help", "hospital", or "emergency" and I'll
                provide immediate assistance with accurate locations and numbers.
              </p>
            </div>

            {chatHistory.map((chat, i) => (
              <ChatMessage key={i} chat={chat} />
            ))}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 w-full bg-white px-5 pb-5 pt-3 border-t">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyChatbot;
