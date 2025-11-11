import { useState, useEffect } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Thermometer, CloudRain, Activity, CheckCircle, AlertCircle, XCircle, Plus, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface SensorData {
  earthquake: number;
  flood: number;
  fire: number;
}

export function IoTAlertsPage() {
  const { 
    alerts, 
    fetchAlerts, 
    approveAlert, 
    declineAlert
  } = useAdminStore()

  const [sensorData, setSensorData] = useState<SensorData>({
    earthquake: 2.1,
    flood: 35,
    fire: 25,
  });
  const [mode, setMode] = useState<"auto" | "manual">("auto");

  const thresholds = {
    earthquake: 5.0,
    flood: 70,
    fire: 80,
  };

  useEffect(() => {
    fetchAlerts()
  }, [])

  // Auto-simulation
  useEffect(() => {
    if (mode !== "auto") return;

    const interval = setInterval(() => {
      setSensorData((prev) => ({
        earthquake: Math.max(0, Math.min(10, prev.earthquake + (Math.random() - 0.5) * 0.5)),
        flood: Math.max(0, Math.min(100, prev.flood + (Math.random() - 0.5) * 5)),
        fire: Math.max(0, Math.min(100, prev.fire + (Math.random() - 0.5) * 8)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [mode]);



  const [alertGenerated, setAlertGenerated] = useState<{[key: string]: boolean}>({});

  // Generate alert only when threshold is crossed and no pending alert exists
  const generateAlert = async (type: string, value: number) => {
    const threshold = thresholds[type as keyof typeof thresholds];
    
    if (value >= threshold && !alertGenerated[type]) {
      const { data: existingAlert } = await supabase
        .from('alerts')
        .select('id')
        .eq('type', type)
        .eq('approved', false)
        .single();
      
      if (!existingAlert) {
        await supabase.from('alerts').insert({
          type: type as any,
          location: 'IoT Sensor Network',
          severity: value >= threshold * 1.2 ? 'critical' : 'high',
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} threshold breached: ${value.toFixed(1)}`,
          approved: false
        });
        
        setAlertGenerated(prev => ({ ...prev, [type]: true }));
        fetchAlerts();
        toast.error(`${type.toUpperCase()} Alert Generated!`);
      }
    } else if (value < threshold) {
      setAlertGenerated(prev => ({ ...prev, [type]: false }));
    }
  };

  const adjustSensor = (type: keyof SensorData, delta: number) => {
    if (mode === "manual") {
      setSensorData((prev) => ({
        ...prev,
        [type]: Math.max(0, Math.min(type === "earthquake" ? 10 : 100, prev[type] + delta)),
      }));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  // Group unapproved alerts by type and show only the latest one per type
  const unapprovedAlerts = alerts
    .filter(alert => !alert.approved)
    .reduce((acc, alert) => {
      const existing = acc.find(a => a.type === alert.type);
      if (!existing || new Date(alert.created_at) > new Date(existing.created_at)) {
        return [...acc.filter(a => a.type !== alert.type), alert];
      }
      return acc;
    }, [] as typeof alerts)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">IoT Monitoring & Alert Management</h1>
      
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={mode === "auto" ? "default" : "outline"}
          onClick={() => setMode("auto")}
        >
          Auto Mode
        </Button>
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => setMode("manual")}
        >
          Manual Mode
        </Button>
      </div>

      {/* IoT Sensor Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(sensorData).map(([type, value]) => {
          const threshold = thresholds[type as keyof typeof thresholds];
          const getIcon = () => {
            switch (type) {
              case "earthquake": return <Activity className="h-5 w-5" />;
              case "flood": return <CloudRain className="h-5 w-5" />;
              case "fire": return <Thermometer className="h-5 w-5" />;
            }
          };
          
          return (
            <Card key={type}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${value >= threshold ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                      {getIcon()}
                    </div>
                    <CardTitle className="capitalize">{type}</CardTitle>
                  </div>
                  <Badge variant={value >= threshold ? "destructive" : "secondary"}>
                    {value >= threshold ? "ALERT" : "NORMAL"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {value.toFixed(1)}{type === "earthquake" ? "" : "%"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Threshold: {threshold}{type === "earthquake" ? "" : "%"}
                  </div>
                </div>
                
                <Progress 
                  value={type === "earthquake" ? (value / 10) * 100 : value} 
                  className="h-3"
                />
                
                <Slider
                  value={[value]}
                  onValueChange={mode === "manual" ? ([newValue]) => 
                    setSensorData(prev => ({ ...prev, [type]: newValue }))
                   : undefined}
                  onValueCommit={mode === "manual" ? ([newValue]) => 
                    generateAlert(type, newValue)
                   : undefined}
                  max={type === "earthquake" ? 10 : 100}
                  step={type === "earthquake" ? 0.1 : 1}
                  disabled={mode === "auto"}
                />
                
                {mode === "manual" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustSensor(type as keyof SensorData, type === "earthquake" ? -0.5 : -5)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustSensor(type as keyof SensorData, type === "earthquake" ? 0.5 : 5)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Unapproved Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Pending Alert Approvals ({unapprovedAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unapprovedAlerts.length === 0 ? (
            <p className="text-muted-foreground">No pending alerts</p>
          ) : (
            <div className="space-y-4">
              {unapprovedAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{alert.type.toUpperCase()}</span>
                      <span className="text-sm text-muted-foreground">• {alert.location}</span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      onClick={async () => {
                        await approveAlert(alert.id)
                        await fetchAlerts()
                      }}
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={async () => {
                        await declineAlert(alert.id)
                        await fetchAlerts()
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Alerts History */}
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.slice(0, 10).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <span className="font-medium">{alert.type}</span>
                  <span className="text-sm text-muted-foreground">• {alert.location}</span>
                  {alert.approved && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}