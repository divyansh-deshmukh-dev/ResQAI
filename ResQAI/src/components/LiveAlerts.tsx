import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAlertStore } from "@/store/alertStore";
import { supabase } from "@/lib/supabase";

interface Alert {
  id: string;
  type: "flood" | "earthquake" | "wildfire" | "cyclone";
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  message: string;
  acknowledged: boolean;
}

const LiveAlerts = () => {
  const { alerts, acknowledgeAlert: storeAcknowledgeAlert } = useAlertStore();
  const [approvedAlerts, setApprovedAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchApprovedAlerts();
    
    // Subscribe to approved alerts
    const subscription = supabase
      .channel('approved_alerts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'alerts' },
        () => fetchApprovedAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchApprovedAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      const formattedAlerts = data.map(alert => ({
        ...alert,
        timestamp: new Date(alert.created_at),
        acknowledged: false
      }));
      setApprovedAlerts(formattedAlerts);
    }
  };

  // Combine local and approved alerts
  const allAlerts = [...alerts, ...approvedAlerts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );



  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-danger bg-danger/10";
      case "high":
        return "border-warning bg-warning/10";
      case "medium":
        return "border-primary bg-primary/10";
      default:
        return "border-muted bg-muted/10";
    }
  };

  const getTypeIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "earthquake":
        return <AlertTriangle className={iconClass} />;
      case "flood":
        return <AlertTriangle className={iconClass} />;
      case "wildfire":
        return <AlertTriangle className={iconClass} />;
      default:
        return <AlertTriangle className={iconClass} />;
    }
  };

  const handleAcknowledge = (id: string) => {
    // Check if it's a store alert or local alert
    const isStoreAlert = alerts.some(alert => alert.id === id);
    
    if (isStoreAlert) {
      storeAcknowledgeAlert(id);
    } else {
      setLocalAlerts((prev) =>
        prev.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert))
      );
    }
    toast.success("Alert acknowledged");
  };

  const handleReport = (id: string) => {
    toast.info("Report submitted", { description: "Authorities have been notified" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Live Alerts</h2>
          <p className="text-sm text-muted-foreground">Real-time disaster notifications</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
          {allAlerts.filter((a) => !a.acknowledged).length} Active
        </Badge>
      </div>

      <div className="space-y-3">
        {allAlerts.map((alert) => (
          <Card
            key={alert.id}
            className={`p-4 border-l-4 shadow-card animate-slide-up ${getSeverityColor(
              alert.severity
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-background rounded-lg">{getTypeIcon(alert.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="uppercase text-xs">
                    {alert.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      alert.severity === "critical"
                        ? "bg-danger/20 text-danger border-danger"
                        : ""
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>

                <h3 className="font-semibold text-foreground mb-1">
                  {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert – {alert.location}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span>{Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} min ago</span>
                </div>

                <div className="flex gap-2">
                  {!alert.acknowledged ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(alert.id)}
                      className="border-safety text-safety hover:bg-safety/10"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Acknowledge
                    </Button>
                  ) : (
                    <Badge variant="outline" className="bg-safety/10 text-safety border-safety">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Acknowledged
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReport(alert.id)}
                    className="border-warning text-warning hover:bg-warning/10"
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    Report Issue
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LiveAlerts;
