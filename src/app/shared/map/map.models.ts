export type MapMarkerStatus =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'offline';

export type MapMarkerType =
  | 'tower'
  | 'building'
  | 'warehouse';

export interface MapMarker {
  id: string;
  name: string;
  location: string;
  emirate: string;
  latitude: number;
  longitude: number;
  status: MapMarkerStatus;
  type: MapMarkerType;
  activeAlarms: number;
  deviceCount: number;
  popupContent?: string;
}