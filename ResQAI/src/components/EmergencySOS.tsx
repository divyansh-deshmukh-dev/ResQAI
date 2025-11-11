import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAlertStore } from "@/store/alertStore";
import { makeEmergencyCall, sendEmergencySMS } from "@/services/twilioService";

const EmergencySOS = () => {
  const [sending, setSending] = useState(false);
  const addAlert = useAlertStore((state) => state.addAlert);

  const handleSOS = async () => {
    setSending(true);

    try {
      // Get user's location
      let location = "Location unavailable";
      let lat = 22.7196; // Default to Indore
      let lon = 75.8577;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        location = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      } catch (geoError) {
        console.log('Location access denied, using default location');
      }

      // Try emergency call first, then SMS as fallback
      let callData = await makeEmergencyCall(location);
      
      if (callData.success) {
        addAlert({
          id: Date.now().toString(),
          type: 'emergency',
          location: `Emergency SOS - ${location}`,
          severity: 'critical',
          timestamp: new Date(),
          message: '🚨 EMERGENCY CALL MADE - Rescue team contacted via Twilio',
          acknowledged: false,
        });

        toast.success("🚨 EMERGENCY CALL MADE!", {
          description: `Call sent to +918889441539\nCall ID: ${callData.callSid}\nStatus: ${callData.status}`,
          duration: 10000
        });
      } else {
        // Try SMS as fallback
        console.log('Call failed, trying SMS...', callData.error);
        const smsData = await sendEmergencySMS(location);
        
        if (smsData.success) {
          addAlert({
            id: Date.now().toString(),
            type: 'emergency',
            location: `Emergency SOS - ${location}`,
            severity: 'critical',
            timestamp: new Date(),
            message: '🚨 EMERGENCY SMS SENT - Rescue team contacted via Twilio',
            acknowledged: false,
          });

          toast.success("🚨 EMERGENCY SMS SENT!", {
            description: `SMS sent to +918889441539\nMessage ID: ${smsData.messageSid}\nStatus: ${smsData.status}`,
            duration: 10000
          });
        } else {
          throw new Error(smsData.error || 'Both call and SMS failed');
        }
      }

    } catch (error) {
      console.error('Emergency call failed:', error);
      toast.error("🚨 CALL FAILED - Manual Contact Required", {
        description: "Rescue: +918889441539\nPolice: 100\nAmbulance: 102\nCheck Twilio credentials",
        duration: 15000
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleSOS}
      disabled={sending}
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg z-50 animate-pulse"
    >
      {sending ? (
        <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
      ) : (
        <AlertCircle className="h-8 w-8" />
      )}
    </Button>
  );
};

export default EmergencySOS;
