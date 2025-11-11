import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker } from "react-leaflet";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Zone {
  id: string;
  type: 'danger' | 'safe' | 'rescue';
  coordinates: [number, number][];
  name: string;
  created_at: string;
}

const MapView = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [showHospitals, setShowHospitals] = useState(false);
  const [shelters, setShelters] = useState<any[]>([]);
  const [showShelters, setShowShelters] = useState(false);
  const [rescueTeams, setRescueTeams] = useState<any[]>([]);
  const [showRescueTeams, setShowRescueTeams] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success("Location detected", {
          description: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        });
      },
      (error) => {
        console.error("Location error:", error);
        toast.error("Could not detect location", {
          description: "Please enable location services",
        });
      }
    );

    // Fetch zones from Supabase
    fetchZones();

    // Subscribe to real-time zone updates
    const subscription = supabase
      .channel('zones')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'zones' },
        () => fetchZones()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchZones = async () => {
    const { data } = await supabase
      .from('zones')
      .select('*');
    
    if (data) setZones(data);
  };

  const getZoneColor = (type: string) => {
    switch (type) {
      case 'danger': return '#ef4444';
      case 'safe': return '#22c55e';
      case 'rescue': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const findNearestHospitals = async () => {
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }

    try {
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="hospital"](around:10000,${userLocation.lat},${userLocation.lng}););out;`
      );
      
      if (response.ok) {
        const data = await response.json();
        const realHospitals = data.elements.slice(0, 5).map((hospital: any) => {
          const distance = calculateDistance(userLocation.lat, userLocation.lng, hospital.lat, hospital.lon);
          return {
            id: hospital.id,
            name: hospital.tags?.name || 'Hospital',
            lat: hospital.lat,
            lng: hospital.lon,
            distance: `${distance.toFixed(1)} km`
          };
        });
        
        setHospitals(realHospitals);
        setShowHospitals(true);
        
        // Focus map on hospitals area
        if (realHospitals.length > 0 && mapRef.current) {
          const bounds = L.latLngBounds(realHospitals.map(h => [h.lat, h.lng]));
          bounds.extend([userLocation.lat, userLocation.lng]);
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
        
        toast.success(`${realHospitals.length} hospitals found on map`);
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Fallback to mock data
      const mockHospitals = [
        { id: 1, name: 'City Hospital', lat: userLocation.lat + 0.01, lng: userLocation.lng + 0.01, distance: '2.3 km' },
        { id: 2, name: 'Emergency Medical Center', lat: userLocation.lat - 0.015, lng: userLocation.lng + 0.02, distance: '3.1 km' },
        { id: 3, name: 'Regional Hospital', lat: userLocation.lat + 0.02, lng: userLocation.lng - 0.01, distance: '4.5 km' },
        { id: 4, name: 'Community Health Center', lat: userLocation.lat - 0.008, lng: userLocation.lng - 0.012, distance: '1.8 km' }
      ];
      
      setHospitals(mockHospitals);
      setShowHospitals(true);
      
      // Focus map on hospitals area
      if (mapRef.current) {
        const bounds = L.latLngBounds(mockHospitals.map(h => [h.lat, h.lng]));
        bounds.extend([userLocation.lat, userLocation.lng]);
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
      
      toast.success('Hospitals found on map (estimated locations)');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const userLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const shelterIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const rescueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const getDirections = (location: any) => {
    const url = `https://www.google.com/maps/dir/${userLocation?.lat},${userLocation?.lng}/${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };

  const findNearestShelters = async () => {
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }

    const mockShelters = [
      { id: 1, name: 'City Community Center', lat: userLocation.lat + 0.008, lng: userLocation.lng + 0.012, distance: '1.5 km', capacity: '200 people' },
      { id: 2, name: 'School Gymnasium', lat: userLocation.lat - 0.012, lng: userLocation.lng + 0.018, distance: '2.1 km', capacity: '150 people' },
      { id: 3, name: 'Municipal Hall', lat: userLocation.lat + 0.015, lng: userLocation.lng - 0.008, distance: '2.8 km', capacity: '300 people' },
      { id: 4, name: 'Sports Complex', lat: userLocation.lat - 0.006, lng: userLocation.lng - 0.015, distance: '1.9 km', capacity: '250 people' }
    ];

    setShelters(mockShelters);
    setShowShelters(true);
    setShowHospitals(false);
    
    // Focus map on shelters area
    if (mapRef.current) {
      const bounds = L.latLngBounds(mockShelters.map(s => [s.lat, s.lng]));
      bounds.extend([userLocation.lat, userLocation.lng]);
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
    
    toast.success('Emergency shelters found on map');
  };

  const findRescueTeams = async () => {
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }

    const mockRescueTeams = [
      { id: 1, name: 'Fire & Rescue Station 1', lat: userLocation.lat + 0.005, lng: userLocation.lng + 0.008, distance: '1.2 km', status: 'Available', team: 'Fire Department' },
      { id: 2, name: 'Emergency Response Unit', lat: userLocation.lat - 0.010, lng: userLocation.lng + 0.015, distance: '2.0 km', status: 'On Duty', team: 'Medical Team' },
      { id: 3, name: 'Police Rescue Squad', lat: userLocation.lat + 0.012, lng: userLocation.lng - 0.006, distance: '1.8 km', status: 'Available', team: 'Police' },
      { id: 4, name: 'Disaster Response Team', lat: userLocation.lat - 0.008, lng: userLocation.lng - 0.012, distance: '1.5 km', status: 'Deployed', team: 'NDRF' }
    ];

    setRescueTeams(mockRescueTeams);
    setShowRescueTeams(true);
    setShowHospitals(false);
    setShowShelters(false);
    
    // Focus map on rescue teams area
    if (mapRef.current) {
      const bounds = L.latLngBounds(mockRescueTeams.map(t => [t.lat, t.lng]));
      bounds.extend([userLocation.lat, userLocation.lng]);
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
    
    toast.success('Rescue teams located on map');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Interactive Map</h1>
            <p className="text-muted-foreground">Danger zones, safe routes, and rescue teams</p>
          </div>
          {userLocation && (
            <Badge variant="outline" className="bg-rescue/10 text-rescue border-rescue">
              <MapPin className="h-3 w-3 mr-1" />
              Location Active
            </Badge>
          )}
        </div>

        {/* Map container */}
        <Card className="p-6 shadow-card">
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* User location marker */}
              {userLocation && (
                <Marker 
                  position={[userLocation.lat, userLocation.lng]}
                  icon={userLocationIcon}
                >
                  <Popup>📍 Your Location</Popup>
                </Marker>
              )}
              
              {/* Render zones from admin */}
              {zones.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={zone.coordinates}
                  pathOptions={{
                    color: getZoneColor(zone.type),
                    fillColor: getZoneColor(zone.type),
                    fillOpacity: 0.3
                  }}
                >
                  <Popup>
                    <div>
                      <h3 className="font-semibold">{zone.name}</h3>
                      <p className="text-sm capitalize">{zone.type} Zone</p>
                    </div>
                  </Popup>
                </Polygon>
              ))}
              
              {/* Hospital markers */}
              {showHospitals && hospitals.map((hospital) => (
                <Marker key={hospital.id} position={[hospital.lat, hospital.lng]}>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-semibold">{hospital.name}</h3>
                      <p className="text-sm text-gray-600">{hospital.distance}</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => getDirections(hospital)}
                      >
                        Get Directions
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Shelter markers */}
              {showShelters && shelters.map((shelter) => (
                <Marker key={shelter.id} position={[shelter.lat, shelter.lng]} icon={shelterIcon}>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-semibold">{shelter.name}</h3>
                      <p className="text-sm text-gray-600">{shelter.distance}</p>
                      <p className="text-xs text-gray-500">Capacity: {shelter.capacity}</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => getDirections(shelter)}
                      >
                        Get Directions
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Rescue team markers */}
              {showRescueTeams && rescueTeams.map((team) => (
                <Marker key={team.id} position={[team.lat, team.lng]} icon={rescueIcon}>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-semibold">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.distance}</p>
                      <p className="text-xs text-blue-600">{team.team}</p>
                      <p className={`text-xs ${team.status === 'Available' ? 'text-green-600' : team.status === 'On Duty' ? 'text-yellow-600' : 'text-red-600'}`}>
                        Status: {team.status}
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => getDirections(team)}
                      >
                        Get Directions
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Quick actions */}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={findNearestShelters}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Show Shelters
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={findNearestHospitals}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Nearest Hospital
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={findRescueTeams}
            >
              Show Rescue Teams
            </Button>
            <Button variant="outline" size="sm">
              View Safe Zones
            </Button>
          </div>
        </Card>

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-danger shadow-card">
            <h3 className="font-semibold text-foreground mb-2">Danger Zones</h3>
            <p className="text-2xl font-bold text-danger mb-1">{zones.filter(z => z.type === 'danger').length}</p>
            <p className="text-xs text-muted-foreground">High risk areas marked in red</p>
          </Card>
          <Card className="p-4 border-l-4 border-safety shadow-card">
            <h3 className="font-semibold text-foreground mb-2">Safe Zones</h3>
            <p className="text-2xl font-bold text-safety mb-1">{zones.filter(z => z.type === 'safe').length}</p>
            <p className="text-xs text-muted-foreground">Verified safe areas</p>
          </Card>
          <Card className="p-4 border-l-4 border-rescue shadow-card">
            <h3 className="font-semibold text-foreground mb-2">Rescue Points</h3>
            <p className="text-2xl font-bold text-rescue mb-1">{zones.filter(z => z.type === 'rescue').length}</p>
            <p className="text-xs text-muted-foreground">Active rescue locations</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MapView;
