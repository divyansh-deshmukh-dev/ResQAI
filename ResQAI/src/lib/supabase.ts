import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ujogfauhidyeaxnrqjxw.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqb2dmYXVoaWR5ZWF4bnJxanh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjY4OTIsImV4cCI6MjA3ODIwMjg5Mn0.6HaEp8VKbxvk1LKCOv1X73cEESBr3Or9lRLCIPUPvao'

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Announcement {
  id: string
  title: string
  message: string
  created_at: string
}