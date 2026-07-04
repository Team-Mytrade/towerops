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
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { Tenant, TenantPayload } from '../../core/services/tenant.service';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type TenantStatus = 'Active' | 'Inactive';
type DrawerMode = 'create' | 'view' | 'edit';

type TenantRow = Tenant & {
  status: TenantStatus;
};

const STORAGE_KEY = 'towerops_tenants';

@Component({
  selector: 'to-tenants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DrawerModule,
    InputTextModule,
    SelectModule,
    TableModule,
    DetailField,
    StatusBadge,
  ],
  templateUrl: './tenants.html',
  styleUrl: './tenants.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tenants implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly status = signal<'All' | TenantStatus>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selectedTenant = signal<TenantRow | null>(null);

  readonly tenants = signal<TenantRow[]>([]);

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  tenantForm: TenantPayload = this.getEmptyTenantForm();

  readonly filteredTenants = computed(() => {
    const query = this.search().toLowerCase().trim();
    const status = this.status();

    return this.tenants().filter((tenant) => {
      const matchesSearch =
        !query ||
        tenant.tenantName?.toLowerCase().includes(query) ||
        tenant.tenantId?.toLowerCase().includes(query) ||
        tenant.email?.toLowerCase().includes(query) ||
        tenant.phoneNumber?.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || tenant.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.getTenants();

    this.route.queryParamMap.subscribe((params) => {
      if (params.get('action') === 'create') {
        queueMicrotask(() => this.openCreateTenant());
      }
    });
  }

  getTenants(): void {
    this.loading.set(true);

    this.seedLocalStorageIfEmpty();

    const rows = this
      .readStorage<Tenant[]>(STORAGE_KEY, [])
      .map((tenant) => this.mapTenant(tenant));

    this.tenants.set(rows);

    this.loading.set(false);
  }

  openCreateTenant(): void {
    this.tenantForm = this.getEmptyTenantForm();
    this.selectedTenant.set(null);
    this.drawerMode.set('create');
    this.drawerOpen.set(true);
  }

  openTenant(tenant: TenantRow): void {
    this.selectedTenant.set(tenant);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  openEditTenant(): void {
    const tenant = this.selectedTenant();

    if (!tenant) return;

    this.tenantForm = {
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
      email: tenant.email ?? '',
      phoneNumber: tenant.phoneNumber ?? '',
      address: tenant.address ?? '',
      enabled: tenant.enabled,
    };

    this.drawerMode.set('edit');
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selectedTenant.set(null);
    this.tenantForm = this.getEmptyTenantForm();

    this.router.navigate([], {
      queryParams: { action: null },
      queryParamsHandling: 'merge',
    });
  }

  saveTenant(): void {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.tenantId || !payload.tenantName) return;

    this.saving.set(true);

    const tenants = this.readStorage<Tenant[]>(STORAGE_KEY, []);

    if (this.drawerMode() === 'edit') {
      const tenant = this.selectedTenant();

      if (!tenant) {
        this.saving.set(false);
        return;
      }

      const updatedTenants = tenants.map((item) =>
        item.id === tenant.id
          ? {
            ...item,
            ...payload,
            updatedAt: new Date().toISOString(),
          } as Tenant
          : item,
      );

      this.writeStorage(STORAGE_KEY, updatedTenants);
      this.tenants.set(updatedTenants.map((item) => this.mapTenant(item)));
    } else {
      const newTenant: Tenant = {
        id: this.nextId(tenants),
        tenantId: payload.tenantId,
        tenantName: payload.tenantName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        address: payload.address,
        enabled: payload.enabled,
        active: payload.enabled,
      };

      const updatedTenants = [newTenant, ...tenants];

      this.writeStorage(STORAGE_KEY, updatedTenants);
      this.tenants.set(updatedTenants.map((item) => this.mapTenant(item)));
    }

    this.saving.set(false);
    this.closeDrawer();
  }

  deleteTenant(): void {
    const tenant = this.selectedTenant();

    if (!tenant || this.saving()) return;

    this.saving.set(true);

    const updatedTenants = this
      .readStorage<Tenant[]>(STORAGE_KEY, [])
      .filter((item) => item.id !== tenant.id);

    this.writeStorage(STORAGE_KEY, updatedTenants);
    this.tenants.set(updatedTenants.map((item) => this.mapTenant(item)));

    this.saving.set(false);
    this.closeDrawer();
  }

  statusTone(status: TenantStatus): 'success' | 'danger' {
    return status === 'Active' ? 'success' : 'danger';
  }

  private mapTenant(tenant: Tenant): TenantRow {
    return {
      ...tenant,
      status: tenant.enabled ? 'Active' : 'Inactive',
    };
  }

  private normalizePayload(): TenantPayload {
    return {
      tenantId: this.tenantForm.tenantId.trim(),
      tenantName: this.tenantForm.tenantName.trim(),
      email: this.tenantForm.email.trim(),
      phoneNumber: this.tenantForm.phoneNumber.trim(),
      address: this.tenantForm.address.trim(),
      enabled: this.tenantForm.enabled,
      createdBy: this.tenantForm.createdBy?.trim() || 'local-demo',
    };
  }

  private getEmptyTenantForm(): TenantPayload {
    return {
      tenantId: this.generateTenantId(),
      tenantName: '',
      email: '',
      phoneNumber: '',
      address: '',
      enabled: true,
      createdBy: 'local-demo',
    };
  }

  private seedLocalStorageIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      this.writeStorage(STORAGE_KEY, this.mockTenants());
    }
  }

  private mockTenants(): Tenant[] {
    return [
      {
        id: 1,
        tenantId: 'ALG-001',
        tenantName: 'Algotricz Telecom Operations',
        email: 'admin@algotricz.demo',
        phoneNumber: '+971500000001',
        address: 'Business Bay, Dubai, UAE',
        enabled: true,
        active: true,
      },
      {
        id: 2,
        tenantId: 'MYT-002',
        tenantName: 'MyTrade Tower Services',
        email: 'ops@mytrade.demo',
        phoneNumber: '+971500000002',
        address: 'Dubai Marina, Dubai, UAE',
        enabled: true,
        active: true,
      },
      {
        id: 3,
        tenantId: 'NOC-003',
        tenantName: 'NOC Infrastructure LLC',
        email: 'noc@infrastructure.demo',
        phoneNumber: '+971500000003',
        address: 'Corniche Road, Abu Dhabi, UAE',
        enabled: true,
        active: true,
      },
      {
        id: 4,
        tenantId: 'LEG-004',
        tenantName: 'Legacy Telecom Partner',
        email: 'support@legacy.demo',
        phoneNumber: '+971500000004',
        address: 'Ajman Industrial Area, UAE',
        enabled: false,
        active: false,
      },
    ];
  }

  private generateTenantId(): string {
    const tenants = this.readStorage<Tenant[]>(STORAGE_KEY, []);
    const nextNumber = tenants.length + 1;

    return `TEN-${String(nextNumber).padStart(3, '0')}`;
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