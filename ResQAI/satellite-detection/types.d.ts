declare module 'google-map-react' {
  import { Component } from 'react';

  interface GoogleMapReactProps {
    bootstrapURLKeys?: {
      key: string;
      language?: string;
      region?: string;
      libraries?: string[];
    };
    defaultCenter?: { lat: number; lng: number };
    center?: { lat: number; lng: number };
    defaultZoom?: number;
    zoom?: number;
    hoverDistance?: number;
    margin?: [number, number, number, number];
    debounced?: boolean;
    draggable?: boolean;
    options?: any;
    yesIWantToUseGoogleMapApiInternals?: boolean;
    onGoogleApiLoaded?: (map: any) => void;
    onChange?: (changeEventObject: any) => void;
    onClick?: (clickEventObject: any) => void;
    onChildClick?: (key: any, childProps: any) => void;
    onChildMouseEnter?: (key: any, childProps: any) => void;
    onChildMouseLeave?: (key: any, childProps: any) => void;
    resetBoundsOnResize?: boolean;
    layerTypes?: string[];
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export default class GoogleMapReact extends Component<GoogleMapReactProps> {}
}

export interface EventGeometry {
  type: string;
  coordinates: [number, number];
  date: string;
}

export interface EventCategory {
  id: number;
  title: string;
}

export interface WildfireEvent {
  id: string;
  title: string;
  categories: EventCategory[];
  geometries: EventGeometry[];
}

export interface LocationInfo {
  id: string;
  title: string;
  date: string;
}