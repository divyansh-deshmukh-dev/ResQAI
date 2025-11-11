# Installation Guide for ResqAI Integration

## Step 1: Copy Module
Copy the entire `satellite-detection` folder to your ResqAI project's `src/components/` or `src/modules/` directory.

## Step 2: Install Dependencies
In your ResqAI project root, run:

```bash
npm install @iconify/icons-mdi @iconify/react google-map-react
```

## Step 3: Update Your User Page Component

Add the satellite detection to your navigation:

```tsx
// In your UserPage component or similar
import { SatelliteDetection } from './components/satellite-detection';

// Add to your navigation items
const navigationItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'satellite-detection', label: 'Satellite Detection' },
  { id: 'alerts', label: 'Alerts' }
];

// In your render method
{activeTab === 'satellite-detection' && <SatelliteDetection />}
```

## Step 4: Configure Google Maps API Key

1. Get a Google Maps API key from Google Cloud Console
2. Enable Maps JavaScript API
3. Update the key in `satellite-detection/components/Map.tsx`:

```tsx
bootstrapURLKeys={{
  key: "YOUR_API_KEY_HERE"
}}
```

## Step 5: Add CSS Import

In your main CSS file or component:

```tsx
import './satellite-detection/SatelliteDetection.css';
```

## Step 6: Test Integration

Run your development server:

```bash
npm run dev
```

Navigate to the "Satellite Detection" tab to verify the integration works.

## Troubleshooting

- Ensure all dependencies are installed
- Check console for API key errors
- Verify the module path is correct in your imports
- Make sure TypeScript is configured properly if using TS