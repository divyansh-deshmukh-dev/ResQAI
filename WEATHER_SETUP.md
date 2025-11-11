# Heat Wave Prediction Setup

## 🌡️ Get Free OpenWeather API Key

1. Go to https://openweathermap.org/api
2. Click "Sign Up" (it's FREE!)
3. Verify your email
4. Go to "API Keys" section
5. Copy your API key

## 🔧 Setup Steps

1. **Install requests library**:
```bash
pip install requests
```

2. **Add your API key** in `app_local.py`:
```python
OPENWEATHER_API_KEY = "your_actual_api_key_here"
```

3. **Start the server**:
```bash
python app_local.py
```

## 📡 API Endpoints

### Heat Wave Prediction
```
GET /predict-heatwave?city=Delhi
```

Response:
```json
{
  "city": "Delhi",
  "heat_wave_days": [
    {
      "date": "2024-01-15 15:00",
      "temp": 42.5,
      "severity": "HEAT WAVE",
      "risk": "HIGH"
    }
  ],
  "warnings": ["Heat Wave Alert: 42.5°C on 2024-01-15 15:00"],
  "safety_advice": "Heat wave conditions expected. Stay indoors 12-3 PM..."
}
```

### Test URLs
- http://localhost:5000/predict-heatwave
- http://localhost:5000/predict-heatwave?city=Mumbai
- http://localhost:5000/predict-heatwave?city=Chennai

## 🚨 Heat Wave Thresholds
- **40°C+**: Heat Wave Alert
- **45°C+**: SEVERE Heat Wave Warning

## 🎯 What This Adds to ResQ
✅ **2-day heat wave forecasting**
✅ **City-specific predictions**  
✅ **Automatic safety advice**
✅ **Risk level assessment**
✅ **Free to use** (1000 calls/day limit)

Your ResQ bot can now predict heat waves and provide early warnings!