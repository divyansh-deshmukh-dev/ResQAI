import React from 'react';

interface LocationInfo {
  id: string;
  title: string;
  date: string;
}

interface LocationInfoBoxProps {
  info: LocationInfo;
  onClose: () => void;
}

const LocationInfoBox: React.FC<LocationInfoBoxProps> = ({ info, onClose }) => (
  <div className="location-info">
    <button onClick={onClose} className="close-btn">×</button>
    <h2>Wildfire Location</h2>
    <ul>
      <li><strong>ID:</strong> {info.id}</li>
      <li><strong>Title:</strong> {info.title}</li>
      <li><strong>Date:</strong> {new Date(info.date).toLocaleString()}</li>
    </ul>
  </div>
);

export default LocationInfoBox;