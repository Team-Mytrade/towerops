import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'close';

type ModulePermission = {
  module: string;
  actions: Record<PermissionAction, boolean>;
};

type AdminRole = {
  id: string;
  name: string;
  description: string;
  users: number;
  systemRole: boolean;
  permissions: ModulePermission[];
};

const emptyActions = (): Record<PermissionAction, boolean> => ({
  view: false,
  create: false,
  update: false,
  delete: false,
  close: false,
});

@Component({
  selector: 'to-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRolesComponent {
  readonly actions: PermissionAction[] = ['view', 'create', 'update', 'delete', 'close'];

  readonly modules = [
    'Dashboard',
    'Alerts',
    'Alarms',
    'Tickets',
    'Work Orders',
    'Maintenance',
    'Technicians',
    'Users',
    'Roles',
    'Rule Engine',
  ];

  readonly drawerOpen = signal(false);
  readonly selectedRoleId = signal('ROLE-001');

  readonly roles = signal<AdminRole[]>([
    {
      id: 'ROLE-001',
      name: 'Super Admin',
      description: 'Full platform access including work order closure.',
      users: 2,
      systemRole: true,
      permissions: this.modules.map((module) => ({
        module,
        actions: {
          view: true,
          create: true,
          update: true,
          delete: true,
          close: true,
        },
      })),
    },
    {
      id: 'ROLE-002',
      name: 'Admin',
      description: 'Can manage users, technicians and operational records.',
      users: 4,
      systemRole: false,
      permissions: this.modules.map((module) => ({
        module,
        actions: {
          view: true,
          create: module !== 'Roles',
          update: module !== 'Roles',
          delete: false,
          close: false,
        },
      })),
    },
    {
      id: 'ROLE-003',
      name: 'NOC Operator',
      description: 'Can monitor alerts and create tickets/work orders.',
      users: 8,
      systemRole: false,
      permissions: this.modules.map((module) => ({
        module,
        actions: {
          ...emptyActions(),
          view: ['Dashboard', 'Alerts', 'Alarms', 'Tickets', 'Work Orders'].includes(module),
          create: ['Tickets', 'Work Orders'].includes(module),
          update: ['Tickets', 'Work Orders'].includes(module),
        },
      })),
    },
    {
      id: 'ROLE-004',
      name: 'Technician',
      description: 'Can view assigned jobs and update work order progress.',
      users: 18,
      systemRole: false,
      permissions: this.modules.map((module) => ({
        module,
        actions: {
          ...emptyActions(),
          view: ['Work Orders'].includes(module),
          update: ['Work Orders'].includes(module),
        },
      })),
    },
  ]);

  readonly selectedRole = computed(() =>
    this.roles().find((role) => role.id === this.selectedRoleId()) ?? this.roles()[0],
  );

  selectRole(role: AdminRole): void {
    this.selectedRoleId.set(role.id);
  }

  openCreateDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  togglePermission(module: string, action: PermissionAction): void {
    const role = this.selectedRole();

    if (!role || role.systemRole) {
      return;
    }

    this.roles.update((roles) =>
      roles.map((item) => {
        if (item.id !== role.id) {
          return item;
        }

        return {
          ...item,
          permissions: item.permissions.map((permission) => {
            if (permission.module !== module) {
              return permission;
            }

            return {
              ...permission,
              actions: {
                ...permission.actions,
                [action]: !permission.actions[action],
              },
            };
          }),
        };
      }),
    );
  }
}