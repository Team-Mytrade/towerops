import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { Timeline, TimelineItem } from '../../shared/ui/timeline/timeline';

type AuditStatus = 'Success' | 'Failed' | 'Warning' | 'Info';
type AuditSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

type AuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  module: string;
  action: string;
  entity: string;
  ipAddress: string;
  browser: string;
  device: string;
  status: AuditStatus;
  severity: AuditSeverity;
  before: string;
  after: string;
  description: string;
};

@Component({
  selector: 'to-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DetailField,
    StatusBadge,
    Timeline,
  ],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogs {
  readonly search = signal('');
  readonly moduleFilter = signal('All');
  readonly statusFilter = signal('All');
  readonly selectedId = signal('AUD-10231');

  readonly moduleOptions = [
    { label: 'All Modules', value: 'All' },
    { label: 'Auth', value: 'Auth' },
    { label: 'Users', value: 'Users' },
    { label: 'Roles', value: 'Roles' },
    { label: 'Sites', value: 'Sites' },
    { label: 'Devices', value: 'Devices' },
    { label: 'Alerts', value: 'Alerts' },
    { label: 'Work Orders', value: 'Work Orders' },
    { label: 'Rules', value: 'Rules' },
    { label: 'Settings', value: 'Settings' },
  ];

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Success', value: 'Success' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Warning', value: 'Warning' },
    { label: 'Info', value: 'Info' },
  ];

  readonly logs = signal<AuditLog[]>([
    {
      id: 'AUD-10231',
      timestamp: '26 Jun 2026, 12:15 PM',
      actor: 'Ahmed Khan',
      module: 'Sites',
      action: 'Updated Site',
      entity: 'Dubai Marina Tower',
      ipAddress: '10.0.0.18',
      browser: 'Chrome 139',
      device: 'Windows 11',
      status: 'Success',
      severity: 'Medium',
      before: 'Fuel Threshold: 15%',
      after: 'Fuel Threshold: 20%',
      description: 'Site threshold configuration was updated.',
    },
    {
      id: 'AUD-10230',
      timestamp: '26 Jun 2026, 11:58 AM',
      actor: 'System',
      module: 'Alerts',
      action: 'Generated Alert',
      entity: 'Fuel Level Sensor',
      ipAddress: 'System',
      browser: 'System',
      device: 'Scheduler',
      status: 'Info',
      severity: 'High',
      before: 'Fuel Level: 28%',
      after: 'Fuel Level: 14%',
      description: 'Rule engine generated fuel threshold alert.',
    },
    {
      id: 'AUD-10229',
      timestamp: '26 Jun 2026, 11:22 AM',
      actor: 'Vikram Singh',
      module: 'Work Orders',
      action: 'Assigned Work Order',
      entity: 'WO-1002',
      ipAddress: '10.0.0.24',
      browser: 'Edge 139',
      device: 'Windows 11',
      status: 'Success',
      severity: 'Low',
      before: 'Engineer: Unassigned',
      after: 'Engineer: Rashid Ali',
      description: 'Work order was assigned to technician.',
    },
    {
      id: 'AUD-10228',
      timestamp: '26 Jun 2026, 10:40 AM',
      actor: 'Unknown',
      module: 'Auth',
      action: 'Failed Login',
      entity: 'admin@towerops.io',
      ipAddress: '103.21.45.19',
      browser: 'Chrome',
      device: 'Unknown',
      status: 'Failed',
      severity: 'Critical',
      before: 'Login Attempt',
      after: 'Blocked',
      description: 'Failed login attempt detected.',
    },
  ]);

  readonly filteredLogs = computed(() => {
    const query = this.search().toLowerCase().trim();
    const module = this.moduleFilter();
    const status = this.statusFilter();

    return this.logs().filter((log) => {
      const matchesSearch =
        !query ||
        log.id.toLowerCase().includes(query) ||
        log.actor.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.entity.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (module === 'All' || log.module === module) &&
        (status === 'All' || log.status === status)
      );
    });
  });

  readonly selectedLog = computed(() => {
    return this.logs().find((log) => log.id === this.selectedId()) ?? this.logs()[0];
  });

  readonly summary = computed(() => {
    const logs = this.logs();

    return {
      total: logs.length,
      failed: logs.filter((x) => x.status === 'Failed').length,
      security: logs.filter((x) => x.module === 'Auth').length,
      today: logs.length,
    };
  });

  readonly timeline = signal<TimelineItem[]>([
    { title: 'Activity started', time: '12:15 PM', tone: 'info' },
    { title: 'Validation completed', time: '12:15 PM', tone: 'success' },
    { title: 'Database updated', time: '12:15 PM', tone: 'success' },
    { title: 'Audit event saved', time: '12:15 PM', tone: 'info' },
  ]);

  selectLog(log: AuditLog): void {
    this.selectedId.set(log.id);
  }

  statusTone(status: AuditStatus): 'success' | 'danger' | 'warning' | 'info' {
    if (status === 'Success') return 'success';
    if (status === 'Failed') return 'danger';
    if (status === 'Warning') return 'warning';
    return 'info';
  }

  severityTone(severity: AuditSeverity): 'danger' | 'warning' | 'info' {
    if (severity === 'Critical' || severity === 'High') return 'danger';
    if (severity === 'Medium') return 'warning';
    return 'info';
  }
}