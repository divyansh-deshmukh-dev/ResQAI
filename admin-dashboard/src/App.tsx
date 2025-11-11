import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { IoTAlertsPage } from './pages/IoTAlertsPage'
import { AnnouncementsPage } from './pages/AnnouncementsPage'
import { ReportsPage } from './pages/ReportsPage'
import { MapControlPage } from './pages/MapControlPage'
import { SettingsPage } from './pages/SettingsPage'
import { realtimeService } from './lib/realtime'

function App() {
  useEffect(() => {
    realtimeService.init()
    return () => realtimeService.cleanup()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<IoTAlertsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="map" element={<MapControlPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App