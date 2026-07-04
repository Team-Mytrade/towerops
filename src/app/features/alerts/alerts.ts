import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import {
  Alert,
  AlertPayload,
  AlertSeverity,
  AlertStatus,
} from '../../core/services/alert.service';
import { Device } from '../../core/services/device.service';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { Timeline, TimelineItem } from '../../shared/ui/timeline/timeline';

type DrawerMode = 'view' | 'create';

const STORAGE_KEYS = {
  alerts: 'towerops_alerts',
  devices: 'towerops_devices',
};

@Component({
  selector: 'to-alerts',
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
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Alerts implements OnInit {
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly severityFilter = signal<'All' | AlertSeverity>('All');
  readonly statusFilter = signal<'All' | AlertStatus>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selectedAlert = signal<Alert | null>(null);

  readonly alerts = signal<Alert[]>([]);
  readonly devices = signal<Device[]>([]);

  alertForm: AlertPayload = this.emptyAlertDraft();

  readonly severityOptions = [
    { label: 'All Severity', value: 'All' },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
  ];

  readonly alertSeverityOptions = this.severityOptions.slice(1);

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Open', value: 'OPEN' },
    { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  readonly deviceOptions = computed(() =>
    this.devices().map((device) => ({
      label: `${device.deviceId} · ${device.deviceName}`,
      value: device.deviceId,
    })),
  );

  readonly filteredAlerts = computed(() => {
    const query = this.search().toLowerCase().trim();
    const severity = this.severityFilter();
    const status = this.statusFilter();

    return this.alerts().filter((alert) => {
      const matchesSearch =
        !query ||
        alert.message?.toLowerCase().includes(query) ||
        String(alert.id).includes(query) ||
        alert.deviceId?.toLowerCase().includes(query) ||
        alert.ruleName?.toLowerCase().includes(query) ||
        alert.alertType?.toLowerCase().includes(query);

      const matchesSeverity = severity === 'All' || alert.severity === severity;
      const matchesStatus = status === 'All' || alert.status === status;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  });

  readonly timeline = computed<TimelineItem[]>(() => {
    const alert = this.selectedAlert();

    if (!alert) return [];

    return [
      {
        title: 'Alert triggered',
        description: alert.message,
        time: this.formatDate(alert.timestamp),
        tone: 'danger',
      },
      {
        title: alert.acknowledged
          ? 'Acknowledged'
          : 'Waiting for acknowledgement',
        description: alert.acknowledged
          ? 'Alert has been acknowledged.'
          : 'NOC action is pending.',
        time: alert.acknowledged ? 'Done' : 'Pending',
        tone: alert.acknowledged ? 'success' : 'warning',
      },
      {
        title:
          alert.status === 'RESOLVED' || alert.status === 'CLOSED'
            ? 'Resolved'
            : 'Resolution pending',
        description:
          alert.status === 'RESOLVED' || alert.status === 'CLOSED'
            ? 'Alert has been resolved by the operations team.'
            : 'Engineering action is still pending.',
        time:
          alert.status === 'RESOLVED' || alert.status === 'CLOSED'
            ? 'Done'
            : 'Pending',
        tone:
          alert.status === 'RESOLVED' || alert.status === 'CLOSED'
            ? 'success'
            : 'info',
      },
    ];
  });

  get drawerTitle(): string {
    if (this.drawerMode() === 'create') return 'Create Alert';
    return this.selectedAlert()?.message ?? 'Alert Details';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'create') return 'New Alert';
    return this.selectedAlert()?.id ? `ALT-${this.selectedAlert()?.id}` : '';
  }

  get drawerSize(): 'compact' | 'wide' {
    return this.drawerMode() === 'create' ? 'wide' : 'compact';
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.loading.set(true);

    this.seedLocalStorageIfEmpty();

    this.alerts.set(this.readStorage<Alert[]>(STORAGE_KEYS.alerts, []));
    this.devices.set(this.readStorage<Device[]>(STORAGE_KEYS.devices, []));

    this.loading.set(false);
  }

  loadOpenAlerts(): void {
    this.loading.set(true);

    const alerts = this.readStorage<Alert[]>(STORAGE_KEYS.alerts, []).filter(
      (alert) => alert.status === 'OPEN',
    );

    this.alerts.set(alerts);
    this.loading.set(false);
  }

  openCreateAlert(): void {
    this.alertForm = this.emptyAlertDraft();
    this.selectedAlert.set(null);
    this.drawerMode.set('create');
    this.drawerOpen.set(true);
  }

  openAlert(alert: Alert): void {
    this.selectedAlert.set(alert);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  createAlert(): void {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.deviceId || !payload.alertType || !payload.message) return;

    this.saving.set(true);

    const alerts = this.alerts();

    const newAlert = {
      id: this.nextId(alerts),
      ...payload,
      status: 'OPEN',
      acknowledged: false,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Alert;

    const updatedAlerts = [newAlert, ...alerts];

    this.alerts.set(updatedAlerts);
    this.writeStorage(STORAGE_KEYS.alerts, updatedAlerts);

    this.saving.set(false);
    this.closeDrawer();
  }

  acknowledgeAlert(): void {
    const alert = this.selectedAlert();

    if (!alert || this.saving()) return;

    this.saving.set(true);

    const updated = {
      ...alert,
      status: 'ACKNOWLEDGED',
      acknowledged: true,
      acknowledgedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Alert;

    this.updateAlertInState(updated);

    this.saving.set(false);
  }

  resolveAlert(): void {
    const alert = this.selectedAlert();

    if (!alert || this.saving()) return;

    this.saving.set(true);

    const updated = {
      ...alert,
      status: 'RESOLVED',
      acknowledged: true,
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Alert;

    this.updateAlertInState(updated);

    this.saving.set(false);
  }

  closeAlert(): void {
    const alert = this.selectedAlert();

    if (!alert || this.saving()) return;

    this.saving.set(true);

    const updated = {
      ...alert,
      status: 'CLOSED',
      acknowledged: true,
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Alert;

    this.updateAlertInState(updated);

    this.saving.set(false);
  }

  deleteAlert(): void {
    const alert = this.selectedAlert();

    if (!alert || this.saving()) return;

    this.saving.set(true);

    const updatedAlerts = this.alerts().filter((item) => item.id !== alert.id);

    this.alerts.set(updatedAlerts);
    this.writeStorage(STORAGE_KEYS.alerts, updatedAlerts);

    this.saving.set(false);
    this.closeDrawer();
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selectedAlert.set(null);
    this.alertForm = this.emptyAlertDraft();
  }

  deviceLabel(deviceId: string): string {
    const device = this.devices().find((item) => item.deviceId === deviceId);
    return device ? `${device.deviceId} · ${device.deviceName}` : deviceId || '-';
  }

  formatDate(value: string): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  severityTone(severity: AlertSeverity): 'danger' | 'warning' | 'info' | 'muted' {
    if (severity === 'CRITICAL' || severity === 'HIGH') return 'danger';
    if (severity === 'MEDIUM') return 'warning';
    if (severity === 'LOW') return 'info';
    return 'muted';
  }

  statusTone(status: AlertStatus): 'success' | 'warning' | 'danger' | 'info' | 'muted' {
    if (status === 'OPEN') return 'danger';
    if (status === 'ACKNOWLEDGED') return 'warning';
    if (status === 'RESOLVED' || status === 'CLOSED') return 'success';
    return 'info';
  }

  private updateAlertInState(updated: Alert): void {
    const updatedAlerts = this.alerts().map((item) =>
      item.id === updated.id ? updated : item,
    );

    this.alerts.set(updatedAlerts);
    this.selectedAlert.set(updated);
    this.writeStorage(STORAGE_KEYS.alerts, updatedAlerts);
  }

  private normalizePayload(): AlertPayload {
    return {
      deviceId: this.alertForm.deviceId.trim(),
      ruleId: Number(this.alertForm.ruleId || 0),
      ruleName: this.alertForm.ruleName.trim(),
      alertType: this.alertForm.alertType.trim(),
      severity: this.alertForm.severity,
      message: this.alertForm.message.trim(),
    };
  }

  private emptyAlertDraft(): AlertPayload {
    return {
      deviceId: '',
      ruleId: 0,
      ruleName: '',
      alertType: '',
      severity: 'LOW',
      message: '',
    };
  }

  private seedLocalStorageIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.devices)) {
      this.writeStorage(STORAGE_KEYS.devices, this.mockDevices());
    }

    if (!localStorage.getItem(STORAGE_KEYS.alerts)) {
      this.writeStorage(STORAGE_KEYS.alerts, this.mockAlerts());
    }
  }

  private mockDevices(): Device[] {
    return [
      {
        id: 1,
        deviceId: 'DEV-0001',
        deviceName: 'Dubai Marina Gateway',
        serialNumber: 'SN-DXB-0001',
        status: 'ACTIVE',
        siteId: 1,
        deviceModelId: 3,
        messageType: 'TELEMETRY',
        firmwareVersion: 'v4.0.2',
        ipAddress: '192.168.1.10',
        macAddress: '00:11:22:33:44:01',
        lastSeen: new Date().toISOString(),
      } as Device,
      {
        id: 2,
        deviceId: 'DEV-0002',
        deviceName: 'Cabinet Temperature Sensor',
        serialNumber: 'SN-DXB-0002',
        status: 'ACTIVE',
        siteId: 1,
        deviceModelId: 2,
        messageType: 'TELEMETRY',
        firmwareVersion: 'v1.8.0',
        ipAddress: '192.168.1.11',
        macAddress: '00:11:22:33:44:02',
        lastSeen: new Date().toISOString(),
      } as Device,
      {
        id: 3,
        deviceId: 'DEV-0003',
        deviceName: 'Business Bay Signal Receiver',
        serialNumber: 'SN-BB-0003',
        status: 'MAINTENANCE',
        siteId: 2,
        deviceModelId: 1,
        messageType: 'EVENT',
        firmwareVersion: 'v2.4.1',
        ipAddress: '192.168.2.20',
        macAddress: '00:11:22:33:44:03',
        lastSeen: new Date().toISOString(),
      } as Device,
      {
        id: 4,
        deviceId: 'DEV-0004',
        deviceName: 'Battery Backup Controller',
        serialNumber: 'SN-AUH-0004',
        status: 'OFFLINE',
        siteId: 3,
        deviceModelId: 4,
        messageType: 'HEARTBEAT',
        firmwareVersion: 'v3.2.5',
        ipAddress: '192.168.3.15',
        macAddress: '00:11:22:33:44:04',
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      } as Device,
    ];
  }

  private mockAlerts(): Alert[] {
    return [
      {
        id: 1001,
        deviceId: 'DEV-0003',
        ruleId: 501,
        ruleName: 'Signal Drop Rule',
        alertType: 'SIGNAL_DROP',
        severity: 'CRITICAL',
        message: 'Signal strength dropped below 40% at Business Bay Tower.',
        status: 'OPEN',
        acknowledged: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      } as Alert,
      {
        id: 1002,
        deviceId: 'DEV-0002',
        ruleId: 502,
        ruleName: 'Cabinet Temperature Rule',
        alertType: 'HIGH_TEMPERATURE',
        severity: 'HIGH',
        message: 'Cabinet temperature crossed 48°C at Dubai Marina Tower.',
        status: 'ACKNOWLEDGED',
        acknowledged: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        acknowledgedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      } as Alert,
      {
        id: 1003,
        deviceId: 'DEV-0004',
        ruleId: 503,
        ruleName: 'Heartbeat Missing Rule',
        alertType: 'DEVICE_OFFLINE',
        severity: 'MEDIUM',
        message: 'No heartbeat received from Battery Backup Controller.',
        status: 'OPEN',
        acknowledged: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      } as Alert,
      {
        id: 1004,
        deviceId: 'DEV-0001',
        ruleId: 504,
        ruleName: 'Gateway Latency Rule',
        alertType: 'HIGH_LATENCY',
        severity: 'LOW',
        message: 'Gateway latency exceeded normal range for 5 minutes.',
        status: 'RESOLVED',
        acknowledged: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        acknowledgedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
        resolvedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      } as Alert,
    ];
  }

  private nextId<T extends { id?: number }>(items: T[]): number {
    const maxId = items.reduce(
      (max, item) => Math.max(max, Number(item.id) || 0),
      0,
    );

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