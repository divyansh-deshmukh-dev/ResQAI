import React, { useState, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import LocationMarker from './LocationMarker';
import LocationInfoBox from './LocationInfoBox';

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

interface MapProps {
  eventData?: WildfireEvent[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

interface LocationInfo {
  id: string;
  title: string;
  date: string;
}

const Map: React.FC<MapProps> = ({ eventData = [], center = { lat: 20, lng: 0 }, zoom = 2 }) => {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded) {
        console.warn("Google Map failed to load — showing fallback.");
        setMapLoaded(true);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [mapLoaded]);

  const markers = eventData
    .map((ev, index) => {
      if (!ev?.categories?.[0] || !ev?.geometries?.[0]) return null;

      const category = ev.categories[0];
      const isWildfire =
        category.id === 8 ||
        (category.title && category.title.toLowerCase().includes("wildfire"));
      if (!isWildfire) return null;

      const geometry = ev.geometries[0];
      const [lng, lat] = geometry.coordinates;
      if (isNaN(lat) || isNaN(lng)) return null;

      return (
        <LocationMarker
          key={ev.id || index}
          lat={lat}
          lng={lng}
          onClick={() =>
            setLocationInfo({ id: ev.id, title: ev.title, date: geometry.date })
          }
        />
      );
    })
    .filter(Boolean);

  const displayMarkers =
    markers.length > 0 ? markers : getSampleMarkers(setLocationInfo);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <GoogleMapReact
        bootstrapURLKeys={{
          key: "AIzaSyBJ-Dc1Ie96sR0oS81np6YkDDf7jNKg0H0", // Replace with your key
        }}
        defaultCenter={center}
        defaultZoom={zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={() => {
          console.log("✅ Google Maps API loaded successfully");
          setMapLoaded(true);
        }}
        options={{
          fullscreenControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          zoomControl: true,
        }}
      >
        {displayMarkers}
      </GoogleMapReact>

      {!mapLoaded && (
        <div className="map-loader">
          Loading Map...
        </div>
      )}

      {locationInfo && (
        <LocationInfoBox
          info={locationInfo}
          onClose={() => setLocationInfo(null)}
        />
      )}
    </div>
  );
};

const getSampleMarkers = (setLocationInfo: (info: LocationInfo) => void) => {
  const sample = [
    { id: "sample-1", title: "Wildfire in California", lat: 38.5, lng: -121.5 },
    { id: "sample-2", title: "Wildfire in Australia", lat: -32.5, lng: 148.0 },
    { id: "sample-3", title: "Wildfire in Canada", lat: 55.0, lng: -115.0 },
    { id: "sample-4", title: "Wildfire in Brazil", lat: -10.0, lng: -55.0 },
    { id: "sample-5", title: "Wildfire in Spain", lat: 40.0, lng: -3.0 },
    { id: "sample-6", title: "Wildfire near Mumbai, India", lat: 19.0760, lng: 72.8777 },
    { id: "sample-7", title: "Wildfire near Delhi, India", lat: 28.6139, lng: 77.2090 },
    { id: "sample-8", title: "Wildfire near Bengaluru, India", lat: 12.9716, lng: 77.5946 },
  ];

  return sample.map((loc) => (
    <LocationMarker
      key={loc.id}
      lat={loc.lat}
      lng={loc.lng}
      onClick={() =>
        setLocationInfo({
          id: loc.id,
          title: loc.title,
          date: new Date().toISOString(),
        })
      }
    />
  ));
};

export default Map;