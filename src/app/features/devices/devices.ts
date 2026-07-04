import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { PasswordModule } from 'primeng/password';

import { Device, DevicePayload } from '../../core/services/device.service';
import { DeviceModel } from '../../core/services/device-model.service';
import { Site } from '../../core/services/site.service';
import { AuthService } from '../../core/services/auth.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type DrawerMode =
  | 'view'
  | 'create'
  | 'edit'
  | 'liveData'
  | 'maintenance'
  | 'createModel'
  | 'createCredential';

type DeviceCredentialDraft = {
  id?: number;
  deviceId: string;
  secret: string;
  tenantId: string;
  deviceType: string;
  model: string;
};

const STORAGE_KEYS = {
  devices: 'towerops_devices',
  sites: 'towerops_sites',
  models: 'towerops_device_models',
  credentials: 'towerops_device_credentials',
};

@Component({
  selector: 'to-devices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TableModule,
    PasswordModule,
    Drawer,
    DetailField,
    StatusBadge,
  ],
  templateUrl: './devices.html',
  styleUrl: './devices.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Devices implements OnInit {
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly modelFilter = signal<number | 'All'>('All');
  readonly statusFilter = signal<string | 'All'>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selectedDevice = signal<Device | null>(null);

  readonly devices = signal<Device[]>([]);
  readonly sites = signal<Site[]>([]);
  readonly deviceModels = signal<DeviceModel[]>([]);

  deviceForm: DevicePayload = this.emptyDeviceDraft();
  deviceModelForm = this.emptyDeviceModelDraft();
  deviceCredentialForm: DeviceCredentialDraft = this.emptyDeviceCredentialDraft();

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Maintenance', value: 'MAINTENANCE' },
    { label: 'Offline', value: 'OFFLINE' },
  ];

  readonly deviceStatusOptions = this.statusOptions.slice(1);

  readonly messageTypeOptions = [
    { label: 'Telemetry', value: 'TELEMETRY' },
    { label: 'Event', value: 'EVENT' },
    { label: 'Command', value: 'COMMAND' },
    { label: 'Heartbeat', value: 'HEARTBEAT' },
  ];

  readonly modelCategoryOptions = [
    { label: 'Sensor', value: 'SENSOR' },
    { label: 'Gateway', value: 'GATEWAY' },
    { label: 'Controller', value: 'CONTROLLER' },
    { label: 'Network', value: 'NETWORK' },
  ];

  readonly enabledOptions = [
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false },
  ];

  readonly siteOptions = computed(() =>
    this.sites().map((site) => ({
      label: `${site.siteCode} · ${site.siteName}`,
      value: site.id,
    })),
  );

  readonly modelOptions = computed(() => [
    { label: 'All Models', value: 'All' as const },
    ...this.deviceModels().map((model) => ({
      label: `${model.modelCode} · ${model.modelName}`,
      value: model.id,
    })),
  ]);

  readonly modelSelectOptions = computed(() =>
    this.deviceModels().map((model) => ({
      label: `${model.modelCode} · ${model.modelName}`,
      value: model.id,
    })),
  );

  readonly credentialDeviceOptions = computed(() =>
    this.devices().map((device) => ({
      label: `${device.deviceId} · ${device.deviceName}`,
      value: device.deviceId,
    })),
  );

  readonly liveMetrics = signal([
    { label: 'Signal Strength', value: '92%', status: 'Healthy' },
    { label: 'Battery', value: '81%', status: 'Stable' },
    { label: 'Temperature', value: '34°C', status: 'Normal' },
    { label: 'Latency', value: '22ms', status: 'Good' },
    { label: 'Uptime', value: '18d 6h', status: 'Online' },
    { label: 'Heartbeat', value: '12 sec ago', status: 'Receiving' },
  ]);

  readonly maintenanceHistory = signal([
    {
      id: 'MT-1001',
      title: 'Firmware inspection',
      date: '2026-07-02 10:30 AM',
      technician: 'Arun Kumar',
      status: 'Completed',
    },
    {
      id: 'MT-1002',
      title: 'Signal calibration',
      date: '2026-07-05 03:00 PM',
      technician: 'Naveen Raj',
      status: 'Scheduled',
    },
  ]);

  readonly filteredDevices = computed(() => {
    const query = this.search().toLowerCase().trim();
    const model = this.modelFilter();
    const status = this.statusFilter();

    return this.devices().filter((device) => {
      const matchesSearch =
        !query ||
        device.deviceName?.toLowerCase().includes(query) ||
        device.deviceId?.toLowerCase().includes(query) ||
        device.serialNumber?.toLowerCase().includes(query) ||
        device.ipAddress?.toLowerCase().includes(query) ||
        device.macAddress?.toLowerCase().includes(query) ||
        this.siteLabel(device.siteId).toLowerCase().includes(query) ||
        this.modelLabel(device.deviceModelId).toLowerCase().includes(query);

      const matchesModel = model === 'All' || device.deviceModelId === model;
      const matchesStatus = status === 'All' || device.status === status;

      return matchesSearch && matchesModel && matchesStatus;
    });
  });

  get drawerTitle(): string {
    if (this.drawerMode() === 'create') return 'Create Device';
    if (this.drawerMode() === 'edit') return 'Update Device';
    if (this.drawerMode() === 'createModel') return 'Create Device Model';
    if (this.drawerMode() === 'createCredential') return 'Create Device Credential';
    if (this.drawerMode() === 'liveData') return 'Live Data';
    if (this.drawerMode() === 'maintenance') return 'Maintenance';
    return this.selectedDevice()?.deviceName ?? 'Device Details';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'create') return 'New Device';
    if (this.drawerMode() === 'edit') return 'Edit Device';
    if (this.drawerMode() === 'createModel') return 'New Model';
    if (this.drawerMode() === 'createCredential') return 'New Credential';
    return this.selectedDevice()?.deviceId ?? '';
  }

  get drawerSize(): 'compact' | 'wide' {
    return this.drawerMode() === 'view' ? 'compact' : 'wide';
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.loading.set(true);

    this.seedLocalStorageIfEmpty();

    this.devices.set(this.readStorage<Device[]>(STORAGE_KEYS.devices, []));
    this.sites.set(this.readStorage<Site[]>(STORAGE_KEYS.sites, []));
    this.deviceModels.set(this.readStorage<DeviceModel[]>(STORAGE_KEYS.models, []));

    this.loading.set(false);
  }

  openCreateDevice(): void {
    this.deviceForm = this.emptyDeviceDraft();
    this.selectedDevice.set(null);
    this.drawerMode.set('create');
    this.drawerOpen.set(true);
  }

  openCreateModel(): void {
    this.deviceModelForm = this.emptyDeviceModelDraft();
    this.selectedDevice.set(null);
    this.drawerMode.set('createModel');
    this.drawerOpen.set(true);
  }

  openCreateCredential(): void {
    this.deviceCredentialForm = this.emptyDeviceCredentialDraft();
    this.selectedDevice.set(null);
    this.drawerMode.set('createCredential');
    this.drawerOpen.set(true);
  }

  openDevice(device: Device): void {
    this.selectedDevice.set(device);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  editDevice(): void {
    const device = this.selectedDevice();
    if (!device) return;

    this.deviceForm = this.toPayload(device);
    this.drawerMode.set('edit');
  }

  openLiveData(): void {
    this.drawerMode.set('liveData');
  }

  openMaintenance(): void {
    this.drawerMode.set('maintenance');
  }

  saveDevice(): void {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.deviceId || !payload.deviceName || !payload.siteId || !payload.deviceModelId) {
      return;
    }

    this.saving.set(true);

    const devices = [...this.devices()];

    if (this.drawerMode() === 'edit') {
      const selected = this.selectedDevice();
      if (!selected) {
        this.saving.set(false);
        return;
      }

      const index = devices.findIndex((device) => device.id === selected.id);

      if (index > -1) {
        devices[index] = {
          ...devices[index],
          ...payload,
          updatedAt: new Date().toISOString(),
        } as Device;
      }
    } else {
      const nextDevice: Device = {
        id: this.nextId(devices),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
      } as Device;

      devices.unshift(nextDevice);
    }

    this.devices.set(devices);
    this.writeStorage(STORAGE_KEYS.devices, devices);

    this.saving.set(false);
    this.closeDrawer();
  }

  saveDeviceModel(): void {
    if (this.saving()) return;

    const payload = {
      id: this.nextId(this.deviceModels()),
      modelCode: this.deviceModelForm.modelCode.trim(),
      modelName: this.deviceModelForm.modelName.trim(),
      manufacturer: this.deviceModelForm.manufacturer.trim(),
      category: this.deviceModelForm.category,
      firmwareVersion: this.deviceModelForm.firmwareVersion.trim(),
      description: this.deviceModelForm.description.trim(),
      enabled: this.deviceModelForm.enabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as DeviceModel;

    if (!payload.modelCode || !payload.modelName) return;

    this.saving.set(true);

    const models = [payload, ...this.deviceModels()];

    this.deviceModels.set(models);
    this.writeStorage(STORAGE_KEYS.models, models);

    this.saving.set(false);
    this.closeDrawer();
  }

  saveDeviceCredential(): void {
    if (this.saving()) return;

    const payload: DeviceCredentialDraft = {
      id: Date.now(),
      deviceId: this.deviceCredentialForm.deviceId.trim(),
      secret: this.deviceCredentialForm.secret.trim(),
      tenantId: this.deviceCredentialForm.tenantId.trim(),
      deviceType: this.deviceCredentialForm.deviceType.trim(),
      model: this.deviceCredentialForm.model.trim(),
    };

    if (!payload.deviceId || !payload.secret) return;

    this.saving.set(true);

    const credentials = this.readStorage<DeviceCredentialDraft[]>(
      STORAGE_KEYS.credentials,
      [],
    );

    credentials.unshift(payload);

    this.writeStorage(STORAGE_KEYS.credentials, credentials);

    this.saving.set(false);
    this.closeDrawer();
  }

  deleteDevice(): void {
    const device = this.selectedDevice();

    if (!device || this.saving()) return;

    this.saving.set(true);

    const devices = this.devices().filter((item) => item.id !== device.id);

    this.devices.set(devices);
    this.writeStorage(STORAGE_KEYS.devices, devices);

    this.saving.set(false);
    this.closeDrawer();
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selectedDevice.set(null);
    this.deviceForm = this.emptyDeviceDraft();
    this.deviceModelForm = this.emptyDeviceModelDraft();
    this.deviceCredentialForm = this.emptyDeviceCredentialDraft();
  }

  siteLabel(siteId: number): string {
    const site = this.sites().find((item) => item.id === siteId);
    return site ? `${site.siteCode} · ${site.siteName}` : siteId ? String(siteId) : '-';
  }

  modelLabel(modelId: number): string {
    const model = this.deviceModels().find((item) => item.id === modelId);
    return model ? `${model.modelCode} · ${model.modelName}` : modelId ? String(modelId) : '-';
  }

  formatDate(value: string): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  statusTone(status: string): 'success' | 'warning' | 'danger' | 'muted' | 'info' {
    if (status === 'ACTIVE') return 'success';
    if (status === 'MAINTENANCE') return 'info';
    if (status === 'OFFLINE') return 'muted';
    if (status === 'CRITICAL') return 'danger';
    return 'warning';
  }

  private seedLocalStorageIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.sites)) {
      this.writeStorage(STORAGE_KEYS.sites, this.mockSites());
    }

    if (!localStorage.getItem(STORAGE_KEYS.models)) {
      this.writeStorage(STORAGE_KEYS.models, this.mockDeviceModels());
    }

    if (!localStorage.getItem(STORAGE_KEYS.devices)) {
      this.writeStorage(STORAGE_KEYS.devices, this.mockDevices());
    }

    if (!localStorage.getItem(STORAGE_KEYS.credentials)) {
      this.writeStorage(STORAGE_KEYS.credentials, this.mockCredentials());
    }
  }

  private mockSites(): Site[] {
    return [
      {
        id: 1,
        siteCode: 'TW-001',
        siteName: 'Dubai Marina Tower',
      } as Site,
      {
        id: 2,
        siteCode: 'TW-002',
        siteName: 'Business Bay Tower',
      } as Site,
      {
        id: 3,
        siteCode: 'BL-001',
        siteName: 'Abu Dhabi Central Building',
      } as Site,
      {
        id: 4,
        siteCode: 'WH-001',
        siteName: 'Ajman Coastal Warehouse',
      } as Site,
    ];
  }

  private mockDeviceModels(): DeviceModel[] {
    return [
      {
        id: 1,
        modelCode: 'SIG-100',
        modelName: 'Signal Monitoring Unit',
        manufacturer: 'Huawei',
        category: 'SENSOR',
        firmwareVersion: 'v2.4.1',
        description: 'Tracks signal strength, packet loss and tower RF quality.',
        enabled: true,
      } as DeviceModel,
      {
        id: 2,
        modelCode: 'TMP-220',
        modelName: 'Temperature Sensor',
        manufacturer: 'Cisco',
        category: 'SENSOR',
        firmwareVersion: 'v1.8.0',
        description: 'Monitors cabinet temperature and heat alerts.',
        enabled: true,
      } as DeviceModel,
      {
        id: 3,
        modelCode: 'GTW-500',
        modelName: 'IoT Gateway',
        manufacturer: 'Nokia',
        category: 'GATEWAY',
        firmwareVersion: 'v4.0.2',
        description: 'Primary site gateway for telemetry uplink.',
        enabled: true,
      } as DeviceModel,
      {
        id: 4,
        modelCode: 'BAT-900',
        modelName: 'Battery Controller',
        manufacturer: 'Ericsson',
        category: 'CONTROLLER',
        firmwareVersion: 'v3.2.5',
        description: 'Controls backup battery and power health signals.',
        enabled: true,
      } as DeviceModel,
    ];
  }

  private mockDevices(): Device[] {
    return [
      {
        id: 1,
        deviceId: 'DEV-0001',
        messageType: 'TELEMETRY',
        serialNumber: 'SN-DXB-0001',
        deviceName: 'Dubai Marina Gateway',
        status: 'ACTIVE',
        siteId: 1,
        deviceModelId: 3,
        firmwareVersion: 'v4.0.2',
        ipAddress: '192.168.1.10',
        macAddress: '00:11:22:33:44:01',
        lastSeen: new Date().toISOString(),
      } as Device,
      {
        id: 2,
        deviceId: 'DEV-0002',
        messageType: 'TELEMETRY',
        serialNumber: 'SN-DXB-0002',
        deviceName: 'Cabinet Temperature Sensor',
        status: 'ACTIVE',
        siteId: 1,
        deviceModelId: 2,
        firmwareVersion: 'v1.8.0',
        ipAddress: '192.168.1.11',
        macAddress: '00:11:22:33:44:02',
        lastSeen: new Date().toISOString(),
      } as Device,
      {
        id: 3,
        deviceId: 'DEV-0003',
        messageType: 'EVENT',
        serialNumber: 'SN-BB-0003',
        deviceName: 'Business Bay Signal Receiver',
        status: 'MAINTENANCE',
        siteId: 2,
        deviceModelId: 1,
        firmwareVersion: 'v2.4.1',
        ipAddress: '192.168.2.20',
        macAddress: '00:11:22:33:44:03',
        lastSeen: new Date().toISOString(),
      } as Device,
      {
        id: 4,
        deviceId: 'DEV-0004',
        messageType: 'HEARTBEAT',
        serialNumber: 'SN-AUH-0004',
        deviceName: 'Battery Backup Controller',
        status: 'OFFLINE',
        siteId: 3,
        deviceModelId: 4,
        firmwareVersion: 'v3.2.5',
        ipAddress: '192.168.3.15',
        macAddress: '00:11:22:33:44:04',
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      } as Device,
      {
        id: 5,
        deviceId: 'DEV-0005',
        messageType: 'TELEMETRY',
        serialNumber: 'SN-AJM-0005',
        deviceName: 'Warehouse Power Monitor',
        status: 'ACTIVE',
        siteId: 4,
        deviceModelId: 1,
        firmwareVersion: 'v2.4.1',
        ipAddress: '192.168.4.30',
        macAddress: '00:11:22:33:44:05',
        lastSeen: new Date().toISOString(),
      } as Device,
    ];
  }

  private mockCredentials(): DeviceCredentialDraft[] {
    return [
      {
        id: 1,
        deviceId: 'DEV-0001',
        secret: 'gateway@123',
        tenantId: this.auth.getTenantId() || 'ALG-001',
        deviceType: 'GATEWAY',
        model: 'GTW-500',
      },
      {
        id: 2,
        deviceId: 'DEV-0002',
        secret: 'sensor@123',
        tenantId: this.auth.getTenantId() || 'ALG-001',
        deviceType: 'SENSOR',
        model: 'TMP-220',
      },
    ];
  }

  private toPayload(device: Device): DevicePayload {
    return {
      deviceId: device.deviceId,
      messageType: device.messageType,
      serialNumber: device.serialNumber,
      deviceName: device.deviceName,
      status: device.status,
      siteId: device.siteId,
      deviceModelId: device.deviceModelId,
      firmwareVersion: device.firmwareVersion,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      lastSeen: device.lastSeen,
    };
  }

  private normalizePayload(): DevicePayload {
    return {
      deviceId: this.deviceForm.deviceId.trim(),
      messageType: this.deviceForm.messageType,
      serialNumber: this.deviceForm.serialNumber.trim(),
      deviceName: this.deviceForm.deviceName.trim(),
      status: this.deviceForm.status,
      siteId: Number(this.deviceForm.siteId),
      deviceModelId: Number(this.deviceForm.deviceModelId),
      firmwareVersion: this.deviceForm.firmwareVersion.trim(),
      ipAddress: this.deviceForm.ipAddress.trim(),
      macAddress: this.deviceForm.macAddress.trim(),
      lastSeen: this.deviceForm.lastSeen || new Date().toISOString(),
    };
  }

  private emptyDeviceDraft(): DevicePayload {
    return {
      deviceId: this.generateDeviceId(),
      messageType: 'TELEMETRY',
      serialNumber: '',
      deviceName: '',
      status: 'ACTIVE',
      siteId: 0,
      deviceModelId: 0,
      firmwareVersion: '',
      ipAddress: '',
      macAddress: '',
      lastSeen: new Date().toISOString(),
    };
  }

  private emptyDeviceModelDraft() {
    return {
      modelCode: '',
      modelName: '',
      manufacturer: '',
      category: 'SENSOR',
      firmwareVersion: '',
      description: '',
      enabled: true,
    };
  }

  private emptyDeviceCredentialDraft(): DeviceCredentialDraft {
    return {
      deviceId: '',
      secret: '',
      tenantId: this.auth.getTenantId() || 'ALG-001',
      deviceType: '',
      model: '',
    };
  }

  private generateDeviceId(): string {
    const devices = this.readStorage<Device[]>(STORAGE_KEYS.devices, []);
    const nextNumber = devices.length + 1;

    return `DEV-${String(nextNumber).padStart(4, '0')}`;
  }

  private nextId<T extends { id?: number }>(items: T[]): number {
    const maxId = items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
    return maxId + 1;
  }

  private readStorage<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private writeStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}