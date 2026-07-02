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
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { firstValueFrom } from 'rxjs';

import {
  NotificationConfig,
  NotificationConfigPayload,
  NotificationConfigService,
  NotificationSeverity,
} from '../../core/services/notification-config.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type DrawerMode = 'view' | 'create' | 'edit';

@Component({
  selector: 'to-notification-configs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    SelectModule,
    TableModule,
    Drawer,
    DetailField,
    StatusBadge,
  ],
  templateUrl: './notification-configs.html',
  styleUrl: './notification-configs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationConfigs implements OnInit {
  private readonly service = inject(NotificationConfigService);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly severityFilter = signal<'All' | NotificationSeverity>('All');
  readonly activeFilter = signal<'All' | boolean>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selected = signal<NotificationConfig | null>(null);

  readonly configs = signal<NotificationConfig[]>([]);

  form: NotificationConfigPayload = this.emptyDraft();

  readonly severityOptions = [
    { label: 'All Severity', value: 'All' },
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Critical', value: 'CRITICAL' },
  ];

  readonly configSeverityOptions = this.severityOptions.slice(1);

  readonly activeOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  readonly statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  readonly eventTypeOptions = [
    { label: 'Alert Created', value: 'ALERT_CREATED' },
    { label: 'Alert Acknowledged', value: 'ALERT_ACKNOWLEDGED' },
    { label: 'Alert Resolved', value: 'ALERT_RESOLVED' },
    { label: 'Ticket Created', value: 'TICKET_CREATED' },
    { label: 'Ticket Assigned', value: 'TICKET_ASSIGNED' },
    { label: 'Ticket Resolved', value: 'TICKET_RESOLVED' },
    { label: 'Work Order Created', value: 'WORK_ORDER_CREATED' },
    { label: 'Work Order Completed', value: 'WORK_ORDER_COMPLETED' },
  ];

  readonly filteredConfigs = computed(() => {
    const query = this.search().toLowerCase().trim();
    const severity = this.severityFilter();
    const active = this.activeFilter();

    return this.configs().filter((config) => {
      const matchesSearch =
        !query ||
        config.name?.toLowerCase().includes(query) ||
        config.eventType?.toLowerCase().includes(query) ||
        config.subject?.toLowerCase().includes(query) ||
        config.emailRecipients?.toLowerCase().includes(query) ||
        config.phoneRecipients?.toLowerCase().includes(query);

      const matchesSeverity = severity === 'All' || config.severity === severity;
      const matchesActive = active === 'All' || config.active === active;

      return matchesSearch && matchesSeverity && matchesActive;
    });
  });

  get drawerTitle(): string {
    if (this.drawerMode() === 'create') return 'Create Notification Config';
    if (this.drawerMode() === 'edit') return 'Update Notification Config';

    return this.selected()?.name ?? 'Notification Config';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'create') return 'New Config';
    if (this.drawerMode() === 'edit') return 'Edit Config';

    return this.selected()?.eventType ?? '';
  }

  get drawerSize(): 'compact' | 'wide' {
    return this.drawerMode() === 'view' ? 'compact' : 'wide';
  }

  ngOnInit(): void {
    this.loadConfigs();
  }

  async loadConfigs(): Promise<void> {
    try {
      this.loading.set(true);
      const rows = await firstValueFrom(this.service.getAll());
      this.configs.set(rows ?? []);
    } catch (error) {
      console.error('Failed to load notification configs:', error);
      this.configs.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    this.form = this.emptyDraft();
    this.selected.set(null);
    this.drawerMode.set('create');
    this.drawerOpen.set(true);
  }

  openConfig(config: NotificationConfig): void {
    this.selected.set(config);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  editConfig(): void {
    const config = this.selected();

    if (!config) return;

    this.form = this.toPayload(config);
    this.drawerMode.set('edit');
  }

  async saveConfig(): Promise<void> {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.name || !payload.eventType || !payload.subject) return;

    try {
      this.saving.set(true);

      if (this.drawerMode() === 'edit') {
        const selected = this.selected();
        if (!selected) return;

        await firstValueFrom(this.service.update(selected.id, payload));
      } else {
        await firstValueFrom(this.service.create(payload));
      }

      await this.loadConfigs();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to save notification config:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteConfig(): Promise<void> {
    const config = this.selected();

    if (!config || this.saving()) return;

    try {
      this.saving.set(true);
      await firstValueFrom(this.service.delete(config.id));
      await this.loadConfigs();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to delete notification config:', error);
    } finally {
      this.saving.set(false);
    }
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selected.set(null);
    this.form = this.emptyDraft();
  }

  channels(config: NotificationConfig): string {
    const items = [
      config.emailEnabled ? 'Email' : '',
      config.smsEnabled ? 'SMS' : '',
      config.websocketEnabled ? 'Websocket' : '',
    ].filter(Boolean);

    return items.length ? items.join(', ') : '-';
  }

  severityTone(severity: NotificationSeverity): 'danger' | 'warning' | 'info' {
    if (severity === 'CRITICAL' || severity === 'HIGH') return 'danger';
    if (severity === 'MEDIUM') return 'warning';
    return 'info';
  }

  statusLabel(active: boolean): string {
    return active ? 'Active' : 'Inactive';
  }

  statusTone(active: boolean): 'success' | 'danger' {
    return active ? 'success' : 'danger';
  }

  private toPayload(config: NotificationConfig): NotificationConfigPayload {
    return {
      name: config.name,
      eventType: config.eventType,
      subject: config.subject,
      body: config.body,
      severity: config.severity,
      emailEnabled: config.emailEnabled,
      smsEnabled: config.smsEnabled,
      websocketEnabled: config.websocketEnabled,
      emailRecipients: config.emailRecipients,
      phoneRecipients: config.phoneRecipients,
      active: config.active,
    };
  }

  private normalizePayload(): NotificationConfigPayload {
    return {
      name: this.form.name.trim(),
      eventType: this.form.eventType.trim(),
      subject: this.form.subject.trim(),
      body: this.form.body.trim(),
      severity: this.form.severity,
      emailEnabled: this.form.emailEnabled,
      smsEnabled: this.form.smsEnabled,
      websocketEnabled: this.form.websocketEnabled,
      emailRecipients: this.form.emailRecipients.trim(),
      phoneRecipients: this.form.phoneRecipients.trim(),
      active: this.form.active,
    };
  }

  private emptyDraft(): NotificationConfigPayload {
    return {
      name: '',
      eventType: 'ALERT_CREATED',
      subject: '',
      body: '',
      severity: 'LOW',
      emailEnabled: true,
      smsEnabled: false,
      websocketEnabled: true,
      emailRecipients: '',
      phoneRecipients: '',
      active: true,
    };
  }
}