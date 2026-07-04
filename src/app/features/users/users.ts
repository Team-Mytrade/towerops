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
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { Role } from '../../core/services/role.service';
import { User, UserPayload } from '../../core/services/user.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type UserStatus = 'Active' | 'Inactive';
type DrawerMode = 'view' | 'create' | 'edit' | 'assignRole';

type UserRow = User & {
  status: UserStatus;
  roleNames: string;
};

const STORAGE_KEYS = {
  users: 'towerops_users',
  roles: 'towerops_roles',
};

@Component({
  selector: 'to-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    TableModule,
    Drawer,
    DetailField,
    StatusBadge,
    PasswordModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users implements OnInit {
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly roleFilter = signal<number | 'All'>('All');
  readonly statusFilter = signal<'All' | UserStatus>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selectedUser = signal<UserRow | null>(null);

  readonly users = signal<UserRow[]>([]);
  readonly roles = signal<Role[]>([]);

  userForm: UserPayload = this.emptyUserForm();

  readonly userTypeOptions = [
    { label: 'Tenant Admin', value: 'TENANT_ADMIN' },
    { label: 'NOC Operator', value: 'NOC_OPERATOR' },
    { label: 'Technician', value: 'TECHNICIAN' },
    { label: 'Viewer', value: 'VIEWER' },
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
  ];

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  readonly enabledOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  readonly roleOptions = computed(() => [
    { label: 'All Roles', value: 'All' as const },
    ...this.roles().map((role) => ({
      label: role.roleName,
      value: role.id,
    })),
  ]);

  readonly roleSelectOptions = computed(() =>
    this.roles().map((role) => ({
      label: role.roleName,
      value: role.id,
    })),
  );

  readonly filteredUsers = computed(() => {
    const query = this.search().toLowerCase().trim();
    const role = this.roleFilter();
    const status = this.statusFilter();

    return this.users().filter((user) => {
      const matchesSearch =
        !query ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.userCode.toLowerCase().includes(query) ||
        user.phoneNumber.toLowerCase().includes(query) ||
        user.roleNames.toLowerCase().includes(query);

      const matchesRole = role === 'All' || user.roleIds.includes(role);
      const matchesStatus = status === 'All' || user.status === status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  });

  get drawerTitle(): string {
    if (this.drawerMode() === 'create') return 'Create User';
    if (this.drawerMode() === 'edit') return 'Update User';
    if (this.drawerMode() === 'assignRole') return 'Assign Role';
    return this.selectedUser()?.username ?? 'User Details';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'create') return 'New User';
    if (this.drawerMode() === 'edit') return 'Edit User';
    return this.selectedUser()?.userCode ?? '';
  }

  get drawerSize(): 'compact' | 'wide' {
    return this.drawerMode() === 'view' ? 'compact' : 'wide';
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.loading.set(true);

    this.seedLocalStorageIfEmpty();

    const roles = this.readStorage<Role[]>(STORAGE_KEYS.roles, []);
    const users = this.readStorage<User[]>(STORAGE_KEYS.users, []);

    this.roles.set(roles);
    this.users.set(users.map((user) => this.mapUser(user, roles)));

    this.loading.set(false);
  }

  openCreate(): void {
    this.userForm = this.emptyUserForm();
    this.selectedUser.set(null);
    this.drawerMode.set('create');
    this.drawerOpen.set(true);
  }

  openUser(user: UserRow): void {
    this.selectedUser.set(user);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  editUser(): void {
    const user = this.selectedUser();

    if (!user) return;

    this.userForm = {
      userCode: user.userCode,
      userType: user.userType,
      username: user.username,
      email: user.email,
      password: '',
      roleIds: [...(user.roleIds ?? [])],
      enabled: user.enabled,
      phoneNumber: user.phoneNumber ?? '',
      address: {
        street: user.address.street ?? '',
        city: user.address.city ?? '',
        state: user.address.state ?? '',
        postalCode: user.address.postalCode ?? '',
        country: user.address.country ?? '',
      },
    };

    this.drawerMode.set('edit');
  }

  assignRole(): void {
    const user = this.selectedUser();

    if (!user) return;

    this.userForm = {
      userCode: user.userCode,
      userType: user.userType,
      username: user.username,
      email: user.email,
      password: '',
      roleIds: [...(user.roleIds ?? [])],
      enabled: user.enabled,
      phoneNumber: user.phoneNumber ?? '',
      address: {
        street: user.address.street ?? '',
        city: user.address.city ?? '',
        state: user.address.state ?? '',
        postalCode: user.address.postalCode ?? '',
        country: user.address.country ?? '',
      },
    };

    this.drawerMode.set('assignRole');
  }

  saveUser(): void {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.userCode || !payload.username || !payload.email) return;

    this.saving.set(true);

    const roles = this.roles();
    const users = this.readStorage<User[]>(STORAGE_KEYS.users, []);

    if (this.drawerMode() === 'edit' || this.drawerMode() === 'assignRole') {
      const selected = this.selectedUser();

      if (!selected) {
        this.saving.set(false);
        return;
      }

      const updatedUsers = users.map((user) => {
        if (user.id !== selected.id) return user;

        return {
          ...user,
          ...payload,
          active: payload.enabled,
        };
      });

      this.writeStorage(STORAGE_KEYS.users, updatedUsers);
      this.users.set(updatedUsers.map((user) => this.mapUser(user, roles)));
    } else {
      const newUser: User = {
        id: this.nextId(users),
        ...payload,
        active: payload.enabled,
      };

      const updatedUsers = [newUser, ...users];

      this.writeStorage(STORAGE_KEYS.users, updatedUsers);
      this.users.set(updatedUsers.map((user) => this.mapUser(user, roles)));
    }

    this.saving.set(false);
    this.closeDrawer();
  }

  deleteUser(): void {
    const user = this.selectedUser();

    if (!user || this.saving()) return;

    this.saving.set(true);

    const roles = this.roles();

    const updatedUsers = this
      .readStorage<User[]>(STORAGE_KEYS.users, [])
      .filter((item) => item.id !== user.id);

    this.writeStorage(STORAGE_KEYS.users, updatedUsers);
    this.users.set(updatedUsers.map((item) => this.mapUser(item, roles)));

    this.saving.set(false);
    this.closeDrawer();
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selectedUser.set(null);
    this.userForm = this.emptyUserForm();
  }

  statusTone(status: UserStatus): 'success' | 'danger' {
    return status === 'Active' ? 'success' : 'danger';
  }

  private mapUser(user: User, roles: Role[]): UserRow {
    const roleNames =
      user.roleIds
        ?.map((id) => roles.find((role) => role.id === id)?.roleName)
        .filter(Boolean)
        .join(', ') || '-';

    return {
      ...user,
      roleNames,
      status: user.enabled ? 'Active' : 'Inactive',
    };
  }

  private normalizePayload(): UserPayload {
    const payload: UserPayload = {
      userCode: this.userForm.userCode.trim(),
      userType: this.userForm.userType,
      username: this.userForm.username.trim(),
      email: this.userForm.email.trim(),
      password: this.userForm.password?.trim(),
      roleIds: this.userForm.roleIds ?? [],
      enabled: this.userForm.enabled,
      phoneNumber: this.userForm.phoneNumber.trim(),
      address: {
        street: this.userForm.address.street.trim(),
        city: this.userForm.address.city.trim(),
        state: this.userForm.address.state.trim(),
        postalCode: this.userForm.address.postalCode.trim(),
        country: this.userForm.address.country.trim(),
      },
    };

    if (
      (this.drawerMode() === 'edit' || this.drawerMode() === 'assignRole') &&
      !payload.password
    ) {
      delete payload.password;
    }

    return payload;
  }

  private emptyUserForm(): UserPayload {
    return {
      userCode: this.generateUserCode(),
      userType: 'TENANT_ADMIN',
      username: '',
      email: '',
      password: '',
      roleIds: [],
      enabled: true,
      phoneNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    };
  }

  private seedLocalStorageIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.roles)) {
      this.writeStorage(STORAGE_KEYS.roles, this.mockRoles());
    }

    if (!localStorage.getItem(STORAGE_KEYS.users)) {
      this.writeStorage(STORAGE_KEYS.users, this.mockUsers());
    }
  }

  private mockRoles(): Role[] {
    return [
      {
        id: 1,
        roleCode: 'ROLE-001',
        roleName: 'Super Admin',
        description: 'Full platform access across tenants.',
        permissions: [
          'tenants:create',
          'tenants:view',
          'users:manage',
          'roles:manage',
          'sites:manage',
          'devices:manage',
          'alerts:manage',
          'work-orders:manage',
        ],
      },
      {
        id: 2,
        roleCode: 'ROLE-002',
        roleName: 'Tenant Admin',
        description: 'Tenant-level admin access.',
        permissions: [
          'users:manage',
          'sites:manage',
          'devices:manage',
          'alerts:view',
          'work-orders:manage',
        ],
      },
      {
        id: 3,
        roleCode: 'ROLE-003',
        roleName: 'NOC Operator',
        description: 'Can monitor alerts, alarms, and dashboards.',
        permissions: [
          'dashboard:view',
          'sites:view',
          'devices:view',
          'alerts:manage',
          'work-orders:view',
        ],
      },
      {
        id: 4,
        roleCode: 'ROLE-004',
        roleName: 'Field Technician',
        description: 'Can access assigned work orders.',
        permissions: [
          'mobile-jobs:view',
          'work-orders:update',
          'maintenance:update',
        ],
      },
      {
        id: 5,
        roleCode: 'ROLE-005',
        roleName: 'Viewer',
        description: 'Read-only access.',
        permissions: [
          'dashboard:view',
          'sites:view',
          'devices:view',
          'alerts:view',
        ],
      },
    ];
  }
  private mockUsers(): User[] {
    return [
      {
        id: 1,
        userCode: 'USR-001',
        userType: 'SUPER_ADMIN',
        username: 'superadmin',
        email: 'superadmin@towerops.demo',
        roleIds: [1],
        enabled: true,
        phoneNumber: '+971500000001',
        address: {
          street: 'Sheikh Zayed Road',
          city: 'Dubai',
          state: 'Dubai',
          postalCode: '00001',
          country: 'UAE',
        },
        active: true,
      },
      {
        id: 2,
        userCode: 'USR-002',
        userType: 'TENANT_ADMIN',
        username: 'admin_user',
        email: 'admin@algotricz.demo',
        roleIds: [2],
        enabled: true,
        phoneNumber: '+971500000002',
        address: {
          street: 'Business Bay',
          city: 'Dubai',
          state: 'Dubai',
          postalCode: '00002',
          country: 'UAE',
        },
        active: true,
      },
      {
        id: 3,
        userCode: 'USR-003',
        userType: 'NOC_OPERATOR',
        username: 'noc.operator',
        email: 'noc@towerops.demo',
        roleIds: [3],
        enabled: true,
        phoneNumber: '+971500000003',
        address: {
          street: 'Dubai Marina',
          city: 'Dubai',
          state: 'Dubai',
          postalCode: '00003',
          country: 'UAE',
        },
        active: true,
      },
      {
        id: 4,
        userCode: 'USR-004',
        userType: 'TECHNICIAN',
        username: 'arun.kumar',
        email: 'arun.kumar@towerops.demo',
        roleIds: [4],
        enabled: true,
        phoneNumber: '+971501112233',
        address: {
          street: 'Al Barsha',
          city: 'Dubai',
          state: 'Dubai',
          postalCode: '00004',
          country: 'UAE',
        },
        active: true,
      },
      {
        id: 5,
        userCode: 'USR-005',
        userType: 'VIEWER',
        username: 'viewer.user',
        email: 'viewer@towerops.demo',
        roleIds: [5],
        enabled: false,
        phoneNumber: '+971500000005',
        address: {
          street: 'Corniche Road',
          city: 'Abu Dhabi',
          state: 'Abu Dhabi',
          postalCode: '00005',
          country: 'UAE',
        },
        active: false,
      },
    ];
  }

  private generateUserCode(): string {
    const users = this.readStorage<User[]>(STORAGE_KEYS.users, []);
    const nextNumber = users.length + 1;

    return `USR-${String(nextNumber).padStart(3, '0')}`;
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