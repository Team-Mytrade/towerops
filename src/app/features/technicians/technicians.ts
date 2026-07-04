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
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { Site } from '../../core/services/site.service';
import {
  Technician,
  TechnicianPayload,
  TechnicianStatus,
} from '../../core/services/technician.service';
import { User } from '../../core/services/user.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { Timeline, TimelineItem } from '../../shared/ui/timeline/timeline';

type DrawerMode = 'view' | 'create' | 'edit' | 'assignUser';
type StatusFilter = 'All' | TechnicianStatus;

const STORAGE_KEYS = {
  technicians: 'towerops_technicians',
  users: 'towerops_users',
  sites: 'towerops_sites',
};

@Component({
  selector: 'to-technicians',
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
    Timeline,
  ],
  templateUrl: './technicians.html',
  styleUrl: './technicians.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Technicians implements OnInit {
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly statusFilter = signal<StatusFilter>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selected = signal<Technician | null>(null);

  readonly technicians = signal<Technician[]>([]);
  readonly users = signal<User[]>([]);
  readonly sites = signal<Site[]>([]);

  technicianForm: TechnicianPayload = this.emptyDraft();

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'On Site', value: 'ON_SITE' },
    { label: 'Off Duty', value: 'OFF_DUTY' },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  readonly technicianStatusOptions = this.statusOptions.slice(1);

  readonly userOptions = computed(() => [
    { label: 'Not Mapped', value: null },
    ...this.users().map((user) => ({
      label: `${user.userCode} · ${user.username}`,
      value: user.id,
    })),
  ]);

  readonly siteOptions = computed(() =>
    this.sites().map((site) => ({
      label: `${site.siteCode} · ${site.siteName}`,
      value: site.siteCode,
    })),
  );

  readonly timeline = signal<TimelineItem[]>([
    { title: 'Technician profile synced', time: 'Local demo data', tone: 'info' },
    { title: 'Availability loaded', time: 'Now', tone: 'success' },
  ]);

  readonly filteredTechnicians = computed(() => {
    const query = this.search().toLowerCase().trim();
    const status = this.statusFilter();

    return this.technicians().filter((tech) => {
      const fullName = `${tech.firstName} ${tech.lastName}`.toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        tech.technicianCode?.toLowerCase().includes(query) ||
        tech.email?.toLowerCase().includes(query) ||
        tech.phoneNumber?.toLowerCase().includes(query) ||
        tech.tenantId?.toLowerCase().includes(query) ||
        tech.siteCode?.toLowerCase().includes(query) ||
        this.siteLabel(tech.siteCode).toLowerCase().includes(query) ||
        tech.skillSet?.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || tech.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  get drawerTitle(): string {
    if (this.drawerMode() === 'create') return 'Create Technician';
    if (this.drawerMode() === 'edit') return 'Update Technician';
    if (this.drawerMode() === 'assignUser') return 'Assign User ID';

    const technician = this.selected();
    return technician ? this.fullName(technician) : 'Technician Details';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'create') return 'New Technician';
    if (this.drawerMode() === 'edit') return 'Edit Technician';
    return this.selected()?.technicianCode ?? '';
  }

  get drawerSize(): 'compact' | 'wide' {
    return this.drawerMode() === 'view' ? 'compact' : 'wide';
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.loading.set(true);

    this.seedLocalStorageIfEmpty();

    this.technicians.set(
      this.readStorage<Technician[]>(STORAGE_KEYS.technicians, []),
    );
    this.users.set(this.readStorage<User[]>(STORAGE_KEYS.users, []));
    this.sites.set(this.readStorage<Site[]>(STORAGE_KEYS.sites, []));

    this.loading.set(false);
  }

  openCreate(): void {
    this.technicianForm = this.emptyDraft();
    this.selected.set(null);
    this.drawerMode.set('create');
    this.drawerOpen.set(true);
  }

  openTechnician(technician: Technician): void {
    this.selected.set(technician);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  editTechnician(): void {
    const technician = this.selected();
    if (!technician) return;

    this.technicianForm = this.toPayload(technician);
    this.drawerMode.set('edit');
  }

  assignUser(): void {
    const technician = this.selected();
    if (!technician) return;

    this.technicianForm = this.toPayload(technician);
    this.drawerMode.set('assignUser');
  }

  saveTechnician(): void {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.technicianCode || !payload.firstName || !payload.email) return;

    this.saving.set(true);

    const technicians = [...this.technicians()];

    if (this.drawerMode() === 'edit' || this.drawerMode() === 'assignUser') {
      const selected = this.selected();

      if (!selected) {
        this.saving.set(false);
        return;
      }

      const updated = technicians.map((item) =>
        item.id === selected.id
          ? {
            ...item,
            ...payload,
            username: this.getUsername(payload.userId),
          }
          : item,
      );

      this.technicians.set(updated);
      this.writeStorage(STORAGE_KEYS.technicians, updated);
    } else {
      const newTechnician: Technician = {
        id: this.nextId(technicians),
        ...payload,
        username: this.getUsername(payload.userId),
      };

      const updated = [newTechnician, ...technicians];

      this.technicians.set(updated);
      this.writeStorage(STORAGE_KEYS.technicians, updated);
    }

    this.saving.set(false);
    this.closeDrawer();
  }

  deleteTechnician(): void {
    const technician = this.selected();

    if (!technician || this.saving()) return;

    this.saving.set(true);

    const updated = this.technicians().filter((item) => item.id !== technician.id);

    this.technicians.set(updated);
    this.writeStorage(STORAGE_KEYS.technicians, updated);

    this.saving.set(false);
    this.closeDrawer();
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selected.set(null);
    this.technicianForm = this.emptyDraft();
  }

  fullName(technician: Technician): string {
    return `${technician.firstName ?? ''} ${technician.lastName ?? ''}`.trim() || '-';
  }

  userLabel(userId: number | null): string {
    if (!userId) return 'Not mapped';

    const user = this.users().find((item) => item.id === userId);
    return user ? `${user.userCode} · ${user.username}` : String(userId);
  }

  siteLabel(siteCode: string): string {
    if (!siteCode) return '-';

    const site = this.sites().find((item) => item.siteCode === siteCode);
    return site ? `${site.siteCode} · ${site.siteName}` : siteCode;
  }

  statusLabel(status: TechnicianStatus): string {
    return status
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  statusTone(status: TechnicianStatus): 'success' | 'warning' | 'danger' | 'muted' {
    if (status === 'AVAILABLE') return 'success';
    if (status === 'ASSIGNED' || status === 'ON_SITE') return 'warning';
    if (status === 'OFF_DUTY') return 'muted';
    return 'danger';
  }

  private toPayload(technician: Technician): TechnicianPayload {
    return {
      technicianCode: technician.technicianCode,
      firstName: technician.firstName,
      lastName: technician.lastName,
      email: technician.email,
      phoneNumber: technician.phoneNumber,
      designation: technician.designation,
      department: technician.department,
      tenantId: technician.tenantId,
      siteCode: technician.siteCode,
      status: technician.status,
      enabled: technician.enabled,
      skillSet: technician.skillSet,
      remarks: technician.remarks,
      userId: technician.userId ?? null,
    };
  }

  private normalizePayload(): TechnicianPayload {
    return {
      technicianCode: this.technicianForm.technicianCode.trim(),
      firstName: this.technicianForm.firstName.trim(),
      lastName: this.technicianForm.lastName.trim(),
      email: this.technicianForm.email.trim(),
      phoneNumber: this.technicianForm.phoneNumber.trim(),
      designation: this.technicianForm.designation.trim(),
      department: this.technicianForm.department.trim(),
      tenantId: this.technicianForm.tenantId.trim(),
      siteCode: this.technicianForm.siteCode.trim(),
      status: this.technicianForm.status,
      enabled: this.technicianForm.enabled,
      skillSet: this.technicianForm.skillSet.trim(),
      remarks: this.technicianForm.remarks.trim(),
      userId: this.technicianForm.userId,
    };
  }

  private emptyDraft(): TechnicianPayload {
    return {
      technicianCode: this.generateTechnicianCode(),
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      designation: '',
      department: '',
      tenantId: 'ALG-001',
      siteCode: '',
      status: 'AVAILABLE',
      enabled: true,
      skillSet: '',
      remarks: '',
      userId: null,
    };
  }

  private seedLocalStorageIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.sites)) {
      this.writeStorage(STORAGE_KEYS.sites, this.mockSites());
    }

    if (!localStorage.getItem(STORAGE_KEYS.users)) {
      this.writeStorage(STORAGE_KEYS.users, this.mockUsers());
    }

    if (!localStorage.getItem(STORAGE_KEYS.technicians)) {
      this.writeStorage(STORAGE_KEYS.technicians, this.mockTechnicians());
    }
  }

  private mockSites(): Site[] {
    return [
      {
        id: 1,
        siteCode: 'TW-001',
        siteName: 'Dubai Marina Tower',
      } as Site,
      {
        id: 2,
        siteCode: 'TW-002',
        siteName: 'Business Bay Tower',
      } as Site,
      {
        id: 3,
        siteCode: 'BL-001',
        siteName: 'Abu Dhabi Central Building',
      } as Site,
      {
        id: 4,
        siteCode: 'WH-001',
        siteName: 'Ajman Coastal Warehouse',
      } as Site,
    ];
  }

  private mockUsers(): User[] {
    return [
      {
        id: 1,
        userCode: 'USR-001',
        userType: 'SUPER_ADMIN',
        username: 'superadmin',
        email: 'superadmin@towerops.demo',
        roleIds: [1],
        enabled: true,
        phoneNumber: '+971500000001',
        address: {
          street: 'Sheikh Zayed Road',
          city: 'Dubai',
          state: 'Dubai',
          postalCode: '00001',
          country: 'UAE',
        },
        active: true,
      },
      {
        id: 2,
        userCode: 'USR-002',
        userType: 'TENANT_ADMIN',
        username: 'admin_user',
        email: 'admin@algotricz.demo',
        roleIds: [2],
        enabled: true,
        phoneNumber: '+971500000002',
        address: {
          street: 'Business Bay',
          city: 'Dubai',
          state: 'Dubai',
          postalCode: '00002',
          country: 'UAE',
        },
        active: true,
      },
      {
        id: 3,
        userCode: 'USR-003',
        userType: 'TECHNICIAN',
        username: 'arun.kumar',
        email: 'arun.kumar@towerops.demo',
        roleIds: [4],
        enabled: true,
        phoneNumber: '+971501112233',
        address: {
          street: 'Al Barsha',
          city: 'Dubai',
          state: 'Dubai',
          postalCode: '00003',
          country: 'UAE',
        },
        active: true,
      },
      {
        id: 4,
        userCode: 'USR-004',
        userType: 'TECHNICIAN',
        username: 'naveen.raj',
        email: 'naveen.raj@towerops.demo',
        roleIds: [4],
        enabled: true,
        phoneNumber: '+971502223344',
        address: {
          street: 'Dubai Marina',
          city: 'Dubai',
          state: 'Dubai',
          postalCode: '00004',
          country: 'UAE',
        },
        active: true,
      },
      {
        id: 5,
        userCode: 'USR-005',
        userType: 'TECHNICIAN',
        username: 'faisal.rahman',
        email: 'faisal.rahman@towerops.demo',
        roleIds: [4],
        enabled: true,
        phoneNumber: '+971503334455',
        address: {
          street: 'Corniche Road',
          city: 'Abu Dhabi',
          state: 'Abu Dhabi',
          postalCode: '00005',
          country: 'UAE',
        },
        active: true,
      },
    ];
  }

  private mockTechnicians(): Technician[] {
    return [
      {
        id: 1,
        technicianCode: 'TECH-001',
        firstName: 'Arun',
        lastName: 'Kumar',
        email: 'arun.kumar@towerops.demo',
        phoneNumber: '+971501112233',
        designation: 'Field Engineer',
        department: 'Network Operations',
        tenantId: 'ALG-001',
        siteCode: 'TW-001',
        status: 'AVAILABLE',
        enabled: true,
        skillSet: 'Signal inspection, gateway setup, RF calibration',
        remarks: 'Senior field technician for Dubai zone.',
        userId: 3,
        username: 'arun.kumar',
      },
      {
        id: 2,
        technicianCode: 'TECH-002',
        firstName: 'Naveen',
        lastName: 'Raj',
        email: 'naveen.raj@towerops.demo',
        phoneNumber: '+971502223344',
        designation: 'Maintenance Engineer',
        department: 'Field Service',
        tenantId: 'ALG-001',
        siteCode: 'TW-002',
        status: 'ASSIGNED',
        enabled: true,
        skillSet: 'Battery backup, generator inspection, cabling',
        remarks: 'Handles priority maintenance tickets.',
        userId: 4,
        username: 'naveen.raj',
      },
      {
        id: 3,
        technicianCode: 'TECH-003',
        firstName: 'Faisal',
        lastName: 'Rahman',
        email: 'faisal.rahman@towerops.demo',
        phoneNumber: '+971503334455',
        designation: 'IoT Support Engineer',
        department: 'IoT Operations',
        tenantId: 'ALG-001',
        siteCode: 'BL-001',
        status: 'ON_SITE',
        enabled: true,
        skillSet: 'Device provisioning, telemetry, gateway troubleshooting',
        remarks: 'Currently supporting Abu Dhabi sites.',
        userId: 5,
        username: 'faisal.rahman',
      },
      {
        id: 4,
        technicianCode: 'TECH-004',
        firstName: 'Rahul',
        lastName: 'Menon',
        email: 'rahul.menon@towerops.demo',
        phoneNumber: '+971504445566',
        designation: 'Power Systems Technician',
        department: 'Power Operations',
        tenantId: 'ALG-001',
        siteCode: 'WH-001',
        status: 'OFF_DUTY',
        enabled: true,
        skillSet: 'UPS, generator, battery bank, fuel sensor calibration',
        remarks: 'Available for emergency escalation only.',
        userId: null,
        username: '',
      },
      {
        id: 5,
        technicianCode: 'TECH-005',
        firstName: 'Imran',
        lastName: 'Shaikh',
        email: 'imran.shaikh@towerops.demo',
        phoneNumber: '+971505556677',
        designation: 'Junior Technician',
        department: 'Field Service',
        tenantId: 'ALG-001',
        siteCode: 'TW-001',
        status: 'INACTIVE',
        enabled: false,
        skillSet: 'Basic device inspection and preventive maintenance',
        remarks: 'Inactive for demo status visibility.',
        userId: null,
        username: '',
      },
    ];
  }

  private generateTechnicianCode(): string {
    const technicians = this.readStorage<Technician[]>(
      STORAGE_KEYS.technicians,
      [],
    );

    const nextNumber = technicians.length + 1;
    return `TECH-${String(nextNumber).padStart(3, '0')}`;
  }

  private getUsername(userId: number | null): string {
    if (!userId) return '';

    const user = this.users().find((item) => item.id === userId);
    return user?.username ?? '';
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