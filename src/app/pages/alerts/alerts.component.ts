import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableColumn } from '../../shared/components/data-table/data-table.types';

type AlertSeverity = 'critical' | 'major' | 'warning' | 'minor';
type AlertStatus = 'open' | 'acknowledged' | 'assigned' | 'resolved';
type SiteType = 'tower' | 'building' | 'warehouse';

type AlertItem = {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  siteType: SiteType;
  siteName: string;
  assetName: string;
  location: string;
  emirate: string;
  createdAt: string;
  lastUpdated: string;
  assignedTo: string;
  telemetry: { label: string; value: string | number; unit?: string }[];
  timeline: { title: string; time: string; description: string }[];
};

@Component({
  selector: 'to-alerts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DrawerModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DataTable
  ],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsComponent {
  search = signal('');
  severity = signal<'all' | AlertSeverity>('all');
  status = signal<'all' | AlertStatus>('all');
  siteType = signal<'all' | SiteType>('all');

  selectedAlert = signal<AlertItem | null>(null);

  readonly alertColumns: DataTableColumn<AlertItem>[] = [
  { field: 'id', header: 'Alert ID', type: 'mono', width: '120px' },
  { field: 'title', header: 'Alert' },
  { field: 'severity', header: 'Severity', type: 'tag', width: '130px' },
  { field: 'status', header: 'Status', type: 'tag', width: '140px' },
  { field: 'siteName', header: 'Site' },
  { field: 'assetName', header: 'Asset' },
  { field: 'createdAt', header: 'Created', width: '120px' },
];

  readonly severityOptions = [
    { label: 'All Severity', value: 'all' },
    { label: 'Critical', value: 'critical' },
    { label: 'Major', value: 'major' },
    { label: 'Warning', value: 'warning' },
    { label: 'Minor', value: 'minor' },
  ];

  readonly statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Acknowledged', value: 'acknowledged' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'Resolved', value: 'resolved' },
  ];

  readonly siteTypeOptions = [
    { label: 'All Sites', value: 'all' },
    { label: 'Towers', value: 'tower' },
    { label: 'Buildings', value: 'building' },
    { label: 'Warehouses', value: 'warehouse' },
  ];

  readonly alerts = signal<AlertItem[]>([
    {
      id: 'ALM-001',
      title: 'Power Failure',
      description: 'Mains power outage detected. Site is currently running on battery backup.',
      severity: 'critical',
      status: 'open',
      siteType: 'tower',
      siteName: 'Tower Sharjah 01',
      assetName: 'Power Unit',
      location: 'Industrial Area',
      emirate: 'Sharjah',
      createdAt: '2 min ago',
      lastUpdated: 'Just now',
      assignedTo: 'Mohammed Khan',
      telemetry: [
        { label: 'Grid voltage', value: 0, unit: 'V' },
        { label: 'Battery', value: 68, unit: '%' },
        { label: 'Backup ETA', value: 3.4, unit: 'hrs' },
      ],
      timeline: [
        {
          title: 'Alert created',
          time: '2 min ago',
          description: 'Power threshold rule triggered from live telemetry.',
        },
        {
          title: 'NOC notified',
          time: '1 min ago',
          description: 'Critical alarm pushed to NOC dashboard.',
        },
      ],
    },
    {
      id: 'ALM-002',
      title: 'HVAC Load High',
      description: 'Cooling load crossed configured threshold in building equipment room.',
      severity: 'warning',
      status: 'acknowledged',
      siteType: 'building',
      siteName: 'Abu Dhabi Regional Hub',
      assetName: 'HVAC Controller',
      location: 'Al Zahiyah',
      emirate: 'Abu Dhabi',
      createdAt: '8 min ago',
      lastUpdated: '4 min ago',
      assignedTo: 'Rajesh Kumar',
      telemetry: [
        { label: 'Temperature', value: 31.4, unit: '°C' },
        { label: 'Load', value: 86, unit: '%' },
        { label: 'Runtime', value: 1284, unit: 'hrs' },
      ],
      timeline: [
        {
          title: 'Alert acknowledged',
          time: '4 min ago',
          description: 'NOC operator acknowledged alert.',
        },
      ],
    },
    {
      id: 'ALM-003',
      title: 'Door Sensor Fault',
      description: 'Zone B warehouse door sensor is reporting intermittent failures.',
      severity: 'critical',
      status: 'assigned',
      siteType: 'warehouse',
      siteName: 'Abu Dhabi Equipment Warehouse',
      assetName: 'Door Sensor',
      location: 'Mussafah',
      emirate: 'Abu Dhabi',
      createdAt: '13 min ago',
      lastUpdated: '5 min ago',
      assignedTo: 'Priya Sharma',
      telemetry: [
        { label: 'Doors online', value: '7/8' },
        { label: 'Open events', value: 42 },
        { label: 'Fault zone', value: 'Zone B' },
      ],
      timeline: [
        {
          title: 'Ticket assigned',
          time: '5 min ago',
          description: 'Assigned to warehouse field technician.',
        },
      ],
    },
    {
      id: 'ALM-004',
      title: 'Receiver Offline',
      description: 'Receiver stopped sending telemetry packets.',
      severity: 'major',
      status: 'open',
      siteType: 'tower',
      siteName: 'Tower Sharjah 01',
      assetName: 'Receiver',
      location: 'Industrial Area',
      emirate: 'Sharjah',
      createdAt: '21 min ago',
      lastUpdated: '19 min ago',
      assignedTo: 'Unassigned',
      telemetry: [
        { label: 'Signal', value: -89.1, unit: 'dBm' },
        { label: 'SNR', value: 24.2, unit: 'dB' },
      ],
      timeline: [
        {
          title: 'Device offline',
          time: '21 min ago',
          description: 'Heartbeat was not received from receiver module.',
        },
      ],
    },
    {
      id: 'ALM-005',
      title: 'Capacity Threshold High',
      description: 'Warehouse capacity crossed 90% threshold.',
      severity: 'major',
      status: 'resolved',
      siteType: 'warehouse',
      siteName: 'Abu Dhabi Equipment Warehouse',
      assetName: 'Inventory IoT Gateway',
      location: 'Mussafah',
      emirate: 'Abu Dhabi',
      createdAt: '1 hr ago',
      lastUpdated: '12 min ago',
      assignedTo: 'Operations Team',
      telemetry: [
        { label: 'Capacity', value: 91, unit: '%' },
        { label: 'Zones active', value: 8 },
      ],
      timeline: [
        {
          title: 'Resolved',
          time: '12 min ago',
          description: 'Capacity planning team acknowledged space overflow.',
        },
      ],
    },
  ]);

  readonly filteredAlerts = computed(() => {
    const q = this.search().trim().toLowerCase();

    return this.alerts().filter((alert) => {
      const matchesSearch =
        !q ||
        alert.id.toLowerCase().includes(q) ||
        alert.title.toLowerCase().includes(q) ||
        alert.siteName.toLowerCase().includes(q) ||
        alert.assetName.toLowerCase().includes(q) ||
        alert.location.toLowerCase().includes(q);

      const matchesSeverity =
        this.severity() === 'all' || alert.severity === this.severity();

      const matchesStatus =
        this.status() === 'all' || alert.status === this.status();

      const matchesSiteType =
        this.siteType() === 'all' || alert.siteType === this.siteType();

      return matchesSearch && matchesSeverity && matchesStatus && matchesSiteType;
    });
  });

  readonly summary = computed(() => {
    const alerts = this.alerts();

    return {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      open: alerts.filter((a) => a.status === 'open').length,
      assigned: alerts.filter((a) => a.status === 'assigned').length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
    };
  });

  openAlert(alert: AlertItem): void {
    this.selectedAlert.set(alert);
  }

  closeDrawer(): void {
    this.selectedAlert.set(null);
  }

  clearFilters(): void {
    this.search.set('');
    this.severity.set('all');
    this.status.set('all');
    this.siteType.set('all');
  }

  tagSeverity(value: AlertSeverity | AlertStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    if (value === 'critical' || value === 'open') return 'danger';
    if (value === 'major' || value === 'warning' || value === 'assigned') return 'warn';
    if (value === 'resolved') return 'success';
    return 'secondary';
  }

  siteIcon(siteType: SiteType): string {
    const icons: Record<SiteType, string> = {
      tower: 'fa-solid fa-tower-cell',
      building: 'fa-solid fa-building',
      warehouse: 'fa-solid fa-warehouse',
    };

    return icons[siteType];
  }
}