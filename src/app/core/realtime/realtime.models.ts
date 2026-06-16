export type RealtimeConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type TowerHealthStatus =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'offline';

export interface TowerTelemetryEvent {
  towerId: string;
  signalStrength: number;
  fuelLevel: number;
  temperature: number;
  batteryLevel: number;
  generatorStatus: 'on' | 'off';
  powerStatus: 'grid' | 'battery' | 'generator';
  transmitterStatus: 'normal' | 'fault';
  receiverStatus: 'normal' | 'fault';
  healthStatus: TowerHealthStatus;
  timestamp: string;
}

export interface TowerAlertEvent {
  id: string;
  towerId: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  component: string;
  timestamp: string;
}

export interface TicketUpdateEvent {
  ticketId: string;
  towerId: string;
  status: 'open' | 'assigned' | 'on-site' | 'fix-submitted' | 'closed';
  assignedTo?: string;
  message?: string;
  timestamp: string;
}

export interface AppNotificationEvent {
  id: string;
  type: 'info' | 'success' | 'warn' | 'error';
  title: string;
  message?: string;
  timestamp: string;
}