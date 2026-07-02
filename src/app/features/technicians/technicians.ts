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
import { firstValueFrom } from 'rxjs';

import { Site, SiteService } from '../../core/services/site.service';
import {
  Technician,
  TechnicianPayload,
  TechnicianService,
  TechnicianStatus,
} from '../../core/services/technician.service';
import { User, UserService } from '../../core/services/user.service';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { Timeline, TimelineItem } from '../../shared/ui/timeline/timeline';

type DrawerMode = 'view' | 'create' | 'edit' | 'assignUser';
type StatusFilter = 'All' | TechnicianStatus;

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
  private readonly technicianService = inject(TechnicianService);
  private readonly userService = inject(UserService);
  private readonly siteService = inject(SiteService);

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

  technicianForm: TechnicianPayload = this.emptyDraft();

  readonly timeline = signal<TimelineItem[]>([
    { title: 'Technician profile synced', time: 'System', tone: 'info' },
    { title: 'Availability loaded from backend', time: 'Now', tone: 'success' },
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

  async loadPageData(): Promise<void> {
    try {
      this.loading.set(true);

      const [technicians, usersRes, sitesRes] = await Promise.all([
        firstValueFrom(this.technicianService.getAll()),
        firstValueFrom(this.userService.getAll()),
        firstValueFrom(this.siteService.getAll()),
      ]);

      this.technicians.set(technicians ?? []);
      this.users.set(usersRes.data ?? []);
      this.sites.set(sitesRes.data ?? []);
    } catch (error) {
      console.error('Failed to load technicians:', error);
      this.technicians.set([]);
      this.users.set([]);
      this.sites.set([]);
    } finally {
      this.loading.set(false);
    }
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

  async saveTechnician(): Promise<void> {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.technicianCode || !payload.firstName || !payload.email) {
      return;
    }

    try {
      this.saving.set(true);

      if (this.drawerMode() === 'edit' || this.drawerMode() === 'assignUser') {
        const selected = this.selected();
        if (!selected) return;

        await firstValueFrom(this.technicianService.update(selected.id, payload));
      } else {
        await firstValueFrom(this.technicianService.create(payload));
      }

      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to save technician:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteTechnician(): Promise<void> {
    const technician = this.selected();

    if (!technician || this.saving()) return;

    try {
      this.saving.set(true);
      await firstValueFrom(this.technicianService.delete(technician.id));
      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to delete technician:', error);
    } finally {
      this.saving.set(false);
    }
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
      technicianCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      designation: '',
      department: '',
      tenantId: '',
      siteCode: '',
      status: 'AVAILABLE',
      enabled: true,
      skillSet: '',
      remarks: '',
      userId: null,
    };
  }
}