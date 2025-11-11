# ResQ Admin Dashboard

A comprehensive admin dashboard for the ResQ Disaster Management System built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🚨 IoT Monitoring & Alert Management
- Real-time IoT sensor monitoring (temperature, rainfall, seismic activity)
- Automatic alert generation based on thresholds
- Alert approval system
- Live alert history

### 📢 Announcements Management
- Create and send announcements to users
- Real-time sync with user dashboard
- Announcement history

### 📋 Reports Management
- View user-submitted disaster reports
- Update report status (pending, under review, verified)
- Photo attachments support

### 🗺️ Interactive Map Control
- Draw danger zones, safe zones, and rescue points
- Real-time zone updates
- Interactive Leaflet map integration

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Run the SQL schema from `database-schema.sql` in your Supabase SQL editor

### 3. Environment Configuration
1. Copy `.env.example` to `.env`
2. Update with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start Development Server
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3001`

## Real-time Sync

The admin dashboard automatically syncs with the user dashboard through Supabase real-time subscriptions:

- **Admin → User**: Approved alerts, announcements, map zones
- **User → Admin**: Disaster reports, SOS alerts

## IoT Simulation

The dashboard includes mock IoT sensors that generate alerts when thresholds are exceeded:
- Temperature > 35°C → Fire alert
- Rainfall > 80mm/h → Flood alert  
- Seismic activity > 1.5 → Earthquake alert

## Architecture

```
Admin Dashboard (Port 3001)
├── IoT Monitoring & Alerts
├── Announcements Management  
├── Reports Management
└── Map Control
    ↕️ Real-time sync via Supabase
User Dashboard (Port 3000)
├── Live Alerts Feed
├── Announcements Feed
├── Report Submission
└── Interactive Map
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **Maps**: Leaflet + React Leaflet
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Build Tool**: Vite

## Database Schema

The system uses 4 main tables:
- `alerts` - IoT-generated and manual alerts
- `announcements` - Official announcements
- `reports` - User-submitted disaster reports  
- `zones` - Map zones (danger/safe/rescue)

All tables support real-time subscriptions for instant updates.