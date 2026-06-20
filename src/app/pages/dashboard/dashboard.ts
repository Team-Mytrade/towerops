import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ChartModule } from 'primeng/chart';
import { MapComponent } from '../../shared/map/map.component';
import { MapMarker } from '../../shared/map/map.models';
import { TowerMap } from '../../shared/map/tower-map/tower-map';


type Kpi = {
  label: string;
  value: string;
  icon: string;
  variant: 'healthy' | 'warning' | 'critical' | 'info';
  testId: string;
};

type HealthItem = {
  name: string;
  value: number;
  color: string;
};

type Alarm = {
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'warning' | 'info';
};

type FuelSite = {
  code: string;
  fuel: number;
};

type Maintenance = {
  id: string;
  day: string;
  month: string;
  title: string;
  site: string;
  window: string;
  priority: 'critical' | 'major' | 'minor';
};

@Component({
  selector: 'to-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, TowerMap],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard{
  readonly towers: MapMarker[] = [
  {
    id: 'TW001',
    name: 'Dubai Marina Tower',
    location: 'Dubai Marina',
    emirate: 'Dubai',
    latitude: 25.0806,
    longitude: 55.1404,
    status: 'healthy',
    type: 'tower',
    activeAlarms: 0,
    deviceCount: 18,
    popupContent: 'TW001 · Dubai Marina Tower · Healthy',
  },
  {
    id: 'TW002',
    name: 'Business Bay Tower',
    location: 'Business Bay',
    emirate: 'Dubai',
    latitude: 25.185,
    longitude: 55.272,
    status: 'warning',
    type: 'tower',
    activeAlarms: 2,
    deviceCount: 21,
    popupContent: 'TW002 · Business Bay Tower · Warning',
  },
  {
    id: 'TW003',
    name: 'Abu Dhabi Central Tower',
    location: 'Central Abu Dhabi',
    emirate: 'Abu Dhabi',
    latitude: 24.4539,
    longitude: 54.3773,
    status: 'critical',
    type: 'tower',
    activeAlarms: 5,
    deviceCount: 24,
    popupContent: 'TW003 · Abu Dhabi Central Tower · Critical',
  },
  {
    id: 'TW004',
    name: 'Ajman Coastal Tower',
    location: 'Ajman Coast',
    emirate: 'Ajman',
    latitude: 25.4052,
    longitude: 55.5136,
    status: 'offline',
    type: 'tower',
    activeAlarms: 1,
    deviceCount: 14,
    popupContent: 'TW004 · Ajman Coastal Tower · Offline',
  },
];

  readonly kpis: Kpi[] = [
    {
      label: 'Total Sites',
      value: '36',
      icon: 'fa-solid fa-tower-broadcast',
      variant: 'info',
      testId: 'kpi-total-sites',
    },
    {
      label: 'Healthy',
      value: '23',
      icon: 'fa-solid fa-bolt',
      variant: 'healthy',
      testId: 'kpi-healthy',
    },
    {
      label: 'Critical',
      value: '6',
      icon: 'fa-solid fa-triangle-exclamation',
      variant: 'critical',
      testId: 'kpi-critical',
    },
    {
      label: 'Open Alarms',
      value: '49',
      icon: 'fa-solid fa-bell',
      variant: 'warning',
      testId: 'kpi-open-alarms',
    },
    {
      label: 'Open Tickets',
      value: '31',
      icon: 'fa-solid fa-ticket',
      variant: 'info',
      testId: 'kpi-open-tickets',
    },
    {
      label: 'Devices Online',
      value: '229/234',
      icon: 'fa-solid fa-server',
      variant: 'healthy',
      testId: 'kpi-devices-online',
    },
  ];

  readonly healthDistribution: HealthItem[] = [
    { name: 'Healthy', value: 23, color: '#10B981' },
    { name: 'Warning', value: 5, color: '#F59E0B' },
    { name: 'Critical', value: 6, color: '#EF4444' },
    { name: 'Offline', value: 2, color: '#64748B' },
  ];

  readonly latestAlarms: Alarm[] = [
    {
      title: 'Power Failure',
      description: 'Mains power outage detected, running on backup',
      severity: 'critical',
    },
    {
      title: 'Low Fuel Level',
      description: 'Generator fuel below 20% threshold',
      severity: 'major',
    },
    {
      title: 'Battery Voltage Drop',
      description: 'Battery voltage trending down',
      severity: 'warning',
    },
    {
      title: 'High Temperature Alert',
      description: 'Device temperature exceeded threshold',
      severity: 'critical',
    },
    {
      title: 'Maintenance Due',
      description: 'Scheduled maintenance window approaching',
      severity: 'minor',
    },
  ];

  readonly fuelSites: FuelSite[] = [
    { code: 'TW001', fuel: 64 },
    { code: 'TW002', fuel: 62 },
    { code: 'TW003', fuel: 77 },
    { code: 'TW004', fuel: 28 },
    { code: 'TW005', fuel: 75 },
    { code: 'TW006', fuel: 86 },
    { code: 'TW007', fuel: 78 },
    { code: 'TW008', fuel: 68 },
  ];

  readonly maintenances: Maintenance[] = [
    {
      id: 'mnt-001',
      day: '24',
      month: 'Jun',
      title: 'Generator Inspection',
      site: 'Business Bay Tower',
      window: '09:00 AM - 11:00 AM',
      priority: 'major',
    },
    {
      id: 'mnt-002',
      day: '25',
      month: 'Jun',
      title: 'Battery Bank Replacement',
      site: 'Abu Dhabi Central Tower',
      window: '02:00 PM - 05:00 PM',
      priority: 'critical',
    },
    {
      id: 'mnt-003',
      day: '27',
      month: 'Jun',
      title: 'Antenna Alignment',
      site: 'Dubai Marina Tower',
      window: '10:30 AM - 12:30 PM',
      priority: 'minor',
    },
    {
      id: 'mnt-004',
      day: '29',
      month: 'Jun',
      title: 'Cooling Unit Service',
      site: 'Ajman Coastal Tower',
      window: '04:00 PM - 06:00 PM',
      priority: 'major',
    },
  ];

  readonly siteHealthData = {
    labels: this.healthDistribution.map((item) => item.name),
    datasets: [
      {
        data: this.healthDistribution.map((item) => item.value),
        backgroundColor: this.healthDistribution.map((item) => item.color),
        borderWidth: 0,
      },
    ],
  };

  readonly alarmTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Critical',
        data: [4, 6, 3, 7, 5, 2, 4],
        backgroundColor: '#EF4444',
        borderRadius: 6,
      },
      {
        label: 'Major',
        data: [7, 9, 8, 6, 10, 5, 7],
        backgroundColor: '#F59E0B',
        borderRadius: 6,
      },
      {
        label: 'Minor',
        data: [12, 10, 14, 11, 9, 8, 12],
        backgroundColor: '#FACC15',
        borderRadius: 6,
      },
    ],
  };

  readonly powerStatusData = {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    datasets: [
      {
        label: 'Grid Power',
        data: [96, 95, 97, 92, 94, 96],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  readonly doughnutOptions = {
    cutout: '68%',
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  readonly barOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: '#E2E8F0',
        },
      },
    },
  };

  readonly lineOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      y: {
        min: 80,
        max: 100,
        ticks: {
          font: {
            size: 10,
          },
        },
        grid: {
          color: '#E2E8F0',
        },
      },
    },
  };

  getFuelColor(fuel: number): string {
    if (fuel < 30) return '#EF4444';
    if (fuel < 50) return '#F59E0B';
    return '#10B981';
  }

  getSeverityClass(severity: Alarm['severity']): string {
    return `to-alarm--${severity}`;
  }
}