import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';

import { MapMarkerStatus } from '../../../shared/map/map.models';

type DeviceStatus = 'healthy' | 'warning' | 'critical' | 'offline';
type AlarmSeverity = 'critical' | 'major' | 'warning' | 'minor';

type TowerDetail = {
  id: string;
  name: string;
  city: string;
  location: string;
  latitude: number;
  longitude: number;
  status: MapMarkerStatus;
  fuelLevel: number;
  openAlarms: number;
  openTickets: number;
};

type Device = {
  id: string;
  name: string;
  type: string;
  status: DeviceStatus;
  metrics: {
    label: string;
    value: string | number;
  }[];
};

type TowerAlarm = {
  id: string;
  title: string;
  description: string;
  severity: AlarmSeverity;
  time: string;
};

@Component({
  selector: 'to-tower-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, TagModule],
  templateUrl: './tower-detail.component.html',
  styleUrl: './tower-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TowerDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly towerId = this.route.snapshot.paramMap.get('id') ?? 'TW001';

  readonly towers: TowerDetail[] = [
    {
      id: 'TW001',
      name: 'Tower Sharjah 01',
      city: 'Sharjah',
      location: 'Industrial Area',
      latitude: 25.3463,
      longitude: 55.4209,
      status: 'warning',
      fuelLevel: 64.3,
      openAlarms: 1,
      openTickets: 3,
    },
    {
      id: 'TW002',
      name: 'Tower Dubai 02',
      city: 'Dubai',
      location: 'Business Bay',
      latitude: 25.185,
      longitude: 55.2708,
      status: 'healthy',
      fuelLevel: 62.1,
      openAlarms: 1,
      openTickets: 1,
    },
    {
      id: 'TW006',
      name: 'Tower Abu 06',
      city: 'Abu Dhabi',
      location: 'Al Danah',
      latitude: 24.4539,
      longitude: 54.3773,
      status: 'critical',
      fuelLevel: 67.7,
      openAlarms: 4,
      openTickets: 3,
    },
  ];

  readonly tower = computed(() => {
    return (
      this.towers.find((tower) => tower.id === this.towerId) ??
      this.towers[0]
    );
  });

  readonly devices: Device[] = [
    {
      id: 'transmitter',
      name: 'Transmitter',
      type: 'transmitter',
      status: 'healthy',
      metrics: [
        { label: 'Power output W', value: 66.2 },
        { label: 'Frequency MHz', value: 895.3 },
        { label: 'Signal dBm', value: -62.2 },
      ],
    },
    {
      id: 'receiver',
      name: 'Receiver',
      type: 'receiver',
      status: 'offline',
      metrics: [
        { label: 'Signal dBm', value: -89.1 },
        { label: 'SNR dB', value: 24.2 },
      ],
    },
    {
      id: 'battery',
      name: 'Battery Bank',
      type: 'battery',
      status: 'healthy',
      metrics: [
        { label: 'Voltage V', value: 50.9 },
        { label: 'Capacity %', value: 68.9 },
        { label: 'Current A', value: -12.8 },
      ],
    },
    {
      id: 'generator',
      name: 'Generator',
      type: 'generator',
      status: 'healthy',
      metrics: [
        { label: 'Fuel %', value: 49.2 },
        { label: 'Runtime hrs', value: 2265 },
        { label: 'Status', value: 'Standby' },
      ],
    },
    {
      id: 'fuel',
      name: 'Fuel Sensor',
      type: 'fuel',
      status: 'healthy',
      metrics: [
        { label: 'Fuel %', value: 88.2 },
        { label: 'Tank liters', value: 627 },
      ],
    },
    {
      id: 'temperature',
      name: 'Temperature Sensor',
      type: 'temperature',
      status: 'warning',
      metrics: [
        { label: 'Temp C', value: 61.7 },
        { label: 'Humidity %', value: 26 },
      ],
    },
    {
      id: 'power',
      name: 'Power Unit',
      type: 'power',
      status: 'healthy',
      metrics: [
        { label: 'Voltage V', value: 237.7 },
        { label: 'Current A', value: 5.1 },
        { label: 'Power kW', value: 3 },
      ],
    },
    {
      id: 'rectifier',
      name: 'Rectifier',
      type: 'rectifier',
      status: 'warning',
      metrics: [
        { label: 'Output voltage V', value: 52.2 },
        { label: 'Load %', value: 52.4 },
      ],
    },
  ];

  readonly latestAlarms: TowerAlarm[] = [
    {
      id: 'ALM-001',
      title: 'Power Failure',
      description: 'Mains power outage detected, running on backup',
      severity: 'critical',
      time: '2 min ago',
    },
    {
      id: 'ALM-002',
      title: 'Receiver Offline',
      description: 'Receiver stopped sending telemetry packets',
      severity: 'major',
      time: '8 min ago',
    },
    {
      id: 'ALM-003',
      title: 'High Temperature',
      description: 'Cabinet temperature crossed safe threshold',
      severity: 'warning',
      time: '14 min ago',
    },
  ];

  readonly onlineDevices = computed(() => {
    return this.devices.filter((device) => device.status !== 'offline').length;
  });

  readonly deviceHealthSummary = computed(() => {
    return [
      {
        label: 'Healthy',
        value: this.devices.filter((d) => d.status === 'healthy').length,
        className: 'success',
      },
      {
        label: 'Warning',
        value: this.devices.filter((d) => d.status === 'warning').length,
        className: 'warning',
      },
      {
        label: 'Critical',
        value: this.devices.filter((d) => d.status === 'critical').length,
        className: 'danger',
      },
      {
        label: 'Offline',
        value: this.devices.filter((d) => d.status === 'offline').length,
        className: 'muted',
      },
    ];
  });

  readonly telemetrySummary = [
    { label: 'Avg signal', value: '-65 dBm' },
    { label: 'Peak temp', value: '61°C' },
    { label: 'Samples', value: '6' },
  ];

  readonly deviceHealthData = {
    labels: ['Healthy', 'Warning', 'Critical', 'Offline'],
    datasets: [
      {
        data: [
          this.devices.filter((d) => d.status === 'healthy').length,
          this.devices.filter((d) => d.status === 'warning').length,
          this.devices.filter((d) => d.status === 'critical').length,
          this.devices.filter((d) => d.status === 'offline').length,
        ],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#64748b'],
        borderWidth: 0,
      },
    ],
  };

  readonly fuelData = computed(() => {
    const fuel = this.tower().fuelLevel;

    return {
      labels: ['Fuel', 'Empty'],
      datasets: [
        {
          data: [fuel, 100 - fuel],
          backgroundColor: [this.fuelColor(fuel), '#e2e8f0'],
          borderWidth: 0,
        },
      ],
    };
  });

  readonly telemetryTrendData = {
    labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25'],
    datasets: [
      {
        label: 'Signal dBm',
        data: [-64, -63, -65, -69, -67, -62],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Temperature °C',
        data: [48, 51, 53, 58, 61, 59],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  readonly doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  readonly lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: '#e2e8f0',
        },
      },
    },
  };

  severity(
    status: DeviceStatus | MapMarkerStatus
  ): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'healthy') return 'success';
    if (status === 'warning') return 'warn';
    if (status === 'critical') return 'danger';
    return 'secondary';
  }

  alarmSeverity(
    severity: AlarmSeverity
  ): 'success' | 'warn' | 'danger' | 'secondary' {
    if (severity === 'critical') return 'danger';
    if (severity === 'major' || severity === 'warning') return 'warn';
    return 'secondary';
  }

  fuelColor(fuel: number): string {
    if (fuel < 30) return '#ef4444';
    if (fuel < 50) return '#f59e0b';
    return '#22c55e';
  }
}