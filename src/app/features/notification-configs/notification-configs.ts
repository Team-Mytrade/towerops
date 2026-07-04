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
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import {
  NotificationConfig,
  NotificationConfigPayload,
  NotificationSeverity,
} from '../../core/services/notification-config.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type DrawerMode = 'view' | 'create' | 'edit';

const STORAGE_KEY = 'towerops_notification_configs';

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

  loadConfigs(): void {
    this.loading.set(true);

    this.seedLocalStorageIfEmpty();

    this.configs.set(
      this.readStorage<NotificationConfig[]>(STORAGE_KEY, []),
    );

    this.loading.set(false);
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

  saveConfig(): void {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.name || !payload.eventType || !payload.subject) return;

    this.saving.set(true);

    const configs = [...this.configs()];

    if (this.drawerMode() === 'edit') {
      const selected = this.selected();

      if (!selected) {
        this.saving.set(false);
        return;
      }

      const updatedConfigs = configs.map((config) =>
        config.id === selected.id
          ? {
            ...config,
            ...payload,
            updatedAt: new Date().toISOString(),
          }
          : config,
      );

      this.configs.set(updatedConfigs);
      this.writeStorage(STORAGE_KEY, updatedConfigs);
    } else {
      const newConfig = {
        id: this.nextId(configs),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as NotificationConfig;

      const updatedConfigs = [newConfig, ...configs];

      this.configs.set(updatedConfigs);
      this.writeStorage(STORAGE_KEY, updatedConfigs);
    }

    this.saving.set(false);
    this.closeDrawer();
  }

  deleteConfig(): void {
    const config = this.selected();

    if (!config || this.saving()) return;

    this.saving.set(true);

    const updatedConfigs = this.configs().filter((item) => item.id !== config.id);

    this.configs.set(updatedConfigs);
    this.writeStorage(STORAGE_KEY, updatedConfigs);

    this.saving.set(false);
    this.closeDrawer();
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

  private seedLocalStorageIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      this.writeStorage(STORAGE_KEY, this.mockConfigs());
    }
  }

  private mockConfigs(): NotificationConfig[] {
    return [
      {
        id: 1,
        name: 'Critical Alert Email + Websocket',
        eventType: 'ALERT_CREATED',
        subject: 'Critical Alert Raised - {{deviceId}}',
        body:
          'A critical alert has been raised for {{deviceId}}. Please check the NOC dashboard immediately.',
        severity: 'CRITICAL',
        emailEnabled: true,
        smsEnabled: true,
        websocketEnabled: true,
        emailRecipients: 'noc@towerops.demo, admin@algotricz.demo',
        phoneRecipients: '+971500000001,+971500000002',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as NotificationConfig,
      {
        id: 2,
        name: 'Ticket Assignment Notification',
        eventType: 'TICKET_ASSIGNED',
        subject: 'Ticket Assigned - {{ticketId}}',
        body:
          'A new ticket has been assigned to the technician. Please review and acknowledge.',
        severity: 'HIGH',
        emailEnabled: true,
        smsEnabled: false,
        websocketEnabled: true,
        emailRecipients: 'fieldops@towerops.demo',
        phoneRecipients: '',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as NotificationConfig,
      {
        id: 3,
        name: 'Work Order Completion Update',
        eventType: 'WORK_ORDER_COMPLETED',
        subject: 'Work Order Completed - {{workOrderCode}}',
        body:
          'The assigned work order has been completed and is waiting for verification.',
        severity: 'MEDIUM',
        emailEnabled: true,
        smsEnabled: false,
        websocketEnabled: true,
        emailRecipients: 'noc@towerops.demo',
        phoneRecipients: '',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as NotificationConfig,
      {
        id: 4,
        name: 'Resolved Alert Summary',
        eventType: 'ALERT_RESOLVED',
        subject: 'Alert Resolved - {{alertId}}',
        body:
          'The alert has been resolved successfully. Please review the resolution notes.',
        severity: 'LOW',
        emailEnabled: true,
        smsEnabled: false,
        websocketEnabled: false,
        emailRecipients: 'admin@algotricz.demo',
        phoneRecipients: '',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as NotificationConfig,
      {
        id: 5,
        name: 'Inactive SMS Test Config',
        eventType: 'ALERT_ACKNOWLEDGED',
        subject: 'Alert Acknowledged - {{alertId}}',
        body:
          'The alert has been acknowledged by the NOC operator.',
        severity: 'LOW',
        emailEnabled: false,
        smsEnabled: true,
        websocketEnabled: false,
        emailRecipients: '',
        phoneRecipients: '+971509999999',
        active: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as NotificationConfig,
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