import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Activity, Droplets, Flame, Plus, Minus, Wifi, WifiOff, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAlertStore } from "@/store/alertStore";

interface SensorData {
  earthquake: number;
  flood: number;
  fire: number;
}

interface SensorAlert {
  type: "earthquake" | "flood" | "fire";
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

const IoTMonitoring = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    earthquake: 2.1,
    flood: 35,
    fire: 25,
  });

  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [systemStatus, setSystemStatus] = useState({
    connected: true,
    lastUpdate: new Date(),
    sensorsOnline: 3,
    totalSensors: 3,
  });
  const addAlert = useAlertStore((state) => state.addAlert);

  const thresholds = {
    earthquake: 5.0,
    flood: 70,
    fire: 80,
  };

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

  // Update system status
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check thresholds and create alerts in Supabase
  useEffect(() => {
    Object.entries(sensorData).forEach(async ([type, value]) => {
      const threshold = thresholds[type as keyof typeof thresholds];
      if (value >= threshold) {
        const existingAlert = alerts.find(
          (alert) => alert.type === type && !alert.acknowledged
        );
        
        if (!existingAlert) {
          const newAlert: SensorAlert = {
            type: type as keyof SensorData,
            value,
            threshold,
            timestamp: new Date(),
            acknowledged: false,
          };
          
          setAlerts((prev) => [newAlert, ...prev]);
          
          // Create alert in Supabase for admin approval
          const { supabase } = await import('@/lib/supabase');
          await supabase.from('alerts').insert({
            type: type as any,
            location: 'IoT Sensor Network',
            severity: value >= threshold * 1.2 ? 'critical' : 'high',
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} threshold breached: ${value.toFixed(1)}`,
            approved: false
          });
          
          toast.error(`${type.toUpperCase()} Alert Generated!`, {
            description: `Sent to admin for approval: ${value.toFixed(1)}`,
          });
        }
      }
    });
  }, [sensorData, alerts]);

  const adjustSensor = (type: keyof SensorData, delta: number) => {
    if (mode === "manual") {
      setSensorData((prev) => ({
        ...prev,
        [type]: Math.max(0, Math.min(type === "earthquake" ? 10 : 100, prev[type] + delta)),
      }));
    }
  };

  const acknowledgeAlert = (index: number) => {
    setAlerts((prev) =>
      prev.map((alert, i) => (i === index ? { ...alert, acknowledged: true } : alert))
    );
    toast.success("Alert acknowledged");
  };

  const getSeverityColor = (type: keyof SensorData, value: number) => {
    const threshold = thresholds[type];
    if (value >= threshold * 1.2) return "text-red-500 bg-red-50 border-red-200";
    if (value >= threshold) return "text-orange-500 bg-orange-50 border-orange-200";
    if (value >= threshold * 0.8) return "text-yellow-500 bg-yellow-50 border-yellow-200";
    return "text-green-500 bg-green-50 border-green-200";
  };

  const getIcon = (type: keyof SensorData) => {
    switch (type) {
      case "earthquake": return <Activity className="h-5 w-5" />;
      case "flood": return <Droplets className="h-5 w-5" />;
      case "fire": return <Flame className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">IoT Monitoring</h1>
            <p className="text-muted-foreground">Real-time disaster sensor readings</p>
          </div>
          <div className="flex gap-2">
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
        </div>

        {/* Sensor Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(sensorData).map(([type, value]) => (
            <div key={type} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${value >= thresholds[type as keyof typeof thresholds] ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                    {getIcon(type as keyof SensorData)}
                  </div>
                  <h3 className="font-semibold capitalize text-foreground">{type}</h3>
                </div>
                <Badge variant={value >= thresholds[type as keyof typeof thresholds] ? "destructive" : "secondary"}>
                  {value >= thresholds[type as keyof typeof thresholds] ? "ALERT" : "NORMAL"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {value.toFixed(1)}
                    {type === "earthquake" ? "" : "%"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Threshold: {thresholds[type as keyof typeof thresholds]}
                    {type === "earthquake" ? "" : "%"}
                  </div>
                </div>

                <Progress 
                  value={type === "earthquake" ? (value / 10) * 100 : value} 
                  className="h-3"
                />

                <div className="space-y-2">
                  <Slider
                    value={[value]}
                    onValueChange={mode === "manual" ? ([newValue]) => 
                      setSensorData(prev => ({ ...prev, [type]: newValue })) : undefined
                    }
                    max={type === "earthquake" ? 10 : 100}
                    step={type === "earthquake" ? 0.1 : 1}
                    className="w-full"
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
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Active Alerts ({alerts.filter(a => !a.acknowledged).length})
            </h2>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    alert.acknowledged ? "bg-gray-50 opacity-60" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium capitalize">
                        {alert.type} Alert - {alert.value.toFixed(1)}
                        {alert.type === "earthquake" ? "" : "%"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Threshold: {alert.threshold} | {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(index)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* System Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
            {systemStatus.connected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            System Status
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm text-foreground">Earthquake Monitor</span>
              </div>
              <Badge variant={sensorData.earthquake >= thresholds.earthquake ? "destructive" : "secondary"}>
                {sensorData.earthquake >= thresholds.earthquake ? "ALERT" : "NORMAL"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-green-500" />
                <span className="text-sm text-foreground">Flood Monitor</span>
              </div>
              <Badge variant={sensorData.flood >= thresholds.flood ? "destructive" : "secondary"}>
                {sensorData.flood >= thresholds.flood ? "ALERT" : "NORMAL"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-green-500" />
                <span className="text-sm text-foreground">Fire Monitor</span>
              </div>
              <Badge variant={sensorData.fire >= thresholds.fire ? "destructive" : "secondary"}>
                {sensorData.fire >= thresholds.fire ? "ALERT" : "NORMAL"}
              </Badge>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border text-center">
            <div className="text-sm">
              <span className="text-muted-foreground">Last Update: </span>
              <span className="font-medium text-foreground">
                {systemStatus.lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IoTMonitoring;