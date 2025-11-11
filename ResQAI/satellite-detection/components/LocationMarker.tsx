import React from 'react';
import { Icon } from '@iconify/react';
import locationIcon from '@iconify/icons-mdi/fire-alert';

interface LocationMarkerProps {
  lat: number;
  lng: number;
  onClick: () => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ lat, lng, onClick }) => (
  <div 
    className="location-marker" 
    onClick={onClick}
    style={{
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      cursor: 'pointer',
      zIndex: 1000
    }}
  >
    <Icon 
      icon={locationIcon} 
      style={{
        fontSize: '2rem',
        color: '#ff4444',
        filter: 'drop-shadow(0 0 5px white) drop-shadow(0 0 10px orange)',
        transition: 'transform 0.3s ease'
      }}
    />
  </div>
);

export default LocationMarker;