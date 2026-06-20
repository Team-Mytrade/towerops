export type ChartSeverity =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'info';

export interface ChartColorSet {
  healthy: string;
  warning: string;
  critical: string;
  offline: string;
  info: string;
  primary: string;
}