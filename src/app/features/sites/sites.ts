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
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { BaseComponent } from '../../core/base/base.component';
import { SiteService } from '../../core/services/site.service';
import { Router } from '@angular/router';

type SiteType = 'Tower' | 'Building' | 'Warehouse';
type SiteStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';
type DrawerMode = 'view' | 'create' | 'edit';

type Site = {
  id: string;
  code: string;
  name: string;
  type: SiteType;
  tenantName: string;
  region: string;
  zone: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  status: SiteStatus;
  devices: number;
  technicians: number;
  openAlerts: number;
  openWorkOrders: number;
  contactPerson: string;
  contactNumber: string;
  email: string;
};

@Component({
  selector: 'to-sites',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TableModule,
    Drawer,
    DetailField,
    StatusBadge,
  ],
  templateUrl: './sites.html',
  styleUrl: './sites.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sites extends BaseComponent implements OnInit {
  readonly siteServices = inject(SiteService);
  readonly router = inject(Router);

  readonly search = signal('');
  readonly typeFilter = signal<'All' | SiteType>('All');
  readonly statusFilter = signal<'All' | SiteStatus>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selectedSite = signal<Site | null>(null);

  readonly typeOptions = [
    { label: 'All Types', value: 'All' },
    { label: 'Tower', value: 'Tower' },
    { label: 'Building', value: 'Building' },
    { label: 'Warehouse', value: 'Warehouse' },
  ];

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Healthy', value: 'Healthy' },
    { label: 'Warning', value: 'Warning' },
    { label: 'Critical', value: 'Critical' },
    { label: 'Offline', value: 'Offline' },
  ];

  newSite = this.emptySiteDraft();

  readonly sites = signal<Site[]>([
    {
      id: 'SITE-001',
      code: 'TW-001',
      name: 'Dubai Marina Tower',
      type: 'Tower',
      tenantName: 'du Telecom NOC',
      region: 'UAE',
      zone: 'Dubai',
      city: 'Dubai',
      address: 'Dubai Marina',
      latitude: 25.0812,
      longitude: 55.1414,
      status: 'Healthy',
      devices: 18,
      technicians: 2,
      openAlerts: 1,
      openWorkOrders: 3,
      contactPerson: 'Ahmed Khan',
      contactNumber: '+971 50 000 0000',
      email: 'site.ops@du.ae',
    },
    {
      id: 'SITE-002',
      code: 'BL-004',
      name: 'Abu Dhabi HQ',
      type: 'Building',
      tenantName: 'Etisalat UAE',
      region: 'UAE',
      zone: 'Abu Dhabi',
      city: 'Abu Dhabi',
      address: 'Central Business District',
      latitude: 24.4539,
      longitude: 54.3773,
      status: 'Warning',
      devices: 42,
      technicians: 4,
      openAlerts: 3,
      openWorkOrders: 2,
      contactPerson: 'Sara Malik',
      contactNumber: '+971 55 000 0000',
      email: 'facilities@etisalat.ae',
    },
    {
      id: 'SITE-003',
      code: 'WH-002',
      name: 'Ajman Coastal Warehouse',
      type: 'Warehouse',
      tenantName: 'TowerOps Demo',
      region: 'UAE',
      zone: 'Ajman',
      city: 'Ajman',
      address: 'Ajman Industrial Area',
      latitude: 25.4052,
      longitude: 55.5136,
      status: 'Offline',
      devices: 14,
      technicians: 1,
      openAlerts: 4,
      openWorkOrders: 5,
      contactPerson: 'Demo Admin',
      contactNumber: '+971 52 000 0000',
      email: 'demo@towerops.io',
    },
  ]);

  readonly filteredSites = computed(() => {
    const query = this.search().toLowerCase().trim();
    const type = this.typeFilter();
    const status = this.statusFilter();

    return this.sites().filter((site) => {
      const matchesSearch =
        !query ||
        site.name.toLowerCase().includes(query) ||
        site.code.toLowerCase().includes(query) ||
        site.tenantName.toLowerCase().includes(query) ||
        site.city.toLowerCase().includes(query);

      const matchesType = type === 'All' || site.type === type;
      const matchesStatus = status === 'All' || site.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  });

  async ngOnInit() {
    // this.getSites();
    await this.siteServices.getAll();
  }
  navigateToDevices() {
    this.router.navigate(['/devices'], { queryParams: { siteId: this.selectedSite()?.id } });
  }
  navigateToWorkOrders() {
    this.router.navigate(['/work-orders'], { queryParams: { siteId: this.selectedSite()?.id } });
  }
  get drawerTitle(): string {
    if (this.drawerMode() === 'create') return 'Create Site';
    if (this.drawerMode() === 'edit') return 'Update Site';
    return this.selectedSite()?.name ?? 'Site Details';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'create') return 'New Site';
    if (this.drawerMode() === 'edit') return 'Edit Site';
    return this.selectedSite()?.code ?? '';
  }

  get drawerSize(): 'compact' | 'wide' {
    return this.drawerMode() === 'view' ? 'compact' : 'wide';
  }

  openCreateSite(): void {
    this.newSite = this.emptySiteDraft();
    this.selectedSite.set(null);
    this.drawerMode.set('create');
    this.drawerOpen.set(true);
  }

  openSite(site: Site): void {
    this.selectedSite.set(site);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  editSite(): void {
    const site = this.selectedSite();

    if (!site) return;

    this.newSite = {
      code: site.code,
      name: site.name,
      type: site.type,
      tenantName: site.tenantName,
      region: site.region,
      zone: site.zone,
      city: site.city,
      address: site.address,
      latitude: site.latitude,
      longitude: site.longitude,
      contactPerson: site.contactPerson,
      contactNumber: site.contactNumber,
      email: site.email,
    };

    this.drawerMode.set('edit');
  }

  saveSite(): void {
    if (this.drawerMode() === 'edit') {
      const selected = this.selectedSite();

      if (!selected) return;

      const updatedSite: Site = {
        ...selected,
        ...this.newSite,
      };

      this.sites.update((items) =>
        items.map((site) => (site.id === selected.id ? updatedSite : site)),
      );

      this.selectedSite.set(updatedSite);
      this.drawerMode.set('view');
      return;
    }

    const site: Site = {
      id: `SITE-${String(this.sites().length + 1).padStart(3, '0')}`,
      code: this.newSite.code || `SITE-${this.sites().length + 1}`,
      name: this.newSite.name || 'New Site',
      type: this.newSite.type,
      tenantName: this.newSite.tenantName,
      region: this.newSite.region,
      zone: this.newSite.zone,
      city: this.newSite.city,
      address: this.newSite.address,
      latitude: Number(this.newSite.latitude || 0),
      longitude: Number(this.newSite.longitude || 0),
      status: 'Healthy',
      devices: 0,
      technicians: 0,
      openAlerts: 0,
      openWorkOrders: 0,
      contactPerson: this.newSite.contactPerson,
      contactNumber: this.newSite.contactNumber,
      email: this.newSite.email,
    };

    this.sites.update((items) => [site, ...items]);
    this.closeDrawer();
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selectedSite.set(null);
    this.newSite = this.emptySiteDraft();
  }

  statusTone(status: SiteStatus): 'success' | 'warning' | 'danger' | 'muted' {
    if (status === 'Healthy') return 'success';
    if (status === 'Warning') return 'warning';
    if (status === 'Critical') return 'danger';
    return 'muted';
  }

  private emptySiteDraft() {
    return {
      code: '',
      name: '',
      type: 'Tower' as SiteType,
      tenantName: 'du Telecom NOC',
      region: '',
      zone: '',
      city: '',
      address: '',
      latitude: 0,
      longitude: 0,
      contactPerson: '',
      contactNumber: '',
      email: '',
    };
  }

  async getSites() {
    try {
      // this.setLoading(true);
      const res = await this.siteServices.getAll();
      // this.sites.set(res);
      console.log(res);
    } catch (error) {
      console.log('error', error);
    } finally {
      this.setLoading(false);
    }
  }
}