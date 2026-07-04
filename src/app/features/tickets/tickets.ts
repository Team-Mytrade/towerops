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

import { AuthService } from '../../core/services/auth.service';
import {
  Ticket,
  TicketPayload,
  TicketService,
  TicketSeverity,
  TicketStatus,
} from '../../core/services/ticket.service';
import { User, UserService } from '../../core/services/user.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { Timeline, TimelineItem } from '../../shared/ui/timeline/timeline';

type DrawerMode = 'view' | 'create' | 'assign' | 'transition' | 'resolve';

@Component({
  selector: 'to-tickets',
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
  templateUrl: './tickets.html',
  styleUrl: './tickets.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tickets implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly severityFilter = signal<'All' | TicketSeverity>('All');
  readonly statusFilter = signal<'All' | TicketStatus>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selectedTicket = signal<Ticket | null>(null);

  readonly tickets = signal<Ticket[]>([]);
  readonly users = signal<User[]>([]);

  ticketForm: TicketPayload = this.emptyTicketDraft();

  assignForm = {
    userId: 0,
    userName: '',
  };

  transitionForm = {
    targetStatus: 'IN_PROGRESS' as TicketStatus,
    remarks: '',
  };

  resolveForm = {
    notes: '',
  };

  readonly severityOptions = [
    { label: 'All Severity', value: 'All' },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
  ];

  readonly ticketSeverityOptions = this.severityOptions.slice(1);

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Open', value: 'OPEN' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  readonly ticketStatusOptions = this.statusOptions.slice(1);

  readonly userOptions = computed(() =>
    this.users().map((user) => ({
      label: `${user.userCode} · ${user.username}`,
      value: user.id,
      username: user.username,
    })),
  );

  readonly filteredTickets = computed(() => {
    const query = this.search().toLowerCase().trim();
    const severity = this.severityFilter();
    const status = this.statusFilter();

    return this.tickets().filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.ticketNumber?.toLowerCase().includes(query) ||
        ticket.title?.toLowerCase().includes(query) ||
        ticket.deviceId?.toLowerCase().includes(query) ||
        ticket.siteCode?.toLowerCase().includes(query) ||
        ticket.assignedUserName?.toLowerCase().includes(query);

      const matchesSeverity = severity === 'All' || ticket.severity === severity;
      const matchesStatus = status === 'All' || ticket.status === status;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  });

  readonly timeline = computed<TimelineItem[]>(() => {
    const ticket = this.selectedTicket();

    if (!ticket) {
      return [];
    }

    return [
      {
        title: 'Ticket created',
        description: ticket.description || 'Ticket created from alert/manual entry.',
        time: ticket.ticketNumber || `TCK-${ticket.id}`,
        tone: 'info',
      },
      {
        title: ticket.assignedUserId ? 'Assigned' : 'Waiting for assignment',
        description: ticket.assignedUserName || 'No user assigned yet.',
        time: ticket.assignedUserId ? 'Done' : 'Pending',
        tone: ticket.assignedUserId ? 'success' : 'warning',
      },
      {
        title: ticket.acknowledgedAt ? 'Acknowledged' : 'Acknowledgement pending',
        description: ticket.acknowledgedAt ? 'Ticket has been acknowledged.' : ticket.status,
        time: ticket.acknowledgedAt ? this.formatDate(ticket.acknowledgedAt) : 'Pending',
        tone: ticket.acknowledgedAt ? 'success' : 'warning',
      },
      {
        title: ticket.resolvedAt ? 'Resolved' : 'Resolution pending',
        description: ticket.resolvedAt ? 'Ticket has been resolved.' : ticket.status,
        time: ticket.resolvedAt ? this.formatDate(ticket.resolvedAt) : 'Pending',
        tone: ticket.resolvedAt ? 'success' : 'warning',
      },
    ];
  });

  get drawerTitle(): string {
    if (this.drawerMode() === 'create') return 'Create Ticket';
    if (this.drawerMode() === 'assign') return 'Assign Ticket';
    if (this.drawerMode() === 'transition') return 'Transition Ticket';
    if (this.drawerMode() === 'resolve') return 'Resolve Ticket';

    return this.selectedTicket()?.title ?? 'Ticket Details';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'create') return 'Manual Ticket';

    const ticket = this.selectedTicket();
    return ticket?.ticketNumber || (ticket?.id ? `TCK-${ticket.id}` : '');
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

      const [ticketsRes, usersRes] = await Promise.all([
        firstValueFrom(this.ticketService.getAll()),
        firstValueFrom(this.userService.getAll()),
      ]);

      this.tickets.set(ticketsRes.data ?? []);
      this.users.set(usersRes.data ?? []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      this.tickets.set([]);
      this.users.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadTicketsByStatus(status: TicketStatus): Promise<void> {
    try {
      this.loading.set(true);
      const response = await firstValueFrom(this.ticketService.getByStatus(status));
      this.tickets.set(response.data ?? []);
      this.statusFilter.set(status);
    } catch (error) {
      console.error('Failed to load tickets by status:', error);
      this.tickets.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openCreateTicket(): void {
    this.ticketForm = this.emptyTicketDraft();
    this.selectedTicket.set(null);
    this.drawerMode.set('create');
    this.drawerOpen.set(true);
  }

  openTicket(ticket: Ticket): void {
    this.selectedTicket.set(ticket);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  openAssign(): void {
    const ticket = this.selectedTicket();

    if (!ticket) {
      return;
    }

    this.assignForm = {
      userId: ticket.assignedUserId || 0,
      userName: ticket.assignedUserName || '',
    };

    this.drawerMode.set('assign');
  }

  openTransition(): void {
    this.transitionForm = {
      targetStatus: 'IN_PROGRESS',
      remarks: '',
    };

    this.drawerMode.set('transition');
  }

  openResolve(): void {
    this.resolveForm = {
      notes: '',
    };

    this.drawerMode.set('resolve');
  }

  onAssignUserChange(userId: number): void {
    const user = this.users().find((item) => item.id === userId);

    this.assignForm = {
      userId,
      userName: user?.username ?? '',
    };
  }

  onTicketAssigneeChange(userId: number): void {
    const user = this.users().find((item) => item.id === userId);

    this.ticketForm.assignedUserId = userId || 0;
    this.ticketForm.assignedUserName = user?.username ?? '';
  }

  async createTicket(): Promise<void> {
    if (this.saving()) {
      return;
    }

    const payload = this.normalizePayload();

    if (!payload.title || !payload.deviceId || !payload.siteCode) {
      return;
    }

    try {
      this.saving.set(true);

      await firstValueFrom(this.ticketService.create(payload));
      await this.loadPageData();

      this.closeDrawer();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async assignTicket(): Promise<void> {
    const ticket = this.selectedTicket();

    if (!ticket || !this.assignForm.userId || this.saving()) {
      return;
    }

    try {
      this.saving.set(true);

      const response = await firstValueFrom(
        this.ticketService.assign(
          ticket.id,
          this.assignForm.userId,
          this.assignForm.userName,
        ),
      );

      this.selectedTicket.set(response.data);
      await this.loadPageData();

      this.drawerMode.set('view');
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async acknowledgeTicket(): Promise<void> {
    const ticket = this.selectedTicket();

    if (!ticket || this.saving()) {
      return;
    }

    try {
      this.saving.set(true);

      const response = await firstValueFrom(
        this.ticketService.acknowledge(ticket.id),
      );

      this.selectedTicket.set(response.data);
      await this.loadPageData();
    } catch (error) {
      console.error('Failed to acknowledge ticket:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async transitionTicket(): Promise<void> {
    const ticket = this.selectedTicket();

    if (!ticket || this.saving()) {
      return;
    }

    try {
      this.saving.set(true);

      await firstValueFrom(
        this.ticketService.transition(
          ticket.id,
          this.transitionForm.targetStatus,
          this.transitionForm.remarks,
        ),
      );

      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to transition ticket:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async resolveTicket(): Promise<void> {
    const ticket = this.selectedTicket();

    if (!ticket || !this.resolveForm.notes || this.saving()) {
      return;
    }

    try {
      this.saving.set(true);

      const response = await firstValueFrom(
        this.ticketService.resolve(ticket.id, this.resolveForm.notes),
      );

      this.selectedTicket.set(response.data);
      await this.loadPageData();

      this.drawerMode.set('view');
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteTicket(): Promise<void> {
    const ticket = this.selectedTicket();

    if (!ticket || this.saving()) {
      return;
    }

    try {
      this.saving.set(true);

      await firstValueFrom(this.ticketService.delete(ticket.id));
      await this.loadPageData();

      this.closeDrawer();
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    } finally {
      this.saving.set(false);
    }
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selectedTicket.set(null);
    this.ticketForm = this.emptyTicketDraft();
    this.assignForm = {
      userId: 0,
      userName: '',
    };
    this.transitionForm = {
      targetStatus: 'IN_PROGRESS',
      remarks: '',
    };
    this.resolveForm = {
      notes: '',
    };
  }

  severityTone(severity: TicketSeverity): 'danger' | 'warning' | 'info' {
    if (severity === 'CRITICAL' || severity === 'HIGH') return 'danger';
    if (severity === 'MEDIUM') return 'warning';
    return 'info';
  }

  statusTone(status: TicketStatus): 'success' | 'warning' | 'danger' | 'info' | 'muted' {
    if (status === 'OPEN' || status === 'REJECTED') return 'danger';
    if (status === 'ASSIGNED' || status === 'ACKNOWLEDGED') return 'info';
    if (status === 'IN_PROGRESS') return 'warning';

    if (status === 'RESOLVED' || status === 'CONFIRMED' || status === 'CLOSED') {
      return 'success';
    }

    return 'muted';
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  private normalizePayload(): TicketPayload {
    return {
      alarmId: Number(this.ticketForm.alarmId || 0),
      deviceId: this.ticketForm.deviceId.trim(),
      tenantId: this.ticketForm.tenantId || this.auth.getTenantId() || 'DEFAULT',
      siteCode: this.ticketForm.siteCode.trim(),
      ruleId: Number(this.ticketForm.ruleId || 0),
      title: this.ticketForm.title.trim(),
      description: this.ticketForm.description.trim(),
      severity: this.ticketForm.severity,
      assignedUserId: Number(this.ticketForm.assignedUserId || 0),
      assignedUserName: this.ticketForm.assignedUserName.trim(),
    };
  }

  private emptyTicketDraft(): TicketPayload {
    return {
      alarmId: 0,
      deviceId: '',
      tenantId: this.auth.getTenantId() || 'DEFAULT',
      siteCode: '',
      ruleId: 0,
      title: '',
      description: '',
      severity: 'LOW',
      assignedUserId: 0,
      assignedUserName: '',
    };
  }
}