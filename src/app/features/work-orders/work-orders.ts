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
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { firstValueFrom } from 'rxjs';
import { DatePickerModule } from 'primeng/datepicker';

import {
  WorkOrder,
  WorkOrderPayload,
  WorkOrderService,
  WorkOrderStatus,
} from '../../core/services/work-order.service';
import { Technician, TechnicianService } from '../../core/services/technician.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { Timeline, TimelineItem } from '../../shared/ui/timeline/timeline';

type DrawerMode = 'view' | 'create' | 'edit';

type Column = {
  status: WorkOrderStatus;
  title: string;
};
type WorkOrderForm = Omit<
  WorkOrderPayload,
  'scheduledAt' | 'startedAt' | 'completedAt'
> & {
  scheduledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
};
@Component({
  selector: 'to-work-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    Drawer,
    DetailField,
    StatusBadge,
    Timeline,
    DatePickerModule
  ],
  templateUrl: './work-orders.html',
  styleUrl: './work-orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrders implements OnInit {
  private readonly workOrderService = inject(WorkOrderService);
  private readonly technicianService = inject(TechnicianService);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selected = signal<WorkOrder | null>(null);

  readonly assignDrawerOpen = signal(false);
  readonly pendingMove = signal<{ item: WorkOrder; target: WorkOrderStatus } | null>(null);

  selectedTechnicianId = 0;

  readonly workOrders = signal<WorkOrder[]>([]);
  readonly technicians = signal<Technician[]>([]);

  form: WorkOrderForm  = this.emptyDraft();

  readonly columns: Column[] = [
    { status: 'CREATED', title: 'Created' },
    { status: 'ASSIGNED', title: 'Assigned' },
    { status: 'SCHEDULED', title: 'Scheduled' },
    { status: 'IN_PROGRESS', title: 'In Progress' },
    { status: 'COMPLETED', title: 'Completed' },
    { status: 'VERIFIED', title: 'Verified' },
    { status: 'CLOSED', title: 'Closed' },
  ];

  readonly connectedDropLists = this.columns.map((column) => column.status);

  readonly statusOptions = this.columns.map((column) => ({
    label: column.title,
    value: column.status,
  }));

  readonly technicianOptions = computed(() =>
    this.technicians().map((tech) => ({
      label: `${tech.technicianCode} · ${tech.firstName} ${tech.lastName}`,
      value: tech.id,
    })),
  );

  readonly timeline = computed<TimelineItem[]>(() => {
    const item = this.selected();

    if (!item) return [];

    return [
      { title: 'Work order created', time: item.workOrderCode, tone: 'info' },
      {
        title: item.technicianId ? 'Technician assigned' : 'Waiting for assignment',
        time: item.technicianName || 'Pending',
        tone: item.technicianId ? 'success' : 'warning',
      },
      {
        title: item.completedAt ? 'Completed' : 'Completion pending',
        time: this.formatDate(item.completedAt),
        tone: item.completedAt ? 'success' : 'warning',
      },
    ];
  });

  get drawerTitle(): string {
    if (this.drawerMode() === 'create') return 'Create Work Order';
    if (this.drawerMode() === 'edit') return 'Update Work Order';
    return this.selected()?.title || 'Work Order';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'create') return 'New Work Order';
    if (this.drawerMode() === 'edit') return 'Edit Work Order';
    return this.selected()?.workOrderCode || '';
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  async loadPageData(): Promise<void> {
    try {
      this.loading.set(true);

      const [workOrders, technicians] = await Promise.all([
        firstValueFrom(this.workOrderService.getAll()),
        firstValueFrom(this.technicianService.getAll()),
      ]);

      this.workOrders.set(workOrders ?? []);
      this.technicians.set(technicians ?? []);
    } catch (error) {
      console.error('Failed to load work orders:', error);
      this.workOrders.set([]);
      this.technicians.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  itemsByStatus(status: WorkOrderStatus): WorkOrder[] {
    const query = this.search().toLowerCase().trim();

    return this.workOrders().filter((item) => {
      const matchesStatus = item.status === status;
      const matchesSearch =
        !query ||
        item.workOrderCode?.toLowerCase().includes(query) ||
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.technicianName?.toLowerCase().includes(query) ||
        String(item.ticketId).includes(query) ||
        String(item.alertId).includes(query);

      return matchesStatus && matchesSearch;
    });
  }

  openCreate(): void {
    this.form = this.emptyDraft();
    this.selected.set(null);
    this.drawerMode.set('create');
    this.drawerOpen.set(true);
  }

  openWorkOrder(item: WorkOrder): void {
    this.selected.set(item);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  editWorkOrder(): void {
    const item = this.selected();
    if (!item) return;

    this.form = this.toPayload(item);
    this.drawerMode.set('edit');
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selected.set(null);
    this.form = this.emptyDraft();
  }

  async onDrop(event: CdkDragDrop<WorkOrder[]>, target: WorkOrderStatus): Promise<void> {
    const item = event.item.data as WorkOrder;

    if (event.previousContainer === event.container || item.status === target) {
      return;
    }

    if ((target === 'ASSIGNED' || target === 'SCHEDULED') && !item.technicianId) {
      this.pendingMove.set({ item, target });
      this.selectedTechnicianId = 0;
      this.assignDrawerOpen.set(true);
      return;
    }

    if (target === 'CLOSED' && item.status !== 'VERIFIED') {
      return;
    }

    await this.updateWorkOrder(item, { status: target });
  }

  async assignAndMove(): Promise<void> {
    const move = this.pendingMove();

    if (!move || !this.selectedTechnicianId || this.saving()) {
      return;
    }

    await this.updateWorkOrder(move.item, {
      technicianId: this.selectedTechnicianId,
      status: move.target,
    });

    this.assignDrawerOpen.set(false);
    this.pendingMove.set(null);
    this.selectedTechnicianId = 0;
  }

  async saveWorkOrder(): Promise<void> {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.workOrderCode || !payload.title) return;

    try {
      this.saving.set(true);

      if (this.drawerMode() === 'edit') {
        const selected = this.selected();
        if (!selected) return;

        await firstValueFrom(this.workOrderService.update(selected.id, payload));
      } else {
        await firstValueFrom(this.workOrderService.create(payload));
      }

      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to save work order:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteWorkOrder(): Promise<void> {
    const item = this.selected();

    if (!item || this.saving()) return;

    try {
      this.saving.set(true);
      await firstValueFrom(this.workOrderService.delete(item.id));
      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to delete work order:', error);
    } finally {
      this.saving.set(false);
    }
  }

async updateWorkOrder(
  item: WorkOrder,
  patch: Partial<WorkOrderForm>,
): Promise<void> {
  try {
    this.saving.set(true);

    const draft: WorkOrderForm = {
      ...this.toPayload(item),
      ...patch,
    };

    const payload: WorkOrderPayload = {
      ...draft,
      scheduledAt: this.toIso(draft.scheduledAt),
      startedAt: this.toIso(draft.startedAt),
      completedAt: this.toIso(draft.completedAt),
    };

    await firstValueFrom(this.workOrderService.update(item.id, payload));
    await this.loadPageData();

    const selected = this.selected();
    if (selected?.id === item.id) {
      const latest = this.workOrders().find((wo) => wo.id === item.id) ?? null;
      this.selected.set(latest);
    }
  } catch (error) {
    console.error('Failed to update work order:', error);
  } finally {
    this.saving.set(false);
  }
}

  technicianLabel(technicianId: number): string {
    const tech = this.technicians().find((item) => item.id === technicianId);
    return tech ? `${tech.technicianCode} · ${tech.firstName} ${tech.lastName}` : 'Unassigned';
  }

  formatDate(value: string): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  statusTone(status: WorkOrderStatus): 'success' | 'warning' | 'danger' | 'info' | 'muted' {
    if (status === 'CREATED') return 'info';
    if (status === 'ASSIGNED' || status === 'SCHEDULED' || status === 'IN_PROGRESS') return 'warning';
    if (status === 'COMPLETED' || status === 'VERIFIED' || status === 'CLOSED') return 'success';
    if (status === 'CANCELLED') return 'danger';
    return 'muted';
  }

  private toPayload(item: WorkOrder): WorkOrderForm {
  return {
    workOrderCode: item.workOrderCode,
    ticketId: item.ticketId,
    alertId: item.alertId,
    technicianId: item.technicianId,
    title: item.title,
    description: item.description,
    status: item.status,
    scheduledAt: this.toDate(item.scheduledAt),
    startedAt: this.toDate(item.startedAt),
    completedAt: this.toDate(item.completedAt),
    resolution: item.resolution,
    laborHours: item.laborHours,
    remarks: item.remarks,
  };
}

private normalizePayload(): WorkOrderPayload {
  return {
    workOrderCode: this.form.workOrderCode.trim(),
    ticketId: Number(this.form.ticketId || 0),
    alertId: Number(this.form.alertId || 0),
    technicianId: Number(this.form.technicianId || 0),
    title: this.form.title.trim(),
    description: this.form.description.trim(),
    status: this.form.status,
    scheduledAt: this.toIso(this.form.scheduledAt),
    startedAt: this.toIso(this.form.startedAt),
    completedAt: this.toIso(this.form.completedAt),
    resolution: this.form.resolution.trim(),
    laborHours: Number(this.form.laborHours || 0),
    remarks: this.form.remarks.trim(),
  };
}

private toDate(value: string): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

private toIso(value: Date | string | null): string {
  if (!value) return '';

  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

private emptyDraft(): WorkOrderForm {
  return {
    workOrderCode: '',
    ticketId: 0,
    alertId: 0,
    technicianId: 0,
    title: '',
    description: '',
    status: 'CREATED',
    scheduledAt: null,
    startedAt: null,
    completedAt: null,
    resolution: '',
    laborHours: 0,
    remarks: '',
  };
}
}