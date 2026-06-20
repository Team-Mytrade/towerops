import { ChartColorSet } from './chart.models';

export const CHART_COLORS: ChartColorSet = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  offline: '#64748b',
  info: '#00b2ff',
  primary: '#0052ff',
};

export const CHART_STATUS_COLORS = [
  CHART_COLORS.healthy,
  CHART_COLORS.warning,
  CHART_COLORS.critical,
  CHART_COLORS.offline,
];

export const CHART_GRID_COLOR = 'rgba(148, 163, 184, 0.18)';
export const CHART_TEXT_COLOR = '#64748b';