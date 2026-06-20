import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { NotificationService } from '../../core/services/notification.service';

type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

type Engineer = {
  id: string;
  name: string;
  role: string;
  zone: string;
  available: boolean;
};

type WorkOrder = {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  siteName: string;
  siteType: 'tower' | 'building' | 'warehouse';
  assetName: string;
  location: string;
  createdAt: string;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  checklist: string[];
  timeline: {
    title: string;
    time: string;
    description: string;
  }[];
};

type KanbanColumn = {
  id: TicketStatus;
  title: string;
  subtitle: string;
};

@Component({
  selector: 'to-work-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ButtonModule,
    DialogModule,
    DrawerModule,
    SelectModule,
    TagModule,
  ],
  templateUrl: './work-orders.html',
  styleUrl: './work-orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrdersComponent {
  readonly columns: KanbanColumn[] = [
    {
      id: 'open',
      title: 'Open',
      subtitle: 'New tickets',
    },
    {
      id: 'assigned',
      title: 'Assigned',
      subtitle: 'Engineer allocated',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      subtitle: 'Field work active',
    },
    {
      id: 'resolved',
      title: 'Resolved',
      subtitle: 'Waiting verification',
    },
    {
      id: 'closed',
      title: 'Closed',
      subtitle: 'Verified and closed',
    },
  ];

  readonly engineers: Engineer[] = [
    {
      id: 'eng-001',
      name: 'Mohammed Khan',
      role: 'Power Systems',
      zone: 'Sharjah',
      available: true,
    },
    {
      id: 'eng-002',
      name: 'Saleh Al Ali',
      role: 'RF & Signal',
      zone: 'Dubai',
      available: true,
    },
    {
      id: 'eng-003',
      name: 'Rajesh Kumar',
      role: 'HVAC',
      zone: 'Abu Dhabi',
      available: false,
    },
    {
      id: 'eng-004',
      name: 'Priya Sharma',
      role: 'Generator & Fuel',
      zone: 'Ajman',
      available: true,
    },
  ];

  readonly engineerOptions = this.engineers.map((engineer) => ({
    label: `${engineer.name} · ${engineer.role}`,
    value: engineer.id,
    disabled: !engineer.available,
  }));

  readonly tickets = signal<WorkOrder[]>([
    {
      id: 'WO-001',
      title: 'Power failure detected',
      description: 'Mains power outage detected. Site is running on backup battery.',
      priority: 'critical',
      status: 'open',
      siteName: 'Tower Sharjah 01',
      siteType: 'tower',
      assetName: 'Power Unit',
      location: 'Industrial Area, Sharjah',
      createdAt: '2 min ago',
      checklist: ['Verify grid input', 'Check battery backup', 'Inspect power panel'],
      timeline: [
        {
          title: 'Ticket created',
          time: '2 min ago',
          description: 'Created automatically from critical power alarm.',
        },
      ],
    },
    {
      id: 'WO-002',
      title: 'Receiver offline',
      description: 'Receiver stopped sending telemetry packets.',
      priority: 'high',
      status: 'assigned',
      siteName: 'Tower Sharjah 01',
      siteType: 'tower',
      assetName: 'Receiver',
      location: 'Industrial Area, Sharjah',
      createdAt: '18 min ago',
      assignedEngineerId: 'eng-002',
      assignedEngineerName: 'Saleh Al Ali',
      checklist: ['Check receiver heartbeat', 'Validate RF link', 'Restart device'],
      timeline: [
        {
          title: 'Assigned',
          time: '12 min ago',
          description: 'Assigned to Saleh Al Ali.',
        },
      ],
    },
    {
      id: 'WO-003',
      title: 'HVAC load high',
      description: 'Building HVAC load crossed threshold.',
      priority: 'medium',
      status: 'in_progress',
      siteName: 'Abu Dhabi Regional Hub',
      siteType: 'building',
      assetName: 'HVAC Controller',
      location: 'Al Zahiyah, Abu Dhabi',
      createdAt: '35 min ago',
      assignedEngineerId: 'eng-003',
      assignedEngineerName: 'Rajesh Kumar',
      checklist: ['Inspect compressor', 'Check room temperature', 'Verify airflow'],
      timeline: [
        {
          title: 'Work started',
          time: '10 min ago',
          description: 'Engineer started field inspection.',
        },
      ],
    },
    {
      id: 'WO-004',
      title: 'Door sensor fault',
      description: 'Warehouse Zone B door sensor is intermittently failing.',
      priority: 'high',
      status: 'resolved',
      siteName: 'Abu Dhabi Equipment Warehouse',
      siteType: 'warehouse',
      assetName: 'Door Sensor',
      location: 'Mussafah, Abu Dhabi',
      createdAt: '1 hr ago',
      assignedEngineerId: 'eng-004',
      assignedEngineerName: 'Priya Sharma',
      checklist: ['Replace sensor module', 'Test door events', 'Confirm telemetry'],
      timeline: [
        {
          title: 'Resolved',
          time: '8 min ago',
          description: 'Sensor module replaced. Awaiting NOC verification.',
        },
      ],
    },
  ]);

  selectedTicket = signal<WorkOrder | null>(null);

  assignDialogOpen = signal(false);
  pendingTicket = signal<WorkOrder | null>(null);
  pendingTargetStatus = signal<TicketStatus | null>(null);
  selectedEngineerId = signal<string | null>(null);

  readonly connectedLists = this.columns.map((column) => column.id);

  columnTickets(status: TicketStatus): WorkOrder[] {
    return this.tickets().filter((ticket) => ticket.status === status);
  }

  summary = computed(() => ({
    total: this.tickets().length,
    open: this.tickets().filter((ticket) => ticket.status === 'open').length,
    assigned: this.tickets().filter((ticket) => ticket.status === 'assigned').length,
    active: this.tickets().filter((ticket) => ticket.status === 'in_progress').length,
    resolved: this.tickets().filter((ticket) => ticket.status === 'resolved').length,
  }));

  onDrop(event: CdkDragDrop<WorkOrder[]>, targetStatus: TicketStatus): void {
    const ticket = event.previousContainer.data[event.previousIndex];

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    if (!this.canMove(ticket, targetStatus)) {
      return;
    }

    if (targetStatus === 'assigned' && !ticket.assignedEngineerId) {
      this.pendingTicket.set(ticket);
      this.pendingTargetStatus.set(targetStatus);
      this.selectedEngineerId.set(null);
      this.assignDialogOpen.set(true);
      return;
    }

    this.updateTicketStatus(ticket.id, targetStatus);

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  canMove(ticket: WorkOrder, targetStatus: TicketStatus): boolean {
    if (targetStatus === 'in_progress' && !ticket.assignedEngineerId) {
      this.pendingTicket.set(ticket);
      this.pendingTargetStatus.set('assigned');
      this.selectedEngineerId.set(null);
      this.assignDialogOpen.set(true);
      return false;
    }

    if (targetStatus === 'resolved' && ticket.status !== 'in_progress') {
      alert('Ticket must be in progress before it can be resolved.');
      return false;
    }

    if (targetStatus === 'closed' && ticket.status !== 'resolved') {
      alert('Ticket must be resolved before it can be closed.');
      return false;
    }

    return true;
  }

  assignEngineer(): void {
    const ticket = this.pendingTicket();
    const targetStatus = this.pendingTargetStatus();
    const engineerId = this.selectedEngineerId();

    if (!ticket || !targetStatus || !engineerId) {
      return;
    }

    const engineer = this.engineers.find((item) => item.id === engineerId);

    if (!engineer) {
      return;
    }

    this.tickets.update((tickets) =>
      tickets.map((item) =>
        item.id === ticket.id
          ? {
              ...item,
              status: targetStatus,
              assignedEngineerId: engineer.id,
              assignedEngineerName: engineer.name,
              timeline: [
                {
                  title: 'Engineer assigned',
                  time: 'Just now',
                  description: `Assigned to ${engineer.name}.`,
                },
                ...item.timeline,
              ],
            }
          : item
      )
    );

    this.assignDialogOpen.set(false);
    this.pendingTicket.set(null);
    this.pendingTargetStatus.set(null);
    this.selectedEngineerId.set(null);
  }

  updateTicketStatus(ticketId: string, status: TicketStatus): void {
    this.tickets.update((tickets) =>
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status,
              timeline: [
                {
                  title: `Moved to ${this.statusLabel(status)}`,
                  time: 'Just now',
                  description: `Ticket status changed to ${this.statusLabel(status)}.`,
                },
                ...ticket.timeline,
              ],
            }
          : ticket
      )
    );
  }

  openDetails(ticket: WorkOrder): void {
    this.selectedTicket.set(ticket);
  }

  closeDetails(): void {
    this.selectedTicket.set(null);
  }

  statusLabel(status: TicketStatus): string {
    return this.columns.find((column) => column.id === status)?.title ?? status;
  }

  prioritySeverity(priority: TicketPriority): 'success' | 'warn' | 'danger' | 'secondary' {
    if (priority === 'critical' || priority === 'high') return 'danger';
    if (priority === 'medium') return 'warn';
    return 'secondary';
  }

  statusSeverity(status: TicketStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'closed' || status === 'resolved') return 'success';
    if (status === 'assigned' || status === 'in_progress') return 'warn';
    if (status === 'open') return 'danger';
    return 'secondary';
  }

  siteIcon(siteType: WorkOrder['siteType']): string {
    const icons = {
      tower: 'fa-solid fa-tower-cell',
      building: 'fa-solid fa-building',
      warehouse: 'fa-solid fa-warehouse',
    };

    return icons[siteType];
  }
}