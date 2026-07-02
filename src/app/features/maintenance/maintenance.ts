import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { Timeline, TimelineItem } from '../../shared/ui/timeline/timeline';

type MaintenanceStatus =
  | 'Scheduled'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Closed'
  | 'Re-Opened';

type MaintenanceType = 'Preventive' | 'Corrective' | 'Inspection' | 'Calibration';
type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
type DrawerMode = 'view' | 'create' | 'edit';

type MaintenanceTicket = {
  id: string;
  title: string;
  site: string;
  device: string;
  type: MaintenanceType;
  scheduledDate: string;
  technician: string;
  status: MaintenanceStatus;
  priority: Priority;
  notes: string;
};

@Component({
  selector: 'to-maintenance',
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
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Maintenance {
  readonly search = signal('');
  readonly statusFilter = signal<'All' | MaintenanceStatus>('All');
  readonly typeFilter = signal<'All' | MaintenanceType>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selected = signal<MaintenanceTicket | null>(null);

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Scheduled', value: 'Scheduled' },
    { label: 'Assigned', value: 'Assigned' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Re-Opened', value: 'Re-Opened' },
  ];

  readonly typeOptions = [
    { label: 'All Types', value: 'All' },
    { label: 'Preventive', value: 'Preventive' },
    { label: 'Corrective', value: 'Corrective' },
    { label: 'Inspection', value: 'Inspection' },
    { label: 'Calibration', value: 'Calibration' },
  ];

  readonly priorityOptions = [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ];

  readonly technicians = [
    { label: 'Unassigned', value: '' },
    { label: 'Ahmed Khan', value: 'Ahmed Khan' },
    { label: 'Rashid Ali', value: 'Rashid Ali' },
    { label: 'Naveen Kumar', value: 'Naveen Kumar' },
  ];

  newTicket = this.emptyDraft();

  readonly tickets = signal<MaintenanceTicket[]>([
    {
      id: 'MT-1001',
      title: 'Monthly tower inspection',
      site: 'Dubai Marina Tower',
      device: 'Gateway Controller 01',
      type: 'Preventive',
      scheduledDate: '28 Jun 2026',
      technician: 'Ahmed Khan',
      status: 'Scheduled',
      priority: 'Medium',
      notes: 'Routine monthly inspection for tower equipment and gateway health.',
    },
    {
      id: 'MT-1002',
      title: 'Fuel sensor calibration',
      site: 'Dubai Marina Tower',
      device: 'Fuel Level Sensor',
      type: 'Calibration',
      scheduledDate: '30 Jun 2026',
      technician: 'Rashid Ali',
      status: 'Assigned',
      priority: 'High',
      notes: 'Calibration required due to inconsistent fuel readings.',
    },
    {
      id: 'MT-1003',
      title: 'Generator controller check',
      site: 'Abu Dhabi HQ',
      device: 'Generator Controller',
      type: 'Inspection',
      scheduledDate: '02 Jul 2026',
      technician: '',
      status: 'Completed',
      priority: 'Low',
      notes: 'Technician marked completed. Waiting for admin closure.',
    },
  ]);

  readonly timeline = signal<TimelineItem[]>([
    { title: 'Maintenance created', time: '09:10 AM', tone: 'info' },
    { title: 'Technician assigned', time: '09:25 AM', tone: 'success' },
    { title: 'Waiting for completion', time: 'Now', tone: 'warning' },
  ]);

  readonly filteredTickets = computed(() => {
    const query = this.search().toLowerCase().trim();
    const status = this.statusFilter();
    const type = this.typeFilter();

    return this.tickets().filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.id.toLowerCase().includes(query) ||
        ticket.site.toLowerCase().includes(query) ||
        ticket.device.toLowerCase().includes(query) ||
        ticket.technician.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || ticket.status === status;
      const matchesType = type === 'All' || ticket.type === type;

      return matchesSearch && matchesStatus && matchesType;
    });
  });

  get drawerTitle(): string {
    if (this.drawerMode() === 'create') return 'Create Maintenance';
    if (this.drawerMode() === 'edit') return 'Update Maintenance';
    return this.selected()?.title ?? 'Maintenance Details';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'create') return 'New Maintenance';
    if (this.drawerMode() === 'edit') return 'Edit Maintenance';
    return this.selected()?.id ?? '';
  }

  get drawerSize(): 'compact' | 'wide' {
    return this.drawerMode() === 'view' ? 'compact' : 'wide';
  }

  openCreate(): void {
    this.newTicket = this.emptyDraft();
    this.selected.set(null);
    this.drawerMode.set('create');
    this.drawerOpen.set(true);
  }

  openTicket(ticket: MaintenanceTicket): void {
    this.selected.set(ticket);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  editTicket(): void {
    const ticket = this.selected();
    if (!ticket) return;

    this.newTicket = structuredClone(ticket);
    this.drawerMode.set('edit');
  }

  saveTicket(): void {
    if (this.drawerMode() === 'edit') {
      const selected = this.selected();
      if (!selected) return;

      const updated = structuredClone(this.newTicket);

      this.tickets.update((items) =>
        items.map((item) => (item.id === selected.id ? updated : item)),
      );

      this.selected.set(updated);
      this.drawerMode.set('view');
      return;
    }

    const ticket: MaintenanceTicket = {
      ...structuredClone(this.newTicket),
      id: `MT-${String(this.tickets().length + 1).padStart(4, '0')}`,
      status: this.newTicket.technician ? 'Assigned' : 'Scheduled',
    };

    this.tickets.update((items) => [ticket, ...items]);
    this.closeDrawer();
  }

  closeMaintenance(): void {
    const ticket = this.selected();
    if (!ticket) return;

    this.updateStatus(ticket.id, 'Closed');
  }

  reopenMaintenance(): void {
    const ticket = this.selected();
    if (!ticket) return;

    this.updateStatus(ticket.id, 'Re-Opened');
  }

  updateStatus(id: string, status: MaintenanceStatus): void {
    this.tickets.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );

    const current = this.selected();

    if (current?.id === id) {
      this.selected.set({ ...current, status });
    }
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selected.set(null);
    this.newTicket = this.emptyDraft();
  }

  statusTone(status: MaintenanceStatus): 'success' | 'warning' | 'danger' | 'info' | 'muted' {
    if (status === 'Scheduled') return 'info';
    if (status === 'Assigned' || status === 'In Progress') return 'warning';
    if (status === 'Completed') return 'success';
    if (status === 'Closed') return 'muted';
    return 'danger';
  }

  priorityTone(priority: Priority): 'danger' | 'warning' | 'info' {
    if (priority === 'Critical' || priority === 'High') return 'danger';
    if (priority === 'Medium') return 'warning';
    return 'info';
  }

  private emptyDraft(): MaintenanceTicket {
    return {
      id: '',
      title: '',
      site: '',
      device: '',
      type: 'Preventive',
      scheduledDate: '',
      technician: '',
      status: 'Scheduled',
      priority: 'Medium',
      notes: '',
    };
  }
}