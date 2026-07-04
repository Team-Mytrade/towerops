import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { Role, RolePayload } from '../../core/services/role.service';
import { Permission } from '../../core/services/permission.service';

type DrawerMode = 'create' | 'edit' | 'createPermission';

const STORAGE_KEYS = {
  roles: 'towerops_roles',
  permissions: 'towerops_permissions',
};

@Component({
  selector: 'to-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    TableModule,
    Drawer,
    DetailField,
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Roles implements OnInit {
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('create');

  readonly roles = signal<Role[]>([]);
  readonly permissions = signal<Permission[]>([]);
  readonly selectedRoleId = signal<number | null>(null);

  roleForm: RolePayload = this.emptyRoleForm();

  permissionForm = {
    permissionCode: '',
    permissionName: '',
    description: '',
  };

  readonly filteredRoles = computed(() => {
    const query = this.search().toLowerCase().trim();

    if (!query) return this.roles();

    return this.roles().filter((role) => {
      const permissionText = (role.permissions ?? []).join(' ').toLowerCase();

      return (
        role.roleCode.toLowerCase().includes(query) ||
        role.roleName.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query) ||
        permissionText.includes(query)
      );
    });
  });

  readonly selectedRole = computed(() => {
    const id = this.selectedRoleId();
    return this.roles().find((role) => role.id === id) ?? this.roles()[0] ?? null;
  });

  readonly selectedPermissionCount = computed(() => {
    return this.selectedRole()?.permissions?.length ?? 0;
  });

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.loading.set(true);

    this.seedLocalStorageIfEmpty();

    const permissions = this.readStorage<Permission[]>(
      STORAGE_KEYS.permissions,
      [],
    );

    const roles = this.readStorage<Role[]>(STORAGE_KEYS.roles, []);

    this.permissions.set(permissions);
    this.roles.set(roles);

    if (!this.selectedRoleId() && roles.length) {
      this.selectedRoleId.set(roles[0].id);
    }

    this.loading.set(false);
  }

  selectRole(role: Role): void {
    this.selectedRoleId.set(role.id);
  }

  openCreateRole(): void {
    this.drawerMode.set('create');
    this.roleForm = this.emptyRoleForm();
    this.drawerOpen.set(true);
  }

  openCreatePermission(): void {
    this.drawerMode.set('createPermission');
    this.permissionForm = {
      permissionCode: '',
      permissionName: '',
      description: '',
    };
    this.drawerOpen.set(true);
  }

  savePermission(): void {
    if (this.saving()) return;

    const payload = {
      permissionCode: this.permissionForm.permissionCode.trim(),
      permissionName: this.permissionForm.permissionName.trim(),
      description: this.permissionForm.description.trim(),
    };

    if (!payload.permissionCode || !payload.permissionName) return;

    this.saving.set(true);

    const permissions = this.permissions();

    const newPermission = {
      id: this.nextId(permissions),
      ...payload,
    } as Permission;

    const updatedPermissions = [newPermission, ...permissions];

    this.permissions.set(updatedPermissions);
    this.writeStorage(STORAGE_KEYS.permissions, updatedPermissions);

    this.saving.set(false);
    this.closeDrawer();
  }

  openEditRole(): void {
    const role = this.selectedRole();

    if (!role) return;

    this.drawerMode.set('edit');

    this.roleForm = {
      roleCode: role.roleCode,
      roleName: role.roleName,
      description: role.description ?? '',
      permissionIds: this.getPermissionIdsFromNames(role.permissions ?? []),
    };

    this.drawerOpen.set(true);
  }

  saveRole(): void {
    if (this.saving()) return;

    const payload = this.normalizedPayload();

    if (!payload.roleCode || !payload.roleName) return;

    this.saving.set(true);

    const roles = this.roles();

    const permissionNames = this.getPermissionNamesFromIds(payload.permissionIds);

    if (this.drawerMode() === 'edit') {
      const role = this.selectedRole();

      if (!role) {
        this.saving.set(false);
        return;
      }

      const updatedRoles = roles.map((item) =>
        item.id === role.id
          ? {
            ...item,
            roleCode: payload.roleCode,
            roleName: payload.roleName,
            description: payload.description,
            permissions: permissionNames,
          }
          : item,
      );

      this.roles.set(updatedRoles);
      this.writeStorage(STORAGE_KEYS.roles, updatedRoles);
      this.selectedRoleId.set(role.id);
    } else {
      const newRole: Role = {
        id: this.nextId(roles),
        roleCode: payload.roleCode,
        roleName: payload.roleName,
        description: payload.description,
        permissions: permissionNames,
      };

      const updatedRoles = [newRole, ...roles];

      this.roles.set(updatedRoles);
      this.writeStorage(STORAGE_KEYS.roles, updatedRoles);
      this.selectedRoleId.set(newRole.id);
    }

    this.saving.set(false);
    this.closeDrawer();
  }

  deleteSelectedRole(): void {
    const role = this.selectedRole();

    if (!role || this.saving()) return;

    this.saving.set(true);

    const updatedRoles = this.roles().filter((item) => item.id !== role.id);

    this.roles.set(updatedRoles);
    this.writeStorage(STORAGE_KEYS.roles, updatedRoles);
    this.selectedRoleId.set(updatedRoles[0]?.id ?? null);

    this.saving.set(false);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('create');
    this.roleForm = this.emptyRoleForm();
    this.permissionForm = {
      permissionCode: '',
      permissionName: '',
      description: '',
    };
  }

  togglePermission(permissionId: number): void {
    const selected = new Set(this.roleForm.permissionIds);

    if (selected.has(permissionId)) {
      selected.delete(permissionId);
    } else {
      selected.add(permissionId);
    }

    this.roleForm.permissionIds = [...selected];
  }

  hasDraftPermission(permissionId: number): boolean {
    return this.roleForm.permissionIds.includes(permissionId);
  }

  private getPermissionIdsFromNames(permissionNames: string[]): number[] {
    const names = new Set(permissionNames);

    return this.permissions()
      .filter(
        (permission) =>
          names.has(permission.permissionName) ||
          names.has(permission.permissionCode),
      )
      .map((permission) => permission.id);
  }

  private getPermissionNamesFromIds(permissionIds: number[]): string[] {
    return this.permissions()
      .filter((permission) => permissionIds.includes(permission.id))
      .map((permission) => permission.permissionName);
  }

  private normalizedPayload(): RolePayload {
    return {
      roleCode: this.roleForm.roleCode.trim(),
      roleName: this.roleForm.roleName.trim(),
      description: this.roleForm.description.trim(),
      permissionIds: this.roleForm.permissionIds,
    };
  }

  private emptyRoleForm(): RolePayload {
    return {
      roleCode: this.generateRoleCode(),
      roleName: '',
      description: '',
      permissionIds: [],
    };
  }

  private seedLocalStorageIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.permissions)) {
      this.writeStorage(STORAGE_KEYS.permissions, this.mockPermissions());
    }

    if (!localStorage.getItem(STORAGE_KEYS.roles)) {
      this.writeStorage(STORAGE_KEYS.roles, this.mockRoles());
    }
  }

  private mockPermissions(): Permission[] {
    return [
      {
        id: 1,
        permissionCode: 'dashboard:view',
        permissionName: 'View Dashboard',
        description: 'Can view dashboard and KPI widgets.',
      } as Permission,
      {
        id: 2,
        permissionCode: 'sites:view',
        permissionName: 'View Sites',
        description: 'Can view sites and map details.',
      } as Permission,
      {
        id: 3,
        permissionCode: 'sites:manage',
        permissionName: 'Manage Sites',
        description: 'Can create, update and delete sites.',
      } as Permission,
      {
        id: 4,
        permissionCode: 'devices:view',
        permissionName: 'View Devices',
        description: 'Can view device list and device details.',
      } as Permission,
      {
        id: 5,
        permissionCode: 'devices:manage',
        permissionName: 'Manage Devices',
        description: 'Can create, update and delete devices.',
      } as Permission,
      {
        id: 6,
        permissionCode: 'alerts:view',
        permissionName: 'View Alerts',
        description: 'Can view alerts and alarm history.',
      } as Permission,
      {
        id: 7,
        permissionCode: 'alerts:manage',
        permissionName: 'Manage Alerts',
        description: 'Can acknowledge, resolve and delete alerts.',
      } as Permission,
      {
        id: 8,
        permissionCode: 'work-orders:view',
        permissionName: 'View Work Orders',
        description: 'Can view work orders.',
      } as Permission,
      {
        id: 9,
        permissionCode: 'work-orders:manage',
        permissionName: 'Manage Work Orders',
        description: 'Can create, assign, update and close work orders.',
      } as Permission,
      {
        id: 10,
        permissionCode: 'users:manage',
        permissionName: 'Manage Users',
        description: 'Can create users and assign roles.',
      } as Permission,
    ];
  }

  private mockRoles(): Role[] {
    return [
      {
        id: 1,
        roleCode: 'ROLE-001',
        roleName: 'Super Admin',
        description: 'Full platform access across tenants.',
        permissions: [
          'View Dashboard',
          'View Sites',
          'Manage Sites',
          'View Devices',
          'Manage Devices',
          'View Alerts',
          'Manage Alerts',
          'View Work Orders',
          'Manage Work Orders',
          'Manage Users',
        ],
      },
      {
        id: 2,
        roleCode: 'ROLE-002',
        roleName: 'Tenant Admin',
        description: 'Tenant-level admin access.',
        permissions: [
          'View Dashboard',
          'View Sites',
          'Manage Sites',
          'View Devices',
          'Manage Devices',
          'View Alerts',
          'Manage Alerts',
          'View Work Orders',
          'Manage Work Orders',
          'Manage Users',
        ],
      },
      {
        id: 3,
        roleCode: 'ROLE-003',
        roleName: 'NOC Operator',
        description: 'Can monitor alerts, alarms and dashboards.',
        permissions: [
          'View Dashboard',
          'View Sites',
          'View Devices',
          'View Alerts',
          'Manage Alerts',
          'View Work Orders',
        ],
      },
      {
        id: 4,
        roleCode: 'ROLE-004',
        roleName: 'Field Technician',
        description: 'Can access and update assigned work orders.',
        permissions: ['View Work Orders'],
      },
      {
        id: 5,
        roleCode: 'ROLE-005',
        roleName: 'Viewer',
        description: 'Read-only access.',
        permissions: [
          'View Dashboard',
          'View Sites',
          'View Devices',
          'View Alerts',
          'View Work Orders',
        ],
      },
    ];
  }

  private generateRoleCode(): string {
    const roles = this.readStorage<Role[]>(STORAGE_KEYS.roles, []);
    const nextNumber = roles.length + 1;

    return `ROLE-${String(nextNumber).padStart(3, '0')}`;
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