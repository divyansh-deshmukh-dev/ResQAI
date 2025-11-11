# Satellite Detection Module

This module provides real-time wildfire detection using NASA EONET API data, converted to TypeScript/TSX for integration with ResqAI.

## Features

- Real-time wildfire data from NASA EONET API
- Interactive Google Maps integration
- TypeScript support with proper type definitions
- Responsive design
- Error handling with fallback sample data

## Installation

1. Copy the `satellite-detection` folder to your ResqAI project
2. Install dependencies:

```bash
npm install @iconify/icons-mdi @iconify/react google-map-react
```

## Usage

### Basic Integration

```tsx
import { SatelliteDetection } from './satellite-detection';

function App() {
  return (
    <div>
      <SatelliteDetection />
    </div>
  );
}
```

### Navigation Integration

```tsx
import React, { useState } from 'react';
import { SatelliteDetection } from './satellite-detection';

const UserPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('satellite-detection')}>
          Satellite Detection
        </button>
      </nav>
      {activeTab === 'satellite-detection' && <SatelliteDetection />}
    </div>
  );
};
```

## Configuration

### Google Maps API Key

Update the API key in `components/Map.tsx`:

```tsx
<GoogleMapReact
  bootstrapURLKeys={{
    key: "YOUR_GOOGLE_MAPS_API_KEY_HERE"
  }}
  // ... other props
/>
```

## Components

- `SatelliteDetection`: Main component
- `Map`: Interactive map with fire markers
- `Header`: Title header
- `Loader`: Loading spinner
- `LocationMarker`: Fire location markers
- `LocationInfoBox`: Information popup

## Dependencies

- React 18+
- TypeScript 5+
- @iconify/react
- google-map-react

## Development

Run with your existing ResqAI development server:

```bash
npm run dev
```

The module is designed to integrate seamlessly with existing React/Next.js applications.