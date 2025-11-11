import { supabase } from './supabase'
import { useAdminStore } from '@/store/adminStore'

class RealtimeService {
  private subscriptions: any[] = []

  init() {
    this.subscribeToAlerts()
    this.subscribeToAnnouncements()
    this.subscribeToReports()
    this.subscribeToZones()
  }

  private subscribeToAlerts() {
    const subscription = supabase
      .channel('alerts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'alerts' },
        () => {
          useAdminStore.getState().fetchAlerts()
        }
      )
      .subscribe()

    this.subscriptions.push(subscription)
  }

  private subscribeToAnnouncements() {
    const subscription = supabase
      .channel('announcements')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          useAdminStore.getState().fetchAnnouncements()
        }
      )
      .subscribe()

    this.subscriptions.push(subscription)
  }

  private subscribeToReports() {
    const subscription = supabase
      .channel('reports')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          useAdminStore.getState().fetchReports()
        }
      )
      .subscribe()

    this.subscriptions.push(subscription)
  }

  private subscribeToZones() {
    const subscription = supabase
      .channel('zones')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'zones' },
        () => {
          useAdminStore.getState().fetchZones()
        }
      )
      .subscribe()

    this.subscriptions.push(subscription)
  }

  cleanup() {
    this.subscriptions.forEach(sub => {
      supabase.removeChannel(sub)
    })
    this.subscriptions = []
  }
}

export const realtimeService = new RealtimeService()