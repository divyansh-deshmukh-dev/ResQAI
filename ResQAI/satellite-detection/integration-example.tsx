// Example integration for ResqAI user page
import React, { useState } from 'react';
import { SatelliteDetection } from './index';

// Example navigation component
const Navigation: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => (
  <nav className="navigation">
    <ul>
      <li>
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
      </li>
      <li>
        <button 
          className={activeTab === 'satellite-detection' ? 'active' : ''}
          onClick={() => setActiveTab('satellite-detection')}
        >
          Satellite Detection
        </button>
      </li>
      <li>
        <button 
          className={activeTab === 'alerts' ? 'active' : ''}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts
        </button>
      </li>
    </ul>
  </nav>
);

// Example user page component
const UserPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'satellite-detection':
        return <SatelliteDetection />;
      case 'dashboard':
        return <div>Dashboard Content</div>;
      case 'alerts':
        return <div>Alerts Content</div>;
      default:
        return <div>Dashboard Content</div>;
    }
  };

  return (
    <div className="user-page">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
};

export default UserPage;