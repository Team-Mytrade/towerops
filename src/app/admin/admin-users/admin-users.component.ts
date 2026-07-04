import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type UserStatus = 'Active' | 'Inactive';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  type: 'Admin' | 'NOC Operator' | 'Technician' | 'Super Admin';
  status: UserStatus;
  linkedTechnician?: string;
  lastActive: string;
};

@Component({
  selector: 'to-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent {
  readonly search = signal('');
  readonly roleFilter = signal('All');
  readonly statusFilter = signal('All');

  readonly drawerMode = signal<'create' | 'view' | null>(null);
  readonly selectedUser = signal<AdminUser | null>(null);

  readonly roles = ['All', 'Super Admin', 'Admin', 'NOC Operator', 'Technician'];
  readonly statuses = ['All', 'Active', 'Inactive'];

  readonly users = signal<AdminUser[]>([
    {
      id: 'USR-001',
      name: 'Ahmed Khan',
      email: 'ahmed.khan@towerops.ae',
      role: 'Super Admin',
      type: 'Super Admin',
      status: 'Active',
      lastActive: 'Today, 10:24 AM',
    },
    {
      id: 'USR-002',
      name: 'Sara Malik',
      email: 'sara.malik@towerops.ae',
      role: 'NOC Operator',
      type: 'NOC Operator',
      status: 'Active',
      lastActive: 'Today, 09:12 AM',
    },
    {
      id: 'USR-003',
      name: 'Imran Yusuf',
      email: 'imran.yusuf@towerops.ae',
      role: 'Technician',
      type: 'Technician',
      status: 'Active',
      linkedTechnician: 'TEC-014',
      lastActive: 'Yesterday, 05:42 PM',
    },
  ]);

  readonly filteredUsers = computed(() => {
    const query = this.search().toLowerCase().trim();
    const role = this.roleFilter();
    const status = this.statusFilter();

    return this.users().filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesRole = role === 'All' || user.role === role;
      const matchesStatus = status === 'All' || user.status === status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  });

  openCreateDrawer(): void {
    this.selectedUser.set(null);
    this.drawerMode.set('create');
  }

  openUser(user: AdminUser): void {
    this.selectedUser.set(user);
    this.drawerMode.set('view');
  }

  closeDrawer(): void {
    this.drawerMode.set(null);
    this.selectedUser.set(null);
  }
}