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
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { firstValueFrom } from 'rxjs';

import { TenantService, Tenant, TenantPayload } from '../../core/services/tenant.service';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { ActivatedRoute, Router } from '@angular/router';

type TenantStatus = 'Active' | 'Inactive';
type DrawerMode = 'create' | 'view' | 'edit';

type TenantRow = Tenant & {
  status: TenantStatus;
};

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
  private readonly tenantService = inject(TenantService);
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
        tenant.email?.toLowerCase().includes(query);

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
  async getTenants(): Promise<void> {
    try {
      this.loading.set(true);

      const response = await firstValueFrom(this.tenantService.getAll());

      const rows = (response.data ?? []).map((tenant) => this.mapTenant(tenant));

      this.tenants.set(rows);
    } catch (error) {
      console.error('Failed to load tenants:', error);
      this.tenants.set([]);
    } finally {
      this.loading.set(false);
    }
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

    if (!tenant) {
      return;
    }

    this.tenantForm = {
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
      email: tenant.email ?? '',
      phoneNumber: tenant.phoneNumber ?? '',
      address: tenant.address ?? '',
      enabled: tenant.enabled,
      createdBy: '',
    };

    this.drawerMode.set('edit');
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selectedTenant.set(null);
    this.tenantForm = this.getEmptyTenantForm();
  }

  async saveTenant(): Promise<void> {
    if (this.saving()) {
      return;
    }

    const payload = this.normalizePayload();

    if (!payload.tenantId || !payload.tenantName) {
      return;
    }

    try {
      this.saving.set(true);

      if (this.drawerMode() === 'edit') {
        const tenant = this.selectedTenant();

        if (!tenant) {
          return;
        }

        await firstValueFrom(this.tenantService.update(tenant.id, payload));
      } else {
        await firstValueFrom(this.tenantService.create(payload));
      }

      await this.getTenants();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to save tenant:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteTenant(): Promise<void> {
    const tenant = this.selectedTenant();

    if (!tenant || this.saving()) {
      return;
    }

    try {
      this.saving.set(true);
      await firstValueFrom(this.tenantService.delete(tenant.id));
      await this.getTenants();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    } finally {
      this.saving.set(false);
    }
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
      createdBy: this.tenantForm.createdBy,
    };
  }

  private getEmptyTenantForm(): TenantPayload {
    return {
      tenantId: '',
      tenantName: '',
      email: '',
      phoneNumber: '',
      address: '',
      enabled: true,
      createdBy: '',
    };
  }
}