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
  Alert,
  AlertPayload,
  AlertService,
  AlertSeverity,
  AlertStatus,
} from '../../core/services/alert.service';
import { Device, DeviceService } from '../../core/services/device.service';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { Timeline, TimelineItem } from '../../shared/ui/timeline/timeline';

type DrawerMode = 'view' | 'create';

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
  private readonly alertService = inject(AlertService);
  private readonly deviceService = inject(DeviceService);

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

    if (!alert) {
      return [];
    }

    return [
      {
        title: 'Alert triggered',
        description: alert.message,
        time: this.formatDate(alert.timestamp),
        tone: 'danger',
      },
      {
        title: alert.acknowledged ? 'Acknowledged' : 'Waiting for acknowledgement',
        description: alert.acknowledged
          ? 'Alert has been acknowledged.'
          : 'NOC action is pending.',
        time: alert.acknowledged ? 'Done' : 'Pending',
        tone: alert.acknowledged ? 'success' : 'warning',
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

  async loadPageData(): Promise<void> {
    try {
      this.loading.set(true);

      const [alerts, devicesRes] = await Promise.all([
        firstValueFrom(this.alertService.getAll()),
        firstValueFrom(this.deviceService.getAll()),
      ]);

      this.alerts.set(alerts ?? []);
      this.devices.set(devicesRes.data ?? []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      this.alerts.set([]);
      this.devices.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadOpenAlerts(): Promise<void> {
    try {
      this.loading.set(true);
      const alerts = await firstValueFrom(this.alertService.getOpen());
      this.alerts.set(alerts ?? []);
    } catch (error) {
      console.error('Failed to load open alerts:', error);
      this.alerts.set([]);
    } finally {
      this.loading.set(false);
    }
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

  async createAlert(): Promise<void> {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.deviceId || !payload.alertType || !payload.message) {
      return;
    }

    try {
      this.saving.set(true);
      await firstValueFrom(this.alertService.create(payload));
      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to create alert:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async acknowledgeAlert(): Promise<void> {
    const alert = this.selectedAlert();

    if (!alert || this.saving()) return;

    try {
      this.saving.set(true);
      const updated = await firstValueFrom(this.alertService.acknowledge(alert.id));

      this.selectedAlert.set(updated);
      this.alerts.update((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async resolveAlert(): Promise<void> {
    const alert = this.selectedAlert();

    if (!alert || this.saving()) return;

    try {
      this.saving.set(true);
      const updated = await firstValueFrom(this.alertService.resolve(alert.id));

      this.selectedAlert.set(updated);
      this.alerts.update((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteAlert(): Promise<void> {
    const alert = this.selectedAlert();

    if (!alert || this.saving()) return;

    try {
      this.saving.set(true);
      await firstValueFrom(this.alertService.delete(alert.id));
      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to delete alert:', error);
    } finally {
      this.saving.set(false);
    }
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
}