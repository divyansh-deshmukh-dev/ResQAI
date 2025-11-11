import React from 'react';

const Loader: React.FC = () => (
  <div className="loader">
    <div className="spinner"></div>
    <h1>Loading Wildfire Data...</h1>
    <p>Fetching real-time data from NASA EONET</p>
  </div>
);

export default Loader;