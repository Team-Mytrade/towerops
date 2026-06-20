import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

type AssetStatus = 'healthy' | 'warning' | 'critical' | 'offline';
type AssetType = 'radio' | 'power' | 'battery' | 'generator' | 'sensor' | 'network' | 'security';
type SiteType = 'tower' | 'building' | 'warehouse';

type Asset = {
  id: string;
  name: string;
  serialNo: string;
  type: AssetType;
  status: AssetStatus;
  image: string;
  allocatedTo: string;
  siteType: SiteType;
  location: string;
  emirate: string;
  latitude: number;
  longitude: number;
  manufacturer: string;
  model: string;
  installedOn: string;
  warrantyUntil: string;
  lastSeen: string;
  activeAlarms: number;
  maintenanceCount: number;
  telemetry: { label: string; value: string | number; unit?: string }[];
  alarms: { title: string; severity: AssetStatus; time: string }[];
  maintenance: { title: string; date: string; technician: string; status: string }[];
};

@Component({
  selector: 'to-assets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    DrawerModule,
    InputTextModule,
    SelectModule,
    TagModule,
  ],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsComponent {
  search = signal('');
  type = signal<'all' | AssetType>('all');
  status = signal<'all' | AssetStatus>('all');
  siteType = signal<'all' | SiteType>('all');

  selectedAsset = signal<Asset | null>(null);
  addDialogOpen = signal(false);

  newAsset = {
    name: '',
    serialNo: '',
    type: 'sensor' as AssetType,
    allocatedTo: '',
    siteType: 'tower' as SiteType,
  };

  readonly typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Radio', value: 'radio' },
    { label: 'Power', value: 'power' },
    { label: 'Battery', value: 'battery' },
    { label: 'Generator', value: 'generator' },
    { label: 'Sensor', value: 'sensor' },
    { label: 'Network', value: 'network' },
    { label: 'Security', value: 'security' },
  ];

  readonly statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Healthy', value: 'healthy' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' },
    { label: 'Offline', value: 'offline' },
  ];

  readonly siteTypeOptions = [
    { label: 'All Allocations', value: 'all' },
    { label: 'Tower', value: 'tower' },
    { label: 'Building', value: 'building' },
    { label: 'Warehouse', value: 'warehouse' },
  ];

  readonly assets = signal<Asset[]>([
    {
      id: 'AST-001',
      name: 'Transmitter Unit',
      serialNo: 'TX-DU-8821',
      type: 'radio',
      status: 'healthy',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900',
      allocatedTo: 'Tower Sharjah 01',
      siteType: 'tower',
      location: 'Industrial Area',
      emirate: 'Sharjah',
      latitude: 25.3463,
      longitude: 55.4209,
      manufacturer: 'Nokia',
      model: 'AirScale TX-900',
      installedOn: '12 Jan 2025',
      warrantyUntil: '12 Jan 2028',
      lastSeen: 'Live · 8 sec ago',
      activeAlarms: 0,
      maintenanceCount: 4,
      telemetry: [
        { label: 'Power output', value: 66.2, unit: 'W' },
        { label: 'Frequency', value: 895.3, unit: 'MHz' },
        { label: 'Signal', value: -62.2, unit: 'dBm' },
      ],
      alarms: [],
      maintenance: [
        { title: 'RF calibration', date: '18 Jun 2026', technician: 'Saleh Al Ali', status: 'completed' },
        { title: 'Antenna connector check', date: '02 May 2026', technician: 'Rajesh Kumar', status: 'completed' },
      ],
    },
    {
      id: 'AST-002',
      name: 'Battery Bank',
      serialNo: 'BAT-48V-1130',
      type: 'battery',
      status: 'warning',
      image: 'https://images.unsplash.com/photo-1605648916319-cf082f7524a1?w=900',
      allocatedTo: 'Tower Dubai 02',
      siteType: 'tower',
      location: 'Business Bay',
      emirate: 'Dubai',
      latitude: 25.185,
      longitude: 55.2708,
      manufacturer: 'Exide',
      model: '48V Backup Rack',
      installedOn: '03 Mar 2025',
      warrantyUntil: '03 Mar 2027',
      lastSeen: 'Live · 13 sec ago',
      activeAlarms: 1,
      maintenanceCount: 3,
      telemetry: [
        { label: 'Voltage', value: 50.9, unit: 'V' },
        { label: 'Capacity', value: 68.9, unit: '%' },
        { label: 'Current', value: -12.8, unit: 'A' },
      ],
      alarms: [
        { title: 'Battery capacity dropping', severity: 'warning', time: '12 min ago' },
      ],
      maintenance: [
        { title: 'Cell health inspection', date: '11 Jun 2026', technician: 'Mohammed Khan', status: 'completed' },
      ],
    },
    {
      id: 'AST-003',
      name: 'HVAC Controller',
      serialNo: 'HVAC-BMS-4420',
      type: 'sensor',
      status: 'critical',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900',
      allocatedTo: 'Abu Dhabi Regional Hub',
      siteType: 'building',
      location: 'Al Zahiyah',
      emirate: 'Abu Dhabi',
      latitude: 24.488,
      longitude: 54.382,
      manufacturer: 'Honeywell',
      model: 'BMS HVAC Pro',
      installedOn: '22 Aug 2024',
      warrantyUntil: '22 Aug 2027',
      lastSeen: 'Live · 4 sec ago',
      activeAlarms: 3,
      maintenanceCount: 6,
      telemetry: [
        { label: 'Temperature', value: 31.4, unit: '°C' },
        { label: 'Load', value: 86, unit: '%' },
        { label: 'Runtime', value: 1284, unit: 'hrs' },
      ],
      alarms: [
        { title: 'HVAC load critical', severity: 'critical', time: '4 min ago' },
        { title: 'Temperature threshold crossed', severity: 'warning', time: '9 min ago' },
      ],
      maintenance: [
        { title: 'Compressor inspection', date: '15 Jun 2026', technician: 'Rajesh Kumar', status: 'pending' },
      ],
    },
    {
      id: 'AST-004',
      name: 'Inventory IoT Gateway',
      serialNo: 'GW-WMS-7712',
      type: 'network',
      status: 'healthy',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900',
      allocatedTo: 'Dubai Spare Parts Warehouse',
      siteType: 'warehouse',
      location: 'Al Quoz',
      emirate: 'Dubai',
      latitude: 25.132,
      longitude: 55.244,
      manufacturer: 'Cisco',
      model: 'Industrial Gateway X2',
      installedOn: '09 Feb 2025',
      warrantyUntil: '09 Feb 2028',
      lastSeen: 'Live · 6 sec ago',
      activeAlarms: 0,
      maintenanceCount: 2,
      telemetry: [
        { label: 'Packets/min', value: 1248 },
        { label: 'Latency', value: 86, unit: 'ms' },
        { label: 'Readers online', value: '18/18' },
      ],
      alarms: [],
      maintenance: [
        { title: 'Firmware upgrade', date: '06 Jun 2026', technician: 'Priya Sharma', status: 'completed' },
      ],
    },
  ]);

  readonly filteredAssets = computed(() => {
    const q = this.search().trim().toLowerCase();

    return this.assets().filter((asset) => {
      const matchesSearch =
        !q ||
        asset.id.toLowerCase().includes(q) ||
        asset.name.toLowerCase().includes(q) ||
        asset.serialNo.toLowerCase().includes(q) ||
        asset.allocatedTo.toLowerCase().includes(q);

      const matchesType = this.type() === 'all' || asset.type === this.type();
      const matchesStatus = this.status() === 'all' || asset.status === this.status();
      const matchesSiteType = this.siteType() === 'all' || asset.siteType === this.siteType();

      return matchesSearch && matchesType && matchesStatus && matchesSiteType;
    });
  });

  openAsset(asset: Asset): void {
    this.selectedAsset.set(asset);
  }

  closeDrawer(): void {
    this.selectedAsset.set(null);
  }

  openAddDialog(): void {
    this.addDialogOpen.set(true);
  }

  addAsset(): void {
    const asset: Asset = {
      id: `AST-${String(this.assets().length + 1).padStart(3, '0')}`,
      name: this.newAsset.name || 'New Asset',
      serialNo: this.newAsset.serialNo || 'SERIAL-N/A',
      type: this.newAsset.type,
      status: 'healthy',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900',
      allocatedTo: this.newAsset.allocatedTo || 'Unallocated',
      siteType: this.newAsset.siteType,
      location: 'Not assigned',
      emirate: 'N/A',
      latitude: 0,
      longitude: 0,
      manufacturer: 'N/A',
      model: 'N/A',
      installedOn: 'Today',
      warrantyUntil: 'N/A',
      lastSeen: 'Not connected',
      activeAlarms: 0,
      maintenanceCount: 0,
      telemetry: [],
      alarms: [],
      maintenance: [],
    };

    this.assets.update((items) => [asset, ...items]);
    this.addDialogOpen.set(false);

    this.newAsset = {
      name: '',
      serialNo: '',
      type: 'sensor',
      allocatedTo: '',
      siteType: 'tower',
    };
  }

  severity(status: AssetStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'healthy') return 'success';
    if (status === 'warning') return 'warn';
    if (status === 'critical') return 'danger';
    return 'secondary';
  }

  icon(type: AssetType): string {
    const icons: Record<AssetType, string> = {
      radio: 'fa-solid fa-tower-broadcast',
      power: 'fa-solid fa-bolt',
      battery: 'fa-solid fa-car-battery',
      generator: 'fa-solid fa-gas-pump',
      sensor: 'fa-solid fa-microchip',
      network: 'fa-solid fa-network-wired',
      security: 'fa-solid fa-shield-halved',
    };

    return icons[type];
  }
}