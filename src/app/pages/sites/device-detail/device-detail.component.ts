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

type DeviceStatus = 'healthy' | 'warning' | 'critical' | 'offline';
type AlarmSeverity = 'critical' | 'major' | 'warning' | 'minor';
type MaintenanceStatus = 'completed' | 'scheduled' | 'pending';

type DeviceMetric = {
  key: string;
  label: string;
  value: number | string;
};

type DeviceDetail = {
  id: string;
  name: string;
  type: string;
  towerId: string;
  towerName: string;
  status: DeviceStatus;
  lastSeen: string;
  metrics: DeviceMetric[];
};

type DeviceAlarm = {
  id: string;
  title: string;
  severity: AlarmSeverity;
};

type Technician = {
  name: string;
  specialization: string;
  online: boolean;
};

type MaintenanceItem = {
  title: string;
  date: string;
  technician: string;
  status: MaintenanceStatus;
};

@Component({
  selector: 'to-device-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, TagModule],
  templateUrl: './device-detail.component.html',
  styleUrl: './device-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly deviceId = this.route.snapshot.paramMap.get('id') ?? 'transmitter';

  readonly devices: DeviceDetail[] = [
    {
      id: 'transmitter',
      name: 'Transmitter',
      type: 'transmitter',
      towerId: 'TW001',
      towerName: 'Tower Sharjah 01',
      status: 'healthy',
      lastSeen: '11:22:06 PM',
      metrics: [
        { key: 'power_output_w', label: 'Power output W', value: 71.08 },
        { key: 'frequency_mhz', label: 'Frequency MHz', value: 881.58 },
        { key: 'signal_dbm', label: 'Signal dBm', value: -61.5 },
      ],
    },
    {
      id: 'receiver',
      name: 'Receiver',
      type: 'receiver',
      towerId: 'TW001',
      towerName: 'Tower Sharjah 01',
      status: 'offline',
      lastSeen: '11:13:42 PM',
      metrics: [
        { key: 'signal_dbm', label: 'Signal dBm', value: -89.1 },
        { key: 'snr_db', label: 'SNR dB', value: 24.2 },
      ],
    },
    {
      id: 'battery',
      name: 'Battery Bank',
      type: 'battery',
      towerId: 'TW001',
      towerName: 'Tower Sharjah 01',
      status: 'healthy',
      lastSeen: '11:22:02 PM',
      metrics: [
        { key: 'voltage_v', label: 'Voltage V', value: 50.9 },
        { key: 'capacity_pct', label: 'Capacity %', value: 68.9 },
        { key: 'current_a', label: 'Current A', value: -12.8 },
      ],
    },
    {
      id: 'generator',
      name: 'Generator',
      type: 'generator',
      towerId: 'TW001',
      towerName: 'Tower Sharjah 01',
      status: 'healthy',
      lastSeen: '11:22:01 PM',
      metrics: [
        { key: 'fuel_pct', label: 'Fuel %', value: 49.2 },
        { key: 'runtime_hrs', label: 'Runtime hrs', value: 2265 },
        { key: 'status', label: 'Status', value: 'Standby' },
      ],
    },
    {
      id: 'temperature',
      name: 'Temperature Sensor',
      type: 'temperature',
      towerId: 'TW001',
      towerName: 'Tower Sharjah 01',
      status: 'warning',
      lastSeen: '11:22:05 PM',
      metrics: [
        { key: 'temp_c', label: 'Temp C', value: 61.7 },
        { key: 'humidity_pct', label: 'Humidity %', value: 26 },
      ],
    },
    {
      id: 'rectifier',
      name: 'Rectifier',
      type: 'rectifier',
      towerId: 'TW001',
      towerName: 'Tower Sharjah 01',
      status: 'warning',
      lastSeen: '11:22:04 PM',
      metrics: [
        { key: 'output_voltage_v', label: 'Output voltage V', value: 52.2 },
        { key: 'load_pct', label: 'Load %', value: 52.4 },
      ],
    },
  ];

  readonly device = computed(() => {
    return (
      this.devices.find((device) => device.id === this.deviceId) ??
      this.devices[0]
    );
  });

  readonly primaryMetric = computed(() => {
    return this.device().metrics[0];
  });

  readonly alarms: DeviceAlarm[] = [
    {
      id: 'ALM-001',
      title: 'Power Failure',
      severity: 'critical',
    },
    {
      id: 'ALM-002',
      title: 'Signal degradation',
      severity: 'warning',
    },
  ];

  readonly technicians: Technician[] = [
    {
      name: 'Mohammed Khan',
      specialization: 'Power Systems',
      online: true,
    },
    {
      name: 'Rajesh Kumar',
      specialization: 'HVAC',
      online: true,
    },
    {
      name: 'Saleh Al Ali',
      specialization: 'RF & Signal',
      online: true,
    },
    {
      name: 'Priya Sharma',
      specialization: 'Generator & Fuel',
      online: true,
    },
  ];

  readonly maintenance: MaintenanceItem[] = [
    {
      title: 'Quarterly Inspection',
      date: '8/17/2026',
      technician: 'Mohammed Khan',
      status: 'completed',
    },
    {
      title: 'Signal calibration',
      date: '8/24/2026',
      technician: 'Saleh Al Ali',
      status: 'scheduled',
    },
    {
      title: 'Thermal check',
      date: '8/29/2026',
      technician: 'Rajesh Kumar',
      status: 'pending',
    },
  ];

  readonly trendData = computed(() => ({
    labels: [
      '11:10',
      '11:11',
      '11:12',
      '11:13',
      '11:14',
      '11:15',
      '11:16',
      '11:17',
      '11:18',
      '11:19',
      '11:20',
      '11:21',
      '11:22',
    ],
    datasets: [
      {
        label: this.primaryMetric().label,
        data: this.getTrendValues(this.primaryMetric().key),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        tension: 0.4,
        fill: true,
      },
    ],
  }));

  readonly lineOptions = {
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
          color: '#f1f5f9',
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: '#e2e8f0',
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  private getTrendValues(key: string): number[] {
    const trends: Record<string, number[]> = {
      power_output_w: [65, 68, 70, 69, 72, 71, 73, 70, 69, 72, 74, 70, 71],
      frequency_mhz: [881, 882, 881.8, 881.5, 882.1, 881.2, 881.7, 881.6, 882, 881.9, 881.5, 881.7, 881.58],
      signal_dbm: [-67, -65, -66, -68, -64, -63, -62, -65, -66, -64, -63, -62, -61.5],
      voltage_v: [49.9, 50.2, 50.5, 50.3, 50.8, 50.6, 50.9, 50.7, 50.8, 51, 50.9, 50.7, 50.9],
      temp_c: [52, 54, 56, 57, 58, 60, 61, 62, 61, 60, 61, 62, 61.7],
      output_voltage_v: [51.5, 51.9, 52, 52.2, 52.3, 52.1, 52, 52.4, 52.2, 52.1, 52.3, 52.5, 52.2],
    };

    return trends[key] ?? [10, 12, 11, 13, 15, 14, 16, 15, 14, 17, 16, 18, 17];
  }

  severity(
    status: DeviceStatus | AlarmSeverity | MaintenanceStatus
  ): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'healthy' || status === 'completed') return 'success';
    if (status === 'warning' || status === 'major' || status === 'scheduled') return 'warn';
    if (status === 'critical') return 'danger';
    return 'secondary';
  }

  initials(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}