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



type UserRole =
  | 'super_admin'
  | 'admin'
  | 'noc_operator'
  | 'engineer'
  | 'technician'
  | 'field_supervisor';

type UserStatus = 'active' | 'offline' | 'busy' | 'inactive';

type AppUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  zone: string;
  assignedSites: string[];
  openTasks: number;
  completedTasks: number;
  lastActive: string;
  permissions: string[];
  activity: {
    title: string;
    time: string;
    description: string;
  }[];
};

@Component({
  selector: 'to-users',
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
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  search = signal('');
  role = signal<'all' | UserRole>('all');
  status = signal<'all' | UserStatus>('all');

  selectedUser = signal<AppUser | null>(null);

  readonly roleOptions = [
    { label: 'All Roles', value: 'all' },
    { label: 'Super Admin', value: 'super_admin' },
    { label: 'Admin', value: 'admin' },
    { label: 'NOC Operator', value: 'noc_operator' },
    { label: 'Engineer', value: 'engineer' },
    { label: 'Technician', value: 'technician' },
    { label: 'Field Supervisor', value: 'field_supervisor' },
  ];

  readonly statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Busy', value: 'busy' },
    { label: 'Offline', value: 'offline' },
    { label: 'Inactive', value: 'inactive' },
  ];

  readonly columns: DataTableColumn<AppUser>[] = [
    { field: 'id', header: 'User ID', type: 'mono', width: '110px' },
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'role', header: 'Role', type: 'tag', width: '150px' },
    { field: 'status', header: 'Status', type: 'tag', width: '130px' },
    { field: 'zone', header: 'Zone' },
    { field: 'openTasks', header: 'Open Tasks', type: 'number', width: '120px' },
    { field: 'lastActive', header: 'Last Active', width: '140px' },
  ];

  readonly users = signal<AppUser[]>([
    {
      id: 'USR-001',
      name: 'Hassan Al Mansoori',
      email: 'hassan@towerops.ae',
      phone: '+971 50 100 2001',
      role: 'super_admin',
      status: 'active',
      department: 'Platform Administration',
      zone: 'UAE',
      assignedSites: ['All Sites'],
      openTasks: 0,
      completedTasks: 142,
      lastActive: 'Just now',
      permissions: ['Full Access', 'Tenant Management', 'RBAC', 'Audit Logs'],
      activity: [
        {
          title: 'Updated tenant settings',
          time: '10 min ago',
          description: 'Changed NOC tenant configuration.',
        },
      ],
    },
    {
      id: 'USR-002',
      name: 'Vikram Singh',
      email: 'vikram@towerops.ae',
      phone: '+971 50 100 2002',
      role: 'noc_operator',
      status: 'active',
      department: 'NOC Operations',
      zone: 'Dubai',
      assignedSites: ['Tower Dubai 02', 'Dubai Spare Parts Warehouse'],
      openTasks: 3,
      completedTasks: 88,
      lastActive: '2 min ago',
      permissions: ['View Dashboard', 'Acknowledge Alerts', 'Create Tickets'],
      activity: [
        {
          title: 'Acknowledged alert',
          time: '4 min ago',
          description: 'Power failure alert acknowledged.',
        },
      ],
    },
    {
      id: 'USR-003',
      name: 'Mohammed Khan',
      email: 'mohammed@towerops.ae',
      phone: '+971 50 100 2003',
      role: 'engineer',
      status: 'busy',
      department: 'Power Systems',
      zone: 'Sharjah',
      assignedSites: ['Tower Sharjah 01'],
      openTasks: 5,
      completedTasks: 67,
      lastActive: '6 min ago',
      permissions: ['View Tickets', 'Update Work Orders', 'Upload Reports'],
      activity: [
        {
          title: 'Started work order',
          time: '12 min ago',
          description: 'Started battery inspection ticket.',
        },
      ],
    },
    {
      id: 'USR-004',
      name: 'Saleh Al Ali',
      email: 'saleh@towerops.ae',
      phone: '+971 50 100 2004',
      role: 'technician',
      status: 'active',
      department: 'RF & Signal',
      zone: 'Dubai',
      assignedSites: ['Tower Dubai 02', 'Tower Sharjah 01'],
      openTasks: 2,
      completedTasks: 54,
      lastActive: '8 min ago',
      permissions: ['View Assigned Tickets', 'Update Field Status'],
      activity: [
        {
          title: 'Uploaded field report',
          time: '20 min ago',
          description: 'Uploaded signal diagnostic report.',
        },
      ],
    },
    {
      id: 'USR-005',
      name: 'Priya Sharma',
      email: 'priya@towerops.ae',
      phone: '+971 50 100 2005',
      role: 'field_supervisor',
      status: 'active',
      department: 'Field Service',
      zone: 'Abu Dhabi',
      assignedSites: ['Abu Dhabi Regional Hub', 'Abu Dhabi Equipment Warehouse'],
      openTasks: 7,
      completedTasks: 103,
      lastActive: '15 min ago',
      permissions: ['Assign Engineers', 'Review Reports', 'Close Tickets'],
      activity: [
        {
          title: 'Assigned technician',
          time: '18 min ago',
          description: 'Assigned emergency door sensor ticket.',
        },
      ],
    },
    {
      id: 'USR-006',
      name: 'Admin User',
      email: 'admin@towerops.ae',
      phone: '+971 50 100 2006',
      role: 'admin',
      status: 'offline',
      department: 'Administration',
      zone: 'UAE',
      assignedSites: ['All Sites'],
      openTasks: 1,
      completedTasks: 74,
      lastActive: '1 hr ago',
      permissions: ['User Management', 'Asset Management', 'Reports'],
      activity: [
        {
          title: 'Created asset',
          time: '2 hrs ago',
          description: 'Added new sensor asset to registry.',
        },
      ],
    },
  ]);

  readonly filteredUsers = computed(() => {
    const q = this.search().trim().toLowerCase();

    return this.users().filter((user) => {
      const matchesSearch =
        !q ||
        user.id.toLowerCase().includes(q) ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.toLowerCase().includes(q) ||
        user.zone.toLowerCase().includes(q);

      const matchesRole = this.role() === 'all' || user.role === this.role();
      const matchesStatus = this.status() === 'all' || user.status === this.status();

      return matchesSearch && matchesRole && matchesStatus;
    });
  });

  readonly summary = computed(() => ({
    total: this.users().length,
    admins: this.users().filter((u) => u.role === 'admin' || u.role === 'super_admin').length,
    noc: this.users().filter((u) => u.role === 'noc_operator').length,
    field: this.users().filter((u) => u.role === 'engineer' || u.role === 'technician').length,
    active: this.users().filter((u) => u.status === 'active').length,
  }));

  openUser(user: AppUser): void {
    this.selectedUser.set(user);
  }

  closeDrawer(): void {
    this.selectedUser.set(null);
  }

  clearFilters(): void {
    this.search.set('');
    this.role.set('all');
    this.status.set('all');
  }

  severity(value: UserStatus | UserRole): 'success' | 'warn' | 'danger' | 'secondary' {
    if (value === 'active' || value === 'super_admin' || value === 'admin') return 'success';
    if (value === 'busy' || value === 'engineer' || value === 'technician') return 'warn';
    if (value === 'inactive') return 'danger';
    return 'secondary';
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  formatRole(role: UserRole): string {
    return role.replaceAll('_', ' ');
  }
}