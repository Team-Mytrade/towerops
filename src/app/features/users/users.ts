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
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { firstValueFrom } from 'rxjs';
import { PasswordModule } from 'primeng/password';
import { Role, RoleService } from '../../core/services/role.service';
import { User, UserPayload, UserService } from '../../core/services/user.service';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type UserStatus = 'Active' | 'Inactive';
type DrawerMode = 'view' | 'create' | 'edit' | 'assignRole';

type UserRow = User & {
  status: UserStatus;
  roleNames: string;
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
    PasswordModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users implements OnInit {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);

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

  userForm: UserPayload = this.emptyUserForm();

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
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.userCode?.toLowerCase().includes(query) ||
        user.phoneNumber?.toLowerCase().includes(query);

      const matchesRole = role === 'All' || user.roleIds?.includes(role);
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

  async loadPageData(): Promise<void> {
    try {
      this.loading.set(true);

      const [rolesRes, usersRes] = await Promise.all([
        firstValueFrom(this.roleService.getAll()),
        firstValueFrom(this.userService.getAll()),
      ]);

      this.roles.set(rolesRes.data ?? []);

      const rows = (usersRes.data ?? []).map((user) => this.mapUser(user, rolesRes.data ?? []));
      this.users.set(rows);
    } catch (error) {
      console.error('Failed to load users:', error);
      this.roles.set([]);
      this.users.set([]);
    } finally {
      this.loading.set(false);
    }
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
        street: user.address?.street ?? '',
        city: user.address?.city ?? '',
        state: user.address?.state ?? '',
        postalCode: user.address?.postalCode ?? '',
        country: user.address?.country ?? '',
      },
    };

    this.drawerMode.set('edit');
  }

  assignRole(): void {
    const user = this.selectedUser();

    if (!user) return;

    this.userForm = {
      ...this.emptyUserForm(),
      ...user,
      password: '',
      roleIds: [...(user.roleIds ?? [])],
      address: {
        street: user.address?.street ?? '',
        city: user.address?.city ?? '',
        state: user.address?.state ?? '',
        postalCode: user.address?.postalCode ?? '',
        country: user.address?.country ?? '',
      },
    };

    this.drawerMode.set('assignRole');
  }

  async saveUser(): Promise<void> {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.userCode || !payload.username || !payload.email) {
      return;
    }

    try {
      this.saving.set(true);

      if (this.drawerMode() === 'edit' || this.drawerMode() === 'assignRole') {
        const selected = this.selectedUser();

        if (!selected) return;

        await firstValueFrom(this.userService.update(selected.id, payload));
      } else {
        await firstValueFrom(this.userService.create(payload));
      }

      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteUser(): Promise<void> {
    const user = this.selectedUser();

    if (!user || this.saving()) return;

    try {
      this.saving.set(true);
      await firstValueFrom(this.userService.delete(user.id));
      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      this.saving.set(false);
    }
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

    if (this.drawerMode() === 'edit' && !payload.password) {
      delete payload.password;
    }

    return payload;
  }

  private emptyUserForm(): UserPayload {
    return {
      userCode: '',
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
}