import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

type AdminKpi = {
  label: string;
  value: string;
  icon: string;
  variant: 'blue' | 'green' | 'amber' | 'red';
};

@Component({
  selector: 'to-admin-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOverviewComponent {
  readonly kpis = signal<AdminKpi[]>([
    { label: 'Total Users', value: '42', icon: 'pi pi-users', variant: 'blue' },
    { label: 'Active Technicians', value: '18', icon: 'pi pi-wrench', variant: 'green' },
    { label: 'Roles', value: '6', icon: 'pi pi-lock', variant: 'amber' },
    { label: 'Active Rules', value: '9', icon: 'pi pi-sitemap', variant: 'red' },
  ]);

  readonly quickActions = [
    { label: 'Create User', icon: 'pi pi-user-plus', route: '/admin/users' },
    { label: 'Create Role', icon: 'pi pi-lock', route: '/admin/roles' },
    { label: 'Add Technician', icon: 'pi pi-wrench', route: '/admin/technicians' },
    { label: 'Create Rule', icon: 'pi pi-sitemap', route: '/admin/rules' },
  ];

  readonly activities = [
    'Super Admin closed Work Order WO-1024',
    'Technician profile linked to user Ahmed Khan',
    'Rule “Signal Drop Alarm” was activated',
    'Role “NOC Operator” permission updated',
  ];
}