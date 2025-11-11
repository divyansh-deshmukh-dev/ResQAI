import express from 'express';
import cors from 'cors';
import twilio from 'twilio';

const app = express();
app.use(cors());
app.use(express.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/emergency', async (req, res) => {
  try {
    const { location } = req.body;
    
    const call = await client.calls.create({
      twiml: `<Response><Say>Emergency alert from ResQ AI! Location: ${location}. Please respond immediately.</Say></Response>`,
      to: '+918889441539',
      from: '+17163210851'
    });

    res.json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error('Twilio error:', error);
    res.json({ success: false, error: error.message });
  }
});

app.listen(5000, () => console.log('Emergency server running on port 5000'));