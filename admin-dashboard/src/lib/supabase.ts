import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Alert {
  id: string
  type: 'flood' | 'earthquake' | 'wildfire' | 'cyclone' | 'fire'
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  approved: boolean
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  message: string
  created_at: string
}

export interface Report {
  id: string
  type: string
  description: string
  location: string
  photo_url?: string
  status: 'pending' | 'verified' | 'under_review'
  created_at: string
  user_id: string
}

export interface Zone {
  id: string
  type: 'danger' | 'safe' | 'rescue'
  coordinates: [number, number][]
  name: string
  created_at: string
}