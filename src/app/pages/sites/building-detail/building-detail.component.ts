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

type BuildingDetail = {
  id: string;
  name: string;
  emirate: string;
  location: string;
  latitude: number;
  longitude: number;
  status: MapMarkerStatus;
  floors: number;
  occupancy: number;
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

type BuildingAlarm = {
  id: string;
  title: string;
  description: string;
  severity: AlarmSeverity;
  time: string;
};

@Component({
  selector: 'to-building-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, TagModule],
  templateUrl: './building-detail.component.html',
  styleUrl: './building-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly buildingId = this.route.snapshot.paramMap.get('id') ?? 'BL-UAE-001';

  readonly buildings: BuildingDetail[] = [
    {
      id: 'BL-UAE-001',
      name: 'Dubai Operations Center',
      emirate: 'Dubai',
      location: 'JLT',
      latitude: 25.0714,
      longitude: 55.1438,
      status: 'healthy',
      floors: 18,
      occupancy: 82,
      openAlarms: 0,
      openTickets: 2,
    },
    {
      id: 'BL-UAE-002',
      name: 'Abu Dhabi Regional Hub',
      emirate: 'Abu Dhabi',
      location: 'Al Zahiyah',
      latitude: 24.488,
      longitude: 54.382,
      status: 'warning',
      floors: 22,
      occupancy: 74,
      openAlarms: 2,
      openTickets: 4,
    },
    {
      id: 'BL-UAE-004',
      name: 'Ajman Field Office',
      emirate: 'Ajman',
      location: 'Al Jurf',
      latitude: 25.385,
      longitude: 55.53,
      status: 'critical',
      floors: 8,
      occupancy: 61,
      openAlarms: 3,
      openTickets: 5,
    },
  ];

  readonly building = computed(() => {
    return (
      this.buildings.find((building) => building.id === this.buildingId) ??
      this.buildings[0]
    );
  });

  readonly devices: Device[] = [
    {
      id: 'hvac-unit',
      name: 'HVAC Unit',
      type: 'hvac',
      status: 'warning',
      metrics: [
        { label: 'Temperature C', value: 27.8 },
        { label: 'Load %', value: 76.2 },
        { label: 'Runtime hrs', value: 1284 },
      ],
    },
    {
      id: 'power-panel',
      name: 'Power Panel',
      type: 'power',
      status: 'healthy',
      metrics: [
        { label: 'Voltage V', value: 238.4 },
        { label: 'Current A', value: 42.1 },
        { label: 'Power kW', value: 18.7 },
      ],
    },
    {
      id: 'access-control',
      name: 'Access Control',
      type: 'security',
      status: 'healthy',
      metrics: [
        { label: 'Doors online', value: '14/14' },
        { label: 'Failed scans', value: 2 },
        { label: 'Lock status', value: 'Secure' },
      ],
    },
    {
      id: 'cctv-gateway',
      name: 'CCTV Gateway',
      type: 'surveillance',
      status: 'healthy',
      metrics: [
        { label: 'Cameras online', value: '32/34' },
        { label: 'Storage %', value: 68 },
        { label: 'Bitrate Mbps', value: 94.2 },
      ],
    },
    {
      id: 'lift-controller',
      name: 'Lift Controller',
      type: 'elevator',
      status: 'offline',
      metrics: [
        { label: 'Lifts online', value: '3/4' },
        { label: 'Trips today', value: 428 },
        { label: 'Fault code', value: 'L-204' },
      ],
    },
    {
      id: 'fire-alarm-panel',
      name: 'Fire Alarm Panel',
      type: 'safety',
      status: 'healthy',
      metrics: [
        { label: 'Zones active', value: 12 },
        { label: 'Smoke sensors', value: '84/84' },
        { label: 'Panel status', value: 'Normal' },
      ],
    },
    {
      id: 'indoor-temp',
      name: 'Indoor Temperature Sensor',
      type: 'temperature',
      status: 'warning',
      metrics: [
        { label: 'Avg temp C', value: 29.4 },
        { label: 'Humidity %', value: 58 },
      ],
    },
    {
      id: 'network-switch',
      name: 'Network Switch',
      type: 'network',
      status: 'healthy',
      metrics: [
        { label: 'Ports active', value: '38/48' },
        { label: 'Throughput Mbps', value: 782 },
        { label: 'Packet loss %', value: 0.2 },
      ],
    },
  ];

  readonly latestAlarms: BuildingAlarm[] = [
    {
      id: 'BALM-001',
      title: 'HVAC Load High',
      description: 'Cooling unit load crossed 75% threshold',
      severity: 'warning',
      time: '4 min ago',
    },
    {
      id: 'BALM-002',
      title: 'Lift Controller Offline',
      description: 'One lift controller stopped reporting telemetry',
      severity: 'major',
      time: '11 min ago',
    },
    {
      id: 'BALM-003',
      title: 'Camera Stream Loss',
      description: 'Two CCTV streams unavailable on floor 7',
      severity: 'minor',
      time: '21 min ago',
    },
  ];

  readonly onlineDevices = computed(() => {
    return this.devices.filter((device) => device.status !== 'offline').length;
  });

  readonly deviceHealthSummary = computed(() => [
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
  ]);

  readonly occupancyData = computed(() => {
    const occupancy = this.building().occupancy;

    return {
      labels: ['Occupied', 'Available'],
      datasets: [
        {
          data: [occupancy, 100 - occupancy],
          backgroundColor: [this.occupancyColor(occupancy), '#e2e8f0'],
          borderWidth: 0,
        },
      ],
    };
  });

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

  readonly telemetryTrendData = {
    labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25'],
    datasets: [
      {
        label: 'HVAC Load %',
        data: [58, 61, 67, 72, 76, 74],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Indoor Temp °C',
        data: [25, 26, 27, 28, 29, 28.5],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  readonly telemetrySummary = [
    { label: 'Avg HVAC load', value: '68%' },
    { label: 'Peak temp', value: '29°C' },
    { label: 'Active floors', value: '18' },
  ];

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
    status: DeviceStatus | MapMarkerStatus | AlarmSeverity
  ): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'healthy') return 'success';
    if (status === 'warning' || status === 'major') return 'warn';
    if (status === 'critical') return 'danger';
    return 'secondary';
  }

  occupancyColor(value: number): string {
    if (value >= 85) return '#ef4444';
    if (value >= 70) return '#f59e0b';
    return '#22c55e';
  }
}