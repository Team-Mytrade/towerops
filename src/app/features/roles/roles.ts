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
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { firstValueFrom } from 'rxjs';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { Role, RolePayload, RoleService } from '../../core/services/role.service';
import {
  Permission,
  PermissionService,
} from '../../core/services/permission.service';

type DrawerMode = 'create' | 'edit' | 'createPermission';

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
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);

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

    if (!query) {
      return this.roles();
    }

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

  async loadPageData(): Promise<void> {
    try {
      this.loading.set(true);

      const [permissionsRes, rolesRes] = await Promise.all([
        firstValueFrom(this.permissionService.getAll()),
        firstValueFrom(this.roleService.getAll()),
      ]);

      this.permissions.set(permissionsRes.data ?? []);
      this.roles.set(rolesRes.data ?? []);

      if (!this.selectedRoleId() && rolesRes.data?.length) {
        this.selectedRoleId.set(rolesRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load roles and permissions:', error);
      this.permissions.set([]);
      this.roles.set([]);
    } finally {
      this.loading.set(false);
    }
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
async savePermission(): Promise<void> {
  if (this.saving()) {
    return;
  }

  const payload = {
    permissionCode: this.permissionForm.permissionCode.trim(),
    permissionName: this.permissionForm.permissionName.trim(),
    description: this.permissionForm.description.trim(),
  };

  if (!payload.permissionCode || !payload.permissionName) {
    return;
  }

  try {
    this.saving.set(true);
    await firstValueFrom(this.permissionService.create(payload));
    await this.loadPageData();
    this.closeDrawer();
  } catch (error) {
    console.error('Failed to save permission:', error);
  } finally {
    this.saving.set(false);
  }
}



  openEditRole(): void {
    const role = this.selectedRole();

    if (!role) {
      return;
    }

    this.drawerMode.set('edit');

    this.roleForm = {
      roleCode: role.roleCode,
      roleName: role.roleName,
      description: role.description ?? '',
      permissionIds: this.getPermissionIdsFromNames(role.permissions ?? []),
    };

    this.drawerOpen.set(true);
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

  async saveRole(): Promise<void> {
    if (this.saving()) {
      return;
    }

    const payload = this.normalizedPayload();

    if (!payload.roleCode || !payload.roleName) {
      return;
    }

    try {
      this.saving.set(true);

      if (this.drawerMode() === 'edit') {
        const role = this.selectedRole();

        if (!role) {
          return;
        }

        await firstValueFrom(this.roleService.update(role.id, payload));
      } else {
        await firstValueFrom(this.roleService.create(payload));
      }

      await this.loadPageData();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to save role:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteSelectedRole(): Promise<void> {
    const role = this.selectedRole();

    if (!role || this.saving()) {
      return;
    }

    try {
      this.saving.set(true);
      await firstValueFrom(this.roleService.delete(role.id));
      this.selectedRoleId.set(null);
      await this.loadPageData();
    } catch (error) {
      console.error('Failed to delete role:', error);
    } finally {
      this.saving.set(false);
    }
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
      roleCode: '',
      roleName: '',
      description: '',
      permissionIds: [],
    };
  }
}