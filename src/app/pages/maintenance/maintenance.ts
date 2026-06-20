import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableColumn } from '../../shared/components/data-table/data-table.types';


type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue';
type MaintenanceType = 'preventive' | 'corrective' | 'inspection' | 'emergency';
type SiteType = 'tower' | 'building' | 'warehouse';

type MaintenanceTicket = {
  id: string;
  title: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  siteType: SiteType;
  siteName: string;
  assetName: string;
  location: string;
  scheduledDate: string;
  technician: string;
  estimatedHours: number;
  description: string;
  checklist: string[];
  history: { title: string; time: string; description: string }[];
};

@Component({
  selector: 'to-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DrawerModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DataTable,
  ],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceComponent {
  search = signal('');
  status = signal<'all' | MaintenanceStatus>('all');
  type = signal<'all' | MaintenanceType>('all');
  siteType = signal<'all' | SiteType>('all');

  selectedTicket = signal<MaintenanceTicket | null>(null);

  readonly statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Overdue', value: 'overdue' },
  ];

  readonly typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Preventive', value: 'preventive' },
    { label: 'Corrective', value: 'corrective' },
    { label: 'Inspection', value: 'inspection' },
    { label: 'Emergency', value: 'emergency' },
  ];

  readonly siteTypeOptions = [
    { label: 'All Sites', value: 'all' },
    { label: 'Tower', value: 'tower' },
    { label: 'Building', value: 'building' },
    { label: 'Warehouse', value: 'warehouse' },
  ];

  readonly columns: DataTableColumn<MaintenanceTicket>[] = [
    { field: 'id', header: 'Ticket ID', type: 'mono', width: '120px' },
    { field: 'title', header: 'Maintenance' },
    { field: 'type', header: 'Type', type: 'tag', width: '130px' },
    { field: 'status', header: 'Status', type: 'tag', width: '140px' },
    { field: 'priority', header: 'Priority', type: 'tag', width: '130px' },
    { field: 'siteName', header: 'Site' },
    { field: 'assetName', header: 'Asset' },
    { field: 'scheduledDate', header: 'Scheduled', type: 'date', width: '140px' },
    { field: 'technician', header: 'Technician' },
  ];

  readonly tickets = signal<MaintenanceTicket[]>([
    {
      id: 'MT-001',
      title: 'Quarterly Battery Inspection',
      type: 'preventive',
      status: 'scheduled',
      priority: 'medium',
      siteType: 'tower',
      siteName: 'Tower Sharjah 01',
      assetName: 'Battery Bank',
      location: 'Industrial Area, Sharjah',
      scheduledDate: '2026-06-24',
      technician: 'Mohammed Khan',
      estimatedHours: 2,
      description: 'Routine battery health check and backup capacity verification.',
      checklist: ['Inspect terminals', 'Check voltage', 'Run backup test', 'Upload report'],
      history: [
        {
          title: 'Maintenance scheduled',
          time: 'Today',
          description: 'Preventive maintenance created by NOC planner.',
        },
      ],
    },
    {
      id: 'MT-002',
      title: 'HVAC Compressor Service',
      type: 'corrective',
      status: 'in_progress',
      priority: 'high',
      siteType: 'building',
      siteName: 'Abu Dhabi Regional Hub',
      assetName: 'HVAC Controller',
      location: 'Al Zahiyah, Abu Dhabi',
      scheduledDate: '2026-06-21',
      technician: 'Rajesh Kumar',
      estimatedHours: 4,
      description: 'HVAC load is high. Compressor and airflow need inspection.',
      checklist: ['Inspect compressor', 'Check filter', 'Verify airflow', 'Record temperature'],
      history: [
        {
          title: 'Work started',
          time: '35 min ago',
          description: 'Technician started field inspection.',
        },
      ],
    },
    {
      id: 'MT-003',
      title: 'Door Sensor Replacement',
      type: 'emergency',
      status: 'overdue',
      priority: 'critical',
      siteType: 'warehouse',
      siteName: 'Abu Dhabi Equipment Warehouse',
      assetName: 'Door Sensor',
      location: 'Mussafah, Abu Dhabi',
      scheduledDate: '2026-06-18',
      technician: 'Priya Sharma',
      estimatedHours: 1.5,
      description: 'Zone B door sensor is failing intermittently and needs replacement.',
      checklist: ['Remove faulty sensor', 'Install new sensor', 'Test open events', 'Verify telemetry'],
      history: [
        {
          title: 'Overdue',
          time: '2 days ago',
          description: 'Ticket crossed scheduled maintenance window.',
        },
      ],
    },
    {
      id: 'MT-004',
      title: 'Generator Fuel Filter Replacement',
      type: 'preventive',
      status: 'completed',
      priority: 'low',
      siteType: 'tower',
      siteName: 'Tower Dubai 02',
      assetName: 'Generator',
      location: 'Business Bay, Dubai',
      scheduledDate: '2026-06-19',
      technician: 'Saleh Al Ali',
      estimatedHours: 2,
      description: 'Routine generator fuel filter replacement completed.',
      checklist: ['Stop generator', 'Replace filter', 'Restart generator', 'Confirm standby state'],
      history: [
        {
          title: 'Completed',
          time: '2 days ago',
          description: 'Maintenance closed after NOC verification.',
        },
      ],
    },
  ]);

  readonly filteredTickets = computed(() => {
    const q = this.search().trim().toLowerCase();

    return this.tickets().filter((ticket) => {
      const matchesSearch =
        !q ||
        ticket.id.toLowerCase().includes(q) ||
        ticket.title.toLowerCase().includes(q) ||
        ticket.siteName.toLowerCase().includes(q) ||
        ticket.assetName.toLowerCase().includes(q) ||
        ticket.technician.toLowerCase().includes(q);

      const matchesStatus =
        this.status() === 'all' || ticket.status === this.status();

      const matchesType =
        this.type() === 'all' || ticket.type === this.type();

      const matchesSite =
        this.siteType() === 'all' || ticket.siteType === this.siteType();

      return matchesSearch && matchesStatus && matchesType && matchesSite;
    });
  });

  readonly summary = computed(() => ({
    total: this.tickets().length,
    scheduled: this.tickets().filter((t) => t.status === 'scheduled').length,
    progress: this.tickets().filter((t) => t.status === 'in_progress').length,
    overdue: this.tickets().filter((t) => t.status === 'overdue').length,
    completed: this.tickets().filter((t) => t.status === 'completed').length,
  }));

  openTicket(ticket: MaintenanceTicket): void {
    this.selectedTicket.set(ticket);
  }

  closeDrawer(): void {
    this.selectedTicket.set(null);
  }

  clearFilters(): void {
    this.search.set('');
    this.status.set('all');
    this.type.set('all');
    this.siteType.set('all');
  }

  severity(value: string): 'success' | 'warn' | 'danger' | 'secondary' {
    if (['completed', 'low'].includes(value)) return 'success';
    if (['scheduled', 'in_progress', 'medium', 'high'].includes(value)) return 'warn';
    if (['overdue', 'critical', 'emergency'].includes(value)) return 'danger';
    return 'secondary';
  }
}