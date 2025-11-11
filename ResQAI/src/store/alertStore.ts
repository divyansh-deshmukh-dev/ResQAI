import { create } from 'zustand';

interface Alert {
  id: string;
  type: "flood" | "earthquake" | "wildfire" | "cyclone" | "fire";
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  message: string;
  acknowledged: boolean;
}

interface AlertStore {
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string) => void;
  removeAlert: (id: string) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 50), // Keep only latest 50 alerts
    })),
  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      ),
    })),
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),
}));