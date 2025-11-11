import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import Loader from './components/Loader';
import Header from './components/Header';
import './SatelliteDetection.css';

interface EventGeometry {
  type: string;
  coordinates: [number, number];
  date: string;
}

interface EventCategory {
  id: number;
  title: string;
}

interface WildfireEvent {
  id: string;
  title: string;
  categories: EventCategory[];
  geometries: EventGeometry[];
}

const SatelliteDetection: React.FC = () => {
  const [eventData, setEventData] = useState<WildfireEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching wildfire data from NASA...');
        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires');
        
        if (!response.ok) {
          throw new Error(`NASA API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('NASA API Response:', data);
        
        if (data.events && data.events.length > 0) {
          setEventData(data.events);
        } else {
          console.log('No events found, using sample data');
          setEventData(getSampleWildfireData());
        }
      } catch (error) {
        console.error('Error fetching wildfire data:', error);
        setError('Failed to load real-time data. Showing sample wildfires.');
        setEventData(getSampleWildfireData());
      } finally {
        setLoading(false);
      }
    };

    const getSampleWildfireData = (): WildfireEvent[] => [
      {
        id: 'sample-1',
        title: 'Wildfire in California',
        categories: [{ id: 8, title: 'Wildfires' }],
        geometries: [{ type: 'Point', coordinates: [-121.5, 38.5], date: new Date().toISOString() }]
      },
      {
        id: 'sample-2',
        title: 'Wildfire in Australia',
        categories: [{ id: 8, title: 'Wildfires' }],
        geometries: [{ type: 'Point', coordinates: [148.0, -32.5], date: new Date().toISOString() }]
      },
      {
        id: 'sample-3',
        title: 'Wildfire in Canada',
        categories: [{ id: 8, title: 'Wildfires' }],
        geometries: [{ type: 'Point', coordinates: [-115.0, 55.0], date: new Date().toISOString() }]
      },
      {
        id: 'sample-4',
        title: 'Wildfire in Brazil',
        categories: [{ id: 8, title: 'Wildfires' }],
        geometries: [{ type: 'Point', coordinates: [-55.0, -10.0], date: new Date().toISOString() }]
      },
      {
        id: 'sample-5',
        title: 'Wildfire in Spain',
        categories: [{ id: 8, title: 'Wildfires' }],
        geometries: [{ type: 'Point', coordinates: [-3.0, 40.0], date: new Date().toISOString() }]
      }
    ];

    fetchEvents();
  }, []);

  return (
    <div className="satellite-detection">
      <Header />
      {error && <div className="error-message">⚠️ {error}</div>}
      {!loading ? <Map eventData={eventData} /> : <Loader />}
    </div>
  );
};

export default SatelliteDetection;