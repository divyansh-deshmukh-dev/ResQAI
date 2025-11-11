const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const twilioPhone = import.meta.env.VITE_TWILIO_PHONE;
const rescueTeamPhone = import.meta.env.VITE_RESCUE_TEAM_PHONE;

export const makeEmergencyCall = async (location: string) => {
  try {
    const twiml = `<Response>
      <Say voice="alice">Emergency alert! We have received an SOS signal from location: ${location}. This is an automated emergency call. Please respond immediately.</Say>
      <Pause length="2"/>
      <Say voice="alice">Location coordinates: ${location}. Emergency services may be required.</Say>
    </Response>`;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: rescueTeamPhone,
        From: twilioPhone,
        Twiml: twiml
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      callSid: data.sid,
      status: data.status
    };
  } catch (error) {
    console.error('Twilio call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Alternative SMS function if calls don't work
export const sendEmergencySMS = async (location: string) => {
  try {
    const message = `🚨 EMERGENCY ALERT 🚨\nSOS signal received from location: ${location}\nImmediate assistance required!`;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: rescueTeamPhone,
        From: twilioPhone,
        Body: message
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      messageSid: data.sid,
      status: data.status
    };
  } catch (error) {
    console.error('Twilio SMS failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};