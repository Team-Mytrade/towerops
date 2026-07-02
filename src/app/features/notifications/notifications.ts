import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { Timeline, TimelineItem } from '../../shared/ui/timeline/timeline';

type NotificationSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
type NotificationStatus = 'Unread' | 'Read' | 'Acknowledged';
type NotificationCategory =
  | 'Alarm'
  | 'Maintenance'
  | 'Work Order'
  | 'Rules'
  | 'Users'
  | 'System';

type NotificationChannel = 'App' | 'Email' | 'SMS' | 'WhatsApp' | 'Teams' | 'Slack';
type DrawerMode = 'settings';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  status: NotificationStatus;
  channel: NotificationChannel;
  site: string;
  device: string;
  rule: string;
  currentValue: string;
  previousValue: string;
  relatedTicket: string;
  relatedWorkOrder: string;
  createdAt: string;
};

@Component({
  selector: 'to-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    SelectModule,
    Drawer,
    DetailField,
    StatusBadge,
    Timeline,
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notifications {
  readonly search = signal('');
  readonly severityFilter = signal<'All' | NotificationSeverity>('All');
  readonly categoryFilter = signal<'All' | NotificationCategory>('All');
  readonly statusFilter = signal<'All' | NotificationStatus>('All');
  readonly channelFilter = signal<'All' | NotificationChannel>('All');

  readonly selectedId = signal('NOT-1001');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('settings');

  settings = {
    app: true,
    email: true,
    sms: false,
    whatsapp: false,
    teams: true,
    slack: false,
    quietStart: '22:00',
    quietEnd: '07:00',
    escalationOne: '5 mins',
    escalationTwo: '15 mins',
    escalationThree: '30 mins',
  };

  readonly severityOptions = [
    { label: 'All Severity', value: 'All' },
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
    { label: 'Info', value: 'Info' },
  ];

  readonly categoryOptions = [
    { label: 'All Categories', value: 'All' },
    { label: 'Alarm', value: 'Alarm' },
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Work Order', value: 'Work Order' },
    { label: 'Rules', value: 'Rules' },
    { label: 'Users', value: 'Users' },
    { label: 'System', value: 'System' },
  ];

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Unread', value: 'Unread' },
    { label: 'Read', value: 'Read' },
    { label: 'Acknowledged', value: 'Acknowledged' },
  ];

  readonly channelOptions = [
    { label: 'All Channels', value: 'All' },
    { label: 'App', value: 'App' },
    { label: 'Email', value: 'Email' },
    { label: 'SMS', value: 'SMS' },
    { label: 'WhatsApp', value: 'WhatsApp' },
    { label: 'Teams', value: 'Teams' },
    { label: 'Slack', value: 'Slack' },
  ];

  readonly notifications = signal<NotificationItem[]>([
    {
      id: 'NOT-1001',
      title: 'Fuel level below threshold',
      message: 'Fuel level dropped below 20% at Dubai Marina Tower.',
      severity: 'Critical',
      category: 'Alarm',
      status: 'Unread',
      channel: 'App',
      site: 'Dubai Marina Tower',
      device: 'Fuel Level Sensor',
      rule: 'Fuel < 20%',
      currentValue: '14%',
      previousValue: '28%',
      relatedTicket: 'TCK-1002',
      relatedWorkOrder: 'WO-1002',
      createdAt: '2 min ago',
    },
    {
      id: 'NOT-1002',
      title: 'Signal loss detected',
      message: 'Transmitter signal dropped below configured threshold.',
      severity: 'Critical',
      category: 'Alarm',
      status: 'Acknowledged',
      channel: 'Email',
      site: 'Dubai Marina Tower',
      device: 'Transmitter Monitor',
      rule: 'Signal < 40%',
      currentValue: '38%',
      previousValue: '72%',
      relatedTicket: 'TCK-1001',
      relatedWorkOrder: 'WO-1001',
      createdAt: '12 min ago',
    },
    {
      id: 'NOT-1003',
      title: 'Maintenance completed',
      message: 'Technician marked maintenance as completed. Waiting for admin closure.',
      severity: 'Medium',
      category: 'Maintenance',
      status: 'Read',
      channel: 'Teams',
      site: 'Abu Dhabi HQ',
      device: 'Generator Controller',
      rule: 'Maintenance Completion',
      currentValue: 'Completed',
      previousValue: 'In Progress',
      relatedTicket: 'MT-1003',
      relatedWorkOrder: '-',
      createdAt: 'Yesterday',
    },
    {
      id: 'NOT-1004',
      title: 'New work order assigned',
      message: 'WO-1002 assigned to Rashid Ali.',
      severity: 'Low',
      category: 'Work Order',
      status: 'Unread',
      channel: 'WhatsApp',
      site: 'Dubai Marina Tower',
      device: 'Fuel Level Sensor',
      rule: 'Assignment Notification',
      currentValue: 'Assigned',
      previousValue: 'Open',
      relatedTicket: 'TCK-1002',
      relatedWorkOrder: 'WO-1002',
      createdAt: '1h ago',
    },
  ]);

  readonly filteredNotifications = computed(() => {
    const query = this.search().toLowerCase().trim();
    const severity = this.severityFilter();
    const category = this.categoryFilter();
    const status = this.statusFilter();
    const channel = this.channelFilter();

    return this.notifications().filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.site.toLowerCase().includes(query) ||
        item.device.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (severity === 'All' || item.severity === severity) &&
        (category === 'All' || item.category === category) &&
        (status === 'All' || item.status === status) &&
        (channel === 'All' || item.channel === channel)
      );
    });
  });

  readonly selectedNotification = computed(() => {
    return (
      this.notifications().find((item) => item.id === this.selectedId()) ??
      this.notifications()[0]
    );
  });

  readonly summary = computed(() => {
    const items = this.notifications();

    return {
      total: items.length,
      unread: items.filter((item) => item.status === 'Unread').length,
      critical: items.filter((item) => item.severity === 'Critical').length,
      acknowledged: items.filter((item) => item.status === 'Acknowledged').length,
    };
  });

  readonly timeline = signal<TimelineItem[]>([
    {
      title: 'Notification generated',
      description: 'Rule engine created notification from alert.',
      time: '11:18 AM',
      tone: 'danger',
    },
    {
      title: 'Notification delivered',
      description: 'Sent through configured notification channel.',
      time: '11:19 AM',
      tone: 'info',
    },
    {
      title: 'Ticket linked',
      description: 'Related ticket and work order attached.',
      time: '11:20 AM',
      tone: 'success',
    },
  ]);

  selectNotification(item: NotificationItem): void {
    this.selectedId.set(item.id);

    if (item.status === 'Unread') {
      this.updateStatus(item.id, 'Read');
    }
  }

  acknowledgeSelected(): void {
    const item = this.selectedNotification();

    if (!item) return;

    this.updateStatus(item.id, 'Acknowledged');
  }

  markAllRead(): void {
    this.notifications.update((items) =>
      items.map((item) =>
        item.status === 'Unread' ? { ...item, status: 'Read' } : item,
      ),
    );
  }

  openSettings(): void {
    this.drawerMode.set('settings');
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  private updateStatus(id: string, status: NotificationStatus): void {
    this.notifications.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  severityTone(
    severity: NotificationSeverity,
  ): 'danger' | 'warning' | 'info' | 'muted' {
    if (severity === 'Critical' || severity === 'High') return 'danger';
    if (severity === 'Medium') return 'warning';
    if (severity === 'Low' || severity === 'Info') return 'info';
    return 'muted';
  }

  statusTone(status: NotificationStatus): 'success' | 'warning' | 'info' {
    if (status === 'Acknowledged') return 'success';
    if (status === 'Unread') return 'warning';
    return 'info';
  }
}