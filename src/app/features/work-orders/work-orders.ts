import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

import {
  WorkOrder,
  WorkOrderPayload,
  WorkOrderStatus,
} from '../../core/services/work-order.service';
import { Technician } from '../../core/services/technician.service';

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

const STORAGE_KEYS = {
  workOrders: 'towerops_work_orders',
  technicians: 'towerops_technicians',
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
    DatePickerModule,
  ],
  templateUrl: './work-orders.html',
  styleUrl: './work-orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrders implements OnInit {
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selected = signal<WorkOrder | null>(null);

  readonly assignDrawerOpen = signal(false);
  readonly pendingMove = signal<{
    item: WorkOrder;
    target: WorkOrderStatus;
  } | null>(null);

  selectedTechnicianId = 0;

  readonly workOrders = signal<WorkOrder[]>([]);
  readonly technicians = signal<Technician[]>([]);

  form: WorkOrderForm = this.emptyDraft();

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
      {
        title: 'Work order created',
        time: item.workOrderCode,
        tone: 'info',
      },
      {
        title: item.technicianId
          ? 'Technician assigned'
          : 'Waiting for assignment',
        time: item.technicianName || 'Pending',
        tone: item.technicianId ? 'success' : 'warning',
      },
      {
        title: item.startedAt ? 'Work started' : 'Start pending',
        time: this.formatDate(item.startedAt),
        tone: item.startedAt ? 'info' : 'warning',
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

  loadPageData(): void {
    this.loading.set(true);

    this.seedLocalStorageIfEmpty();

    this.workOrders.set(
      this.readStorage<WorkOrder[]>(STORAGE_KEYS.workOrders, []),
    );

    this.technicians.set(
      this.readStorage<Technician[]>(STORAGE_KEYS.technicians, []),
    );

    this.loading.set(false);
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

  onDrop(event: CdkDragDrop<WorkOrder[]>, target: WorkOrderStatus): void {
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

    this.updateWorkOrder(item, { status: target });
  }

  assignAndMove(): void {
    const move = this.pendingMove();

    if (!move || !this.selectedTechnicianId || this.saving()) return;

    this.updateWorkOrder(move.item, {
      technicianId: this.selectedTechnicianId,
      status: move.target,
    });

    this.assignDrawerOpen.set(false);
    this.pendingMove.set(null);
    this.selectedTechnicianId = 0;
  }

  saveWorkOrder(): void {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.workOrderCode || !payload.title) return;

    this.saving.set(true);

    const items = [...this.workOrders()];

    if (this.drawerMode() === 'edit') {
      const selected = this.selected();
      if (!selected) {
        this.saving.set(false);
        return;
      }

      const index = items.findIndex((item) => item.id === selected.id);

      if (index > -1) {
        const updated = {
          ...items[index],
          ...payload,
          technicianName: this.getTechnicianName(payload.technicianId),
          updatedAt: new Date().toISOString(),
        } as WorkOrder;

        items[index] = updated;
        this.selected.set(updated);
      }
    } else {
      const newItem = {
        id: this.nextId(items),
        ...payload,
        ...this.getTechnicianInfo(payload.technicianId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

      } as WorkOrder;

      items.unshift(newItem);
    }

    this.workOrders.set(items);
    this.writeStorage(STORAGE_KEYS.workOrders, items);

    this.saving.set(false);
    this.closeDrawer();
  }
  private getTechnicianInfo(technicianId: number): {
    technicianCode: string;
    technicianName: string;
  } {
    if (!technicianId) {
      return {
        technicianCode: '',
        technicianName: '',
      };
    }

    const tech = this.technicians().find((item) => item.id === technicianId);

    return {
      technicianCode: tech?.technicianCode ?? '',
      technicianName: tech ? `${tech.firstName} ${tech.lastName}` : '',
    };
  }
  deleteWorkOrder(): void {
    const item = this.selected();

    if (!item || this.saving()) return;

    this.saving.set(true);

    const items = this.workOrders().filter((workOrder) => workOrder.id !== item.id);

    this.workOrders.set(items);
    this.writeStorage(STORAGE_KEYS.workOrders, items);

    this.saving.set(false);
    this.closeDrawer();
  }

  updateWorkOrder(item: WorkOrder, patch: Partial<WorkOrderForm>): void {
    if (this.saving()) return;

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

    const items = this.workOrders().map((workOrder) => {
      if (workOrder.id !== item.id) return workOrder;

      return {
        ...workOrder,
        ...payload,
        technicianName: this.getTechnicianName(payload.technicianId),
        updatedAt: new Date().toISOString(),
      } as WorkOrder;
    });

    this.workOrders.set(items);
    this.writeStorage(STORAGE_KEYS.workOrders, items);

    const selected = this.selected();

    if (selected?.id === item.id) {
      this.selected.set(items.find((workOrder) => workOrder.id === item.id) ?? null);
    }

    this.saving.set(false);
  }

  technicianLabel(technicianId: number): string {
    const tech = this.technicians().find((item) => item.id === technicianId);

    return tech
      ? `${tech.technicianCode} · ${tech.firstName} ${tech.lastName}`
      : 'Unassigned';
  }

  formatDate(value: string): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  statusTone(
    status: WorkOrderStatus,
  ): 'success' | 'warning' | 'danger' | 'info' | 'muted' {
    if (status === 'CREATED') return 'info';
    if (
      status === 'ASSIGNED' ||
      status === 'SCHEDULED' ||
      status === 'IN_PROGRESS'
    ) {
      return 'warning';
    }

    if (
      status === 'COMPLETED' ||
      status === 'VERIFIED' ||
      status === 'CLOSED'
    ) {
      return 'success';
    }

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

  private emptyDraft(): WorkOrderForm {
    return {
      workOrderCode: this.generateWorkOrderCode(),
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

  private seedLocalStorageIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.technicians)) {
      this.writeStorage(STORAGE_KEYS.technicians, this.mockTechnicians());
    }

    if (!localStorage.getItem(STORAGE_KEYS.workOrders)) {
      this.writeStorage(STORAGE_KEYS.workOrders, this.mockWorkOrders());
    }
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
        userId: 11,
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
        userId: 12,
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
        userId: 13,
        username: 'faisal.rahman',
      },
    ];
  }

  private mockWorkOrders(): WorkOrder[] {
    return [
      {
        id: 1,
        workOrderCode: 'WO-0001',
        ticketId: 2001,
        alertId: 1001,
        technicianId: 0,
        technicianCode: '',
        technicianName: '',
        title: 'Signal Drop Investigation',
        description:
          'Inspect transmitter and receiver signal path at Business Bay Tower.',
        status: 'CREATED',
        scheduledAt: '',
        startedAt: '',
        completedAt: '',
        resolution: '',
        laborHours: 0,
        remarks: 'Created automatically from critical alarm.',
      },

      {
        id: 2,
        workOrderCode: 'WO-0002',
        ticketId: 2002,
        alertId: 1002,
        technicianId: 1,
        technicianCode: 'TECH-001',
        technicianName: 'Arun Kumar',
        title: 'Cabinet Temperature Inspection',
        description:
          'Verify cabinet cooling unit and inspect temperature sensor.',
        status: 'ASSIGNED',
        scheduledAt: new Date(
          Date.now() + 1000 * 60 * 60 * 2,
        ).toISOString(),
        startedAt: '',
        completedAt: '',
        resolution: '',
        laborHours: 0,
        remarks: 'Technician assigned.',
      },

      {
        id: 3,
        workOrderCode: 'WO-0003',
        ticketId: 2003,
        alertId: 1003,
        technicianId: 2,
        technicianCode: 'TECH-002',
        technicianName: 'Naveen Raj',
        title: 'Battery Controller Check',
        description:
          'Inspect battery backup controller and verify heartbeat packets.',
        status: 'IN_PROGRESS',
        scheduledAt: new Date(
          Date.now() - 1000 * 60 * 60,
        ).toISOString(),
        startedAt: new Date(
          Date.now() - 1000 * 60 * 20,
        ).toISOString(),
        completedAt: '',
        resolution: '',
        laborHours: 1.25,
        remarks: 'Technician is currently on-site.',
      },

      {
        id: 4,
        workOrderCode: 'WO-0004',
        ticketId: 2004,
        alertId: 1004,
        technicianId: 3,
        technicianCode: 'TECH-003',
        technicianName: 'Faisal Rahman',
        title: 'Gateway Latency Resolution',
        description:
          'Restart gateway service and verify telemetry communication.',
        status: 'COMPLETED',
        scheduledAt: new Date(
          Date.now() - 1000 * 60 * 60 * 6,
        ).toISOString(),
        startedAt: new Date(
          Date.now() - 1000 * 60 * 60 * 5,
        ).toISOString(),
        completedAt: new Date(
          Date.now() - 1000 * 60 * 60 * 4,
        ).toISOString(),
        resolution:
          'Gateway rebooted. Telemetry restored. Packet loss reduced to 0%.',
        laborHours: 2,
        remarks: 'Awaiting verification.',
      },

      {
        id: 5,
        workOrderCode: 'WO-0005',
        ticketId: 2005,
        alertId: 1005,
        technicianId: 3,
        technicianCode: 'TECH-003',
        technicianName: 'Faisal Rahman',
        title: 'Generator Fuel Sensor Calibration',
        description:
          'Calibrate generator fuel sensor after inaccurate level readings.',
        status: 'VERIFIED',
        scheduledAt: new Date(
          Date.now() - 1000 * 60 * 60 * 24,
        ).toISOString(),
        startedAt: new Date(
          Date.now() - 1000 * 60 * 60 * 23,
        ).toISOString(),
        completedAt: new Date(
          Date.now() - 1000 * 60 * 60 * 22,
        ).toISOString(),
        resolution:
          'Sensor recalibrated and validated successfully.',
        laborHours: 1.5,
        remarks: 'Ready to close.',
      },

      {
        id: 6,
        workOrderCode: 'WO-0006',
        ticketId: 2006,
        alertId: 1006,
        technicianId: 1,
        technicianCode: 'TECH-001',
        technicianName: 'Arun Kumar',
        title: 'Tower Power Supply Inspection',
        description:
          'Inspect UPS and AC mains after intermittent power failures.',
        status: 'CLOSED',
        scheduledAt: new Date(
          Date.now() - 1000 * 60 * 60 * 48,
        ).toISOString(),
        startedAt: new Date(
          Date.now() - 1000 * 60 * 60 * 47,
        ).toISOString(),
        completedAt: new Date(
          Date.now() - 1000 * 60 * 60 * 46,
        ).toISOString(),
        resolution:
          'Loose UPS input cable tightened. Power stabilized.',
        laborHours: 3,
        remarks: 'Closed by Operations Manager.',
      },
    ];
  }

  private generateWorkOrderCode(): string {
    const items = this.readStorage<WorkOrder[]>(STORAGE_KEYS.workOrders, []);
    const nextNumber = items.length + 1;

    return `WO-${String(nextNumber).padStart(4, '0')}`;
  }

  private getTechnicianName(technicianId: number): string {
    if (!technicianId) return '';

    const tech = this.technicians().find((item) => item.id === technicianId);

    return tech ? `${tech.firstName} ${tech.lastName}` : '';
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