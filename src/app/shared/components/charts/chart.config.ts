import { ChartOptions } from 'chart.js';

export const CHART_COLORS = {
  primary: '#0052ff',
  info: '#00b2ff',
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  offline: '#64748b',
};

const textColor = '#64748b';
const gridColor = 'rgba(148, 163, 184, 0.18)';

export function doughnutChartData(labels: string[], values: number[]) {
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          CHART_COLORS.healthy,
          CHART_COLORS.warning,
          CHART_COLORS.critical,
          CHART_COLORS.offline,
        ],
        borderWidth: 0,
      },
    ],
  };
}

export function barChartData(labels: string[], values: number[], label = 'Value') {
  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        borderRadius: 8,
        backgroundColor: CHART_COLORS.primary,
      },
    ],
  };
}

export function lineChartData(labels: string[], values: number[], label = 'Value') {
  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        tension: 0.4,
        borderWidth: 2,
        borderColor: CHART_COLORS.primary,
        backgroundColor: 'rgba(0, 82, 255, 0.12)',
        fill: true,
        pointRadius: 2,
      },
    ],
  };
}

export function radarChartData(labels: string[], values: number[], label = 'Health Score') {
  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        borderColor: CHART_COLORS.primary,
        backgroundColor: 'rgba(0, 82, 255, 0.16)',
        pointBackgroundColor: CHART_COLORS.primary,
        pointBorderColor: '#ffffff',
      },
    ],
  };
}

export function polarAreaChartData(labels: string[], values: number[]) {
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          CHART_COLORS.critical,
          CHART_COLORS.warning,
          CHART_COLORS.info,
          CHART_COLORS.offline,
        ],
        borderWidth: 0,
      },
    ],
  };
}

export const DOUGHNUT_CHART_OPTIONS: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        color: textColor,
      },
    },
  },
};

export const BAR_CHART_OPTIONS: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: textColor,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: gridColor,
      },
      ticks: {
        color: textColor,
      },
    },
  },
};

export const FUEL_BAR_CHART_OPTIONS: ChartOptions<'bar'> = {
  ...BAR_CHART_OPTIONS,
  scales: {
    ...BAR_CHART_OPTIONS.scales,
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: gridColor,
      },
      ticks: {
        color: textColor,
        callback: (value) => `${value}%`,
      },
    },
  },
};

export const LINE_CHART_OPTIONS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: textColor,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: gridColor,
      },
      ticks: {
        color: textColor,
      },
    },
  },
};

export const RADAR_CHART_OPTIONS: ChartOptions<'radar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: gridColor,
      },
      pointLabels: {
        color: textColor,
      },
      ticks: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

export const POLAR_AREA_CHART_OPTIONS: ChartOptions<'polarArea'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        color: textColor,
      },
    },
  },
};