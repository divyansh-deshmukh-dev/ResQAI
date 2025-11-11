import { useMapEvents } from 'react-leaflet'

interface MapClickHandlerProps {
  onMapClick: (e: any) => void
}

export function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: onMapClick,
  })
  
  return null
}