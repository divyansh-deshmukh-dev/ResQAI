import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet'
import { useAdminStore } from '@/store/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Map, MapPin, Shield, AlertTriangle } from 'lucide-react'
import { MapClickHandler } from '@/components/MapClickHandler'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export function MapControlPage() {
  const { zones, fetchZones, createZone } = useAdminStore()
  const [selectedZoneType, setSelectedZoneType] = useState<'danger' | 'safe' | 'rescue'>('danger')
  const [zoneName, setZoneName] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][]>([])

  useEffect(() => {
    fetchZones()
  }, [])

  const getZoneColor = (type: string) => {
    switch (type) {
      case 'danger': return '#ef4444'
      case 'safe': return '#22c55e'
      case 'rescue': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const handleMapClick = (e: any) => {
    if (!isDrawing) return
    
    const { lat, lng } = e.latlng
    setCurrentPolygon(prev => [...prev, [lat, lng]])
  }

  const saveZone = async () => {
    if (currentPolygon.length < 3 || !zoneName.trim()) return
    
    await createZone({
      type: selectedZoneType,
      coordinates: currentPolygon,
      name: zoneName
    })
    
    setCurrentPolygon([])
    setZoneName('')
    setIsDrawing(false)
  }

  const cancelDrawing = () => {
    setCurrentPolygon([])
    setIsDrawing(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Map Control Center</h1>
      
      {/* Zone Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-blue-500" />
            Zone Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Zone Type</label>
              <select
                value={selectedZoneType}
                onChange={(e) => setSelectedZoneType(e.target.value as any)}
                className="w-full p-2 border border-input bg-background text-foreground rounded-md"
              >
                <option value="danger">🚨 Danger Zone</option>
                <option value="safe">🟢 Safe Zone</option>
                <option value="rescue">🔵 Rescue Point</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Zone Name</label>
              <Input
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="Enter zone name..."
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => setIsDrawing(!isDrawing)}
                variant={isDrawing ? "destructive" : "default"}
                className="w-full"
              >
                {isDrawing ? 'Cancel Drawing' : 'Start Drawing'}
              </Button>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={saveZone}
                disabled={currentPolygon.length < 3 || !zoneName.trim()}
                className="w-full"
              >
                Save Zone
              </Button>
            </div>
          </div>
          
          {isDrawing && (
            <div className="bg-primary/10 border border-primary/20 rounded-md p-3 mb-4">
              <p className="text-sm text-primary">
                Click on the map to draw zone boundaries. You need at least 3 points to create a zone.
                Current points: {currentPolygon.length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={[20.5937, 78.9629]} // India coordinates
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler onMapClick={handleMapClick} />
              
              {/* Existing Zones */}
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
                      <p className="text-sm">Type: {zone.type}</p>
                    </div>
                  </Popup>
                </Polygon>
              ))}
              
              {/* Current Drawing */}
              {currentPolygon.length > 0 && (
                <>
                  {currentPolygon.map((position, index) => (
                    <Marker key={index} position={position}>
                      <Popup>Point {index + 1}</Popup>
                    </Marker>
                  ))}
                  {currentPolygon.length > 2 && (
                    <Polygon
                      positions={currentPolygon}
                      pathOptions={{
                        color: getZoneColor(selectedZoneType),
                        fillColor: getZoneColor(selectedZoneType),
                        fillOpacity: 0.3,
                        dashArray: '5, 5'
                      }}
                    />
                  )}
                </>
              )}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Zone List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            Active Zones ({zones.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {zones.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No zones created yet. Use the map above to draw your first zone.
            </p>
          ) : (
            <div className="space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge style={{ backgroundColor: getZoneColor(zone.type) }}>
                      {zone.type.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{zone.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {zone.coordinates.length} points
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(zone.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}