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

type WarehouseDetail = {
  id: string;
  name: string;
  emirate: string;
  location: string;
  latitude: number;
  longitude: number;
  status: MapMarkerStatus;
  zones: number;
  capacityUsed: number;
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

type WarehouseAlarm = {
  id: string;
  title: string;
  description: string;
  severity: AlarmSeverity;
  time: string;
};

@Component({
  selector: 'to-warehouse-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, TagModule],
  templateUrl: './warehouse-detail.component.html',
  styleUrl: './warehouse-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly warehouseId = this.route.snapshot.paramMap.get('id') ?? 'WH-UAE-001';

  readonly warehouses: WarehouseDetail[] = [
    {
      id: 'WH-UAE-001',
      name: 'Dubai Spare Parts Warehouse',
      emirate: 'Dubai',
      location: 'Al Quoz',
      latitude: 25.132,
      longitude: 55.244,
      status: 'healthy',
      zones: 6,
      capacityUsed: 68,
      openAlarms: 0,
      openTickets: 1,
    },
    {
      id: 'WH-UAE-002',
      name: 'Abu Dhabi Equipment Warehouse',
      emirate: 'Abu Dhabi',
      location: 'Mussafah',
      latitude: 24.35,
      longitude: 54.52,
      status: 'critical',
      zones: 8,
      capacityUsed: 91,
      openAlarms: 3,
      openTickets: 5,
    },
    {
      id: 'WH-UAE-003',
      name: 'Ajman Logistics Warehouse',
      emirate: 'Ajman',
      location: 'Al Jurf',
      latitude: 25.385,
      longitude: 55.53,
      status: 'warning',
      zones: 5,
      capacityUsed: 76,
      openAlarms: 1,
      openTickets: 2,
    },
  ];

  readonly warehouse = computed(() => {
    return (
      this.warehouses.find((item) => item.id === this.warehouseId) ??
      this.warehouses[0]
    );
  });

  readonly devices: Device[] = [
    {
      id: 'inventory-gateway',
      name: 'Inventory IoT Gateway',
      type: 'gateway',
      status: 'healthy',
      metrics: [
        { label: 'Packets/min', value: 1248 },
        { label: 'Sync latency ms', value: 86 },
        { label: 'Readers online', value: '18/18' },
      ],
    },
    {
      id: 'fuel-storage',
      name: 'Fuel Storage Sensor',
      type: 'fuel',
      status: 'warning',
      metrics: [
        { label: 'Fuel %', value: 44.8 },
        { label: 'Tank liters', value: 1180 },
        { label: 'Leak status', value: 'Clear' },
      ],
    },
    {
      id: 'warehouse-generator',
      name: 'Generator',
      type: 'generator',
      status: 'healthy',
      metrics: [
        { label: 'Fuel %', value: 72 },
        { label: 'Runtime hrs', value: 1844 },
        { label: 'Status', value: 'Standby' },
      ],
    },
    {
      id: 'warehouse-power-unit',
      name: 'Power Unit',
      type: 'power',
      status: 'healthy',
      metrics: [
        { label: 'Voltage V', value: 239.2 },
        { label: 'Current A', value: 18.4 },
        { label: 'Load kW', value: 8.6 },
      ],
    },
    {
      id: 'warehouse-cctv',
      name: 'CCTV Gateway',
      type: 'surveillance',
      status: 'healthy',
      metrics: [
        { label: 'Cameras online', value: '24/24' },
        { label: 'Storage %', value: 71 },
        { label: 'Bitrate Mbps', value: 64.5 },
      ],
    },
    {
      id: 'door-sensor',
      name: 'Door Sensor',
      type: 'access',
      status: 'critical',
      metrics: [
        { label: 'Doors online', value: '7/8' },
        { label: 'Open events', value: 42 },
        { label: 'Fault zone', value: 'Zone B' },
      ],
    },
    {
      id: 'warehouse-temperature',
      name: 'Temperature Sensor',
      type: 'temperature',
      status: 'warning',
      metrics: [
        { label: 'Temp C', value: 33.6 },
        { label: 'Humidity %', value: 62 },
      ],
    },
    {
      id: 'humidity-sensor',
      name: 'Humidity Sensor',
      type: 'humidity',
      status: 'healthy',
      metrics: [
        { label: 'Humidity %', value: 58 },
        { label: 'Dew point C', value: 19.4 },
      ],
    },
  ];

  readonly latestAlarms: WarehouseAlarm[] = [
    {
      id: 'WALM-001',
      title: 'Door Sensor Fault',
      description: 'Zone B door sensor stopped reporting reliably',
      severity: 'critical',
      time: '3 min ago',
    },
    {
      id: 'WALM-002',
      title: 'Capacity Threshold High',
      description: 'Warehouse capacity crossed 90% threshold',
      severity: 'major',
      time: '12 min ago',
    },
    {
      id: 'WALM-003',
      title: 'Temperature Rising',
      description: 'Storage temperature is above configured limit',
      severity: 'warning',
      time: '19 min ago',
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

  readonly capacityData = computed(() => {
    const used = this.warehouse().capacityUsed;

    return {
      labels: ['Used', 'Free'],
      datasets: [
        {
          data: [used, 100 - used],
          backgroundColor: [this.capacityColor(used), '#e2e8f0'],
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
        label: 'Capacity %',
        data: [84, 86, 88, 89, 91, 90],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Temperature °C',
        data: [29, 30, 31, 32, 34, 33],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  readonly telemetrySummary = [
    { label: 'Capacity used', value: '91%' },
    { label: 'Peak temp', value: '34°C' },
    { label: 'Zones active', value: '8' },
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

  capacityColor(value: number): string {
    if (value >= 90) return '#ef4444';
    if (value >= 70) return '#f59e0b';
    return '#22c55e';
  }
}