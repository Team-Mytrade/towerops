import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type TenantHealth = {
  name: string;
  sites: number;
  devices: number;
  alerts: number;
  status: 'Healthy' | 'Warning' | 'Critical';
};

@Component({
  selector: 'to-dashboard',
  standalone: true,
  imports: [CommonModule, StatusBadge],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly stats = signal([
    {
      label: 'Tenants',
      value: '12',
      meta: '+2 this month',
      icon: 'pi pi-building',
      tone: 'info',
    },
    {
      label: 'Sites',
      value: '148',
      meta: 'Across tenants',
      icon: 'pi pi-map-marker',
      tone: 'success',
    },
    {
      label: 'Devices',
      value: '3,842',
      meta: 'Active inventory',
      icon: 'pi pi-microchip',
      tone: 'default',
    },
    {
      label: 'Critical Alerts',
      value: '9',
      meta: 'Needs review',
      icon: 'pi pi-exclamation-triangle',
      tone: 'danger',
    },
    {
      label: 'Pending Approvals',
      value: '17',
      meta: 'Awaiting closure',
      icon: 'pi pi-check-square',
      tone: 'warning',
    },
  ] as const);

  readonly tenants = signal<TenantHealth[]>([
    { name: 'du Telecom NOC', sites: 42, devices: 1240, alerts: 3, status: 'Warning' },
    { name: 'Etisalat UAE', sites: 58, devices: 1684, alerts: 1, status: 'Healthy' },
    { name: 'TowerOps Demo', sites: 18, devices: 412, alerts: 5, status: 'Critical' },
  ]);

  readonly flowSteps = [
    {
      label: 'Alert Raised',
      description: 'Rule engine detects abnormal reading',
      icon: 'pi pi-bell',
    },
    {
      label: 'Ticket Created',
      description: 'Validated issue becomes a ticket',
      icon: 'pi pi-ticket',
    },
    {
      label: 'Work Order',
      description: 'Field task is dispatched',
      icon: 'pi pi-wrench',
    },
    {
      label: 'Technician',
      description: 'Engineer resolves the issue',
      icon: 'pi pi-users',
    },
    {
      label: 'Closed',
      description: 'Verified and approved',
      icon: 'pi pi-check-circle',
    },
  ];

  statusTone(status: TenantHealth['status']): 'success' | 'warning' | 'danger' {
    if (status === 'Healthy') return 'success';
    if (status === 'Warning') return 'warning';
    return 'danger';
  }
}