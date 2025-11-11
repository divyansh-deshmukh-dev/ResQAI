import { create } from 'zustand'
import { supabase, Alert, Announcement, Report, Zone } from '@/lib/supabase'

interface AdminStore {
  alerts: Alert[]
  announcements: Announcement[]
  reports: Report[]
  zones: Zone[]
  iotData: {
    temperature: number
    rainfall: number
    seismic: number
  }
  
  // Actions
  fetchAlerts: () => Promise<void>
  approveAlert: (id: string) => Promise<void>
  declineAlert: (id: string) => Promise<void>
  createAnnouncement: (title: string, message: string) => Promise<void>
  fetchAnnouncements: () => Promise<void>
  fetchReports: () => Promise<void>
  updateReportStatus: (id: string, status: 'pending' | 'verified' | 'under_review') => Promise<void>
  fetchZones: () => Promise<void>
  createZone: (zone: Omit<Zone, 'id' | 'created_at'>) => Promise<void>
  updateIoTData: () => void
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  alerts: [],
  announcements: [],
  reports: [],
  zones: [],
  iotData: {
    temperature: 25,
    rainfall: 0,
    seismic: 0.1
  },

  fetchAlerts: async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) set({ alerts: data })
  },

  approveAlert: async (id: string) => {
    await supabase
      .from('alerts')
      .update({ approved: true })
      .eq('id', id)
    
    get().fetchAlerts()
  },

  declineAlert: async (id: string) => {
    await supabase
      .from('alerts')
      .delete()
      .eq('id', id)
    
    get().fetchAlerts()
  },

  createAnnouncement: async (title: string, message: string) => {
    await supabase
      .from('announcements')
      .insert({ title, message })
    
    get().fetchAnnouncements()
  },

  fetchAnnouncements: async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) set({ announcements: data })
  },

  fetchReports: async () => {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) set({ reports: data })
  },

  updateReportStatus: async (id: string, status: 'pending' | 'verified' | 'under_review') => {
    await supabase
      .from('reports')
      .update({ status })
      .eq('id', id)
    
    get().fetchReports()
  },

  fetchZones: async () => {
    const { data } = await supabase
      .from('zones')
      .select('*')
    
    if (data) set({ zones: data })
  },

  createZone: async (zone: Omit<Zone, 'id' | 'created_at'>) => {
    await supabase
      .from('zones')
      .insert(zone)
    
    get().fetchZones()
  },

  updateIoTData: () => {
    // Simulate IoT sensor data
    set({
      iotData: {
        temperature: 20 + Math.random() * 20,
        rainfall: Math.random() * 100,
        seismic: Math.random() * 2
      }
    })
  }
}))

// Auto-generate alerts based on IoT thresholds
setInterval(() => {
  const store = useAdminStore.getState()
  const { iotData } = store
  
  if (iotData.temperature > 35) {
    supabase.from('alerts').insert({
      type: 'fire',
      location: 'Sensor Grid A',
      severity: 'high',
      message: `High temperature detected: ${iotData.temperature.toFixed(1)}°C`,
      approved: false
    })
  }
  
  if (iotData.rainfall > 80) {
    supabase.from('alerts').insert({
      type: 'flood',
      location: 'Sensor Grid B',
      severity: 'critical',
      message: `Heavy rainfall detected: ${iotData.rainfall.toFixed(1)}mm/h`,
      approved: false
    })
  }
  
  if (iotData.seismic > 1.5) {
    supabase.from('alerts').insert({
      type: 'earthquake',
      location: 'Seismic Station C',
      severity: 'critical',
      message: `Seismic activity detected: ${iotData.seismic.toFixed(2)} magnitude`,
      approved: false
    })
  }
}, 30000) // Check every 30 seconds