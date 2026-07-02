import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { Timeline, TimelineItem } from '../../shared/ui/timeline/timeline';

type DeviceStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';

type LiveDevice = {
  id: string;
  name: string;
  site: string;
  type: string;
  temperature: number;
  battery: number;
  signal: number;
  power: string;
  latency: string;
  uptime: string;
  lastSeen: string;
  status: DeviceStatus;
};

@Component({
  selector: 'to-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TableModule,
    Drawer,
    DetailField,
    StatusBadge,
    Timeline,
  ],
  templateUrl: './monitoring.html',
  styleUrl: './monitoring.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Monitoring {
  readonly search = signal('');
  readonly statusFilter = signal<'All' | DeviceStatus>('All');
  readonly selectedDevice = signal<LiveDevice | null>(null);
  readonly drawerOpen = signal(false);

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Healthy', value: 'Healthy' },
    { label: 'Warning', value: 'Warning' },
    { label: 'Critical', value: 'Critical' },
    { label: 'Offline', value: 'Offline' },
  ];

  readonly devices = signal<LiveDevice[]>([
    {
      id: 'DEV-001',
      name: 'Gateway Controller 01',
      site: 'Dubai Marina Tower',
      type: 'Gateway',
      temperature: 31,
      battery: 100,
      signal: 94,
      power: 'Online',
      latency: '42ms',
      uptime: '18d 4h',
      lastSeen: 'Just now',
      status: 'Healthy',
    },
    {
      id: 'DEV-002',
      name: 'Fuel Level Sensor',
      site: 'Dubai Marina Tower',
      type: 'Fuel Sensor',
      temperature: 29,
      battery: 67,
      signal: 72,
      power: 'Battery',
      latency: '78ms',
      uptime: '6d 2h',
      lastSeen: '3 mins ago',
      status: 'Warning',
    },
    {
      id: 'DEV-003',
      name: 'Transmitter Monitor',
      site: 'Abu Dhabi HQ',
      type: 'Transmitter',
      temperature: 36,
      battery: 92,
      signal: 38,
      power: 'Online',
      latency: '114ms',
      uptime: '12d 8h',
      lastSeen: '1 min ago',
      status: 'Critical',
    },
    {
      id: 'DEV-004',
      name: 'Warehouse Gateway',
      site: 'Ajman Coastal Warehouse',
      type: 'Gateway',
      temperature: 0,
      battery: 0,
      signal: 0,
      power: 'Offline',
      latency: '-',
      uptime: '-',
      lastSeen: '2h ago',
      status: 'Offline',
    },
  ]);

  readonly filteredDevices = computed(() => {
    const query = this.search().toLowerCase().trim();
    const status = this.statusFilter();

    return this.devices().filter((device) => {
      const matchesSearch =
        !query ||
        device.name.toLowerCase().includes(query) ||
        device.id.toLowerCase().includes(query) ||
        device.site.toLowerCase().includes(query) ||
        device.type.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || device.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  readonly summary = computed(() => {
    const devices = this.devices();

    return {
      healthy: devices.filter((d) => d.status === 'Healthy').length,
      warning: devices.filter((d) => d.status === 'Warning').length,
      critical: devices.filter((d) => d.status === 'Critical').length,
      offline: devices.filter((d) => d.status === 'Offline').length,
      total: devices.length,
    };
  });

  readonly timeline = signal<TimelineItem[]>([
    { title: 'Heartbeat received', time: 'Just now', tone: 'success' },
    { title: 'Telemetry updated', time: '30 sec ago', tone: 'info' },
    { title: 'Rule evaluation completed', time: '1 min ago', tone: 'info' },
  ]);

  openDevice(device: LiveDevice): void {
    this.selectedDevice.set(device);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedDevice.set(null);
  }

  statusTone(status: DeviceStatus): 'success' | 'warning' | 'danger' | 'muted' {
    if (status === 'Healthy') return 'success';
    if (status === 'Warning') return 'warning';
    if (status === 'Critical') return 'danger';
    return 'muted';
  }
}