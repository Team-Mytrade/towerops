import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type TenantStatus = 'Active' | 'Inactive';

type Tenant = {
  id: string;
  name: string;
  admin: string;
  sites: number;
  devices: number;
  users: number;
  status: TenantStatus;
  plan: string;
  lastActivity: string;
};

@Component({
  selector: 'to-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantsComponent {
  readonly search = signal('');
  readonly statusFilter = signal<'All' | TenantStatus>('All');
  readonly drawerMode = signal<'create' | 'view' | null>(null);
  readonly selectedTenant = signal<Tenant | null>(null);

  readonly tenants = signal<Tenant[]>([
    {
      id: 'TEN-001',
      name: 'du Telecom NOC',
      admin: 'Ahmed Khan',
      sites: 42,
      devices: 1240,
      users: 86,
      status: 'Active',
      plan: 'Enterprise',
      lastActivity: 'Today, 10:24 AM',
    },
    {
      id: 'TEN-002',
      name: 'Etisalat UAE',
      admin: 'Sara Malik',
      sites: 58,
      devices: 1684,
      users: 112,
      status: 'Active',
      plan: 'Enterprise',
      lastActivity: 'Today, 09:10 AM',
    },
    {
      id: 'TEN-003',
      name: 'TowerOps Demo',
      admin: 'Demo Admin',
      sites: 18,
      devices: 412,
      users: 28,
      status: 'Inactive',
      plan: 'Trial',
      lastActivity: 'Yesterday, 04:42 PM',
    },
  ]);

  readonly filteredTenants = computed(() => {
    const query = this.search().toLowerCase().trim();
    const status = this.statusFilter();

    return this.tenants().filter((tenant) => {
      const matchesSearch =
        !query ||
        tenant.name.toLowerCase().includes(query) ||
        tenant.id.toLowerCase().includes(query) ||
        tenant.admin.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || tenant.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  openCreate(): void {
    this.selectedTenant.set(null);
    this.drawerMode.set('create');
  }

  openTenant(tenant: Tenant): void {
    this.selectedTenant.set(tenant);
    this.drawerMode.set('view');
  }

  closeDrawer(): void {
    this.drawerMode.set(null);
    this.selectedTenant.set(null);
  }
}