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
import { firstValueFrom } from 'rxjs';

import {
  Device,
  DevicePayload,
  DeviceService,
} from '../../core/services/device.service';
import {
  DeviceCredentialService,
} from '../../core/services/device-credential.service';
import {
  DeviceModel,
  DeviceModelService,
} from '../../core/services/device-model.service';
import { Site, SiteService } from '../../core/services/site.service';
import { AuthService } from '../../core/services/auth.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { PasswordModule } from 'primeng/password';

type DrawerMode =
  | 'view'
  | 'create'
  | 'edit'
  | 'liveData'
  | 'maintenance'
  | 'createModel'
  | 'createCredential';

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
  private readonly deviceService = inject(DeviceService);
  private readonly siteService = inject(SiteService);
  private readonly deviceModelService = inject(DeviceModelService);
  private readonly deviceCredentialService = inject(DeviceCredentialService);
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

  deviceCredentialForm = this.emptyDeviceCredentialDraft();

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
    { label: 'Signal Strength', value: '-', status: 'Waiting' },
    { label: 'Battery', value: '-', status: 'Waiting' },
    { label: 'Temperature', value: '-', status: 'Waiting' },
    { label: 'Latency', value: '-', status: 'Waiting' },
    { label: 'Uptime', value: '-', status: 'Waiting' },
    { label: 'Heartbeat', value: '-', status: 'Waiting' },
  ]);

  readonly maintenanceHistory = signal([
    {
      id: 'MT-1001',
      title: 'Firmware inspection',
      date: 'Pending API',
      technician: '-',
      status: 'Not synced',
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

  async loadPageData(): Promise<void> {
    try {
      this.loading.set(true);

      const [devicesRes, sitesRes, modelsRes] = await Promise.all([
        firstValueFrom(this.deviceService.getAll()),
        firstValueFrom(this.siteService.getAll()),
        firstValueFrom(this.deviceModelService.getAll()),
      ]);

      this.devices.set(devicesRes.data ?? []);
      this.sites.set(sitesRes.data ?? []);
      this.deviceModels.set(modelsRes.data ?? []);
    } catch (error) {
      console.error('Failed to load devices:', error);
      this.devices.set([]);
      this.sites.set([]);
      this.deviceModels.set([]);
    } finally {
      this.loading.set(false);
    }
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

  async saveDevice(): Promise<void> {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.deviceId || !payload.deviceName || !payload.siteId || !payload.deviceModelId) {
      return;
    }

    try {
      this.saving.set(true);

      if (this.drawerMode() === 'edit') {
        const selected = this.selectedDevice();
        if (!selected) return;

        await firstValueFrom(this.deviceService.update(selected.id, payload));
      } else {
        await firstValueFrom(this.deviceService.create(payload));
      }

      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to save device:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async saveDeviceModel(): Promise<void> {
    if (this.saving()) return;

    const payload = {
      modelCode: this.deviceModelForm.modelCode.trim(),
      modelName: this.deviceModelForm.modelName.trim(),
      manufacturer: this.deviceModelForm.manufacturer.trim(),
      category: this.deviceModelForm.category,
      firmwareVersion: this.deviceModelForm.firmwareVersion.trim(),
      description: this.deviceModelForm.description.trim(),
      enabled: this.deviceModelForm.enabled,
    };

    if (!payload.modelCode || !payload.modelName) return;

    try {
      this.saving.set(true);
      await firstValueFrom(this.deviceModelService.create(payload));
      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to save device model:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async saveDeviceCredential(): Promise<void> {
    if (this.saving()) return;

    const payload = {
      deviceId: this.deviceCredentialForm.deviceId.trim(),
      secret: this.deviceCredentialForm.secret.trim(),
      tenantId: this.deviceCredentialForm.tenantId.trim(),
      deviceType: this.deviceCredentialForm.deviceType.trim(),
      model: this.deviceCredentialForm.model.trim(),
    };

    if (!payload.deviceId || !payload.secret) return;

    try {
      this.saving.set(true);
      await firstValueFrom(this.deviceCredentialService.create(payload));
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to save device credential:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteDevice(): Promise<void> {
    const device = this.selectedDevice();

    if (!device || this.saving()) return;

    try {
      this.saving.set(true);
      await firstValueFrom(this.deviceService.delete(device.id));
      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to delete device:', error);
    } finally {
      this.saving.set(false);
    }
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
      deviceId: '',
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

  private emptyDeviceCredentialDraft() {
    return {
      deviceId: '',
      secret: '',
      tenantId: this.auth.getTenantId() || 'DEFAULT',
      deviceType: '',
      model: '',
    };
  }
}