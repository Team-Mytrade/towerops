import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

type SummaryCard = {
  label: string;
  value: string;
  meta: string;
  icon: string;
  tone: 'default' | 'success' | 'warning' | 'danger';
};

type TenantHealth = {
  tenant: string;
  sites: number;
  devices: number;
  alerts: number;
  status: 'Healthy' | 'Warning' | 'Critical';
};

@Component({
  selector: 'to-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminDashboardComponent {
  readonly cards = signal<SummaryCard[]>([
    {
      label: 'Tenants',
      value: '12',
      meta: '+2 this month',
      icon: 'fa-solid fa-building',
      tone: 'default',
    },
    {
      label: 'Sites',
      value: '148',
      meta: 'Across tenants',
      icon: 'fa-solid fa-location-dot',
      tone: 'success',
    },
    {
      label: 'Devices',
      value: '3,842',
      meta: 'Active inventory',
      icon: 'fa-solid fa-microchip',
      tone: 'default',
    },
    {
      label: 'Critical Alerts',
      value: '9',
      meta: 'Needs review',
      icon: 'fa-solid fa-triangle-exclamation',
      tone: 'danger',
    },
    {
      label: 'Pending Approvals',
      value: '17',
      meta: 'Awaiting closure',
      icon: 'fa-solid fa-clipboard-check',
      tone: 'warning',
    },
  ]);

  readonly tenantHealth = signal<TenantHealth[]>([
    {
      tenant: 'du Telecom NOC',
      sites: 42,
      devices: 1240,
      alerts: 3,
      status: 'Warning',
    },
    {
      tenant: 'Etisalat UAE',
      sites: 58,
      devices: 1684,
      alerts: 1,
      status: 'Healthy',
    },
    {
      tenant: 'TowerOps Demo',
      sites: 18,
      devices: 412,
      alerts: 5,
      status: 'Critical',
    },
  ]);

  readonly activities = signal([
    'Tenant Admin created for du Telecom NOC',
    'Notification configuration updated for Etisalat UAE',
    'Rule “Signal Drop Alarm” activated',
    'Technician completed WO-1042 and waits for approval',
  ]);
}