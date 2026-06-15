import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(
    private readonly auth: AuthService
  ) {}

  hasPermission(
    permission: string
  ): boolean {
    return this.auth.hasPermission(
      permission
    );
  }

  hasAnyPermission(
    permissions: string[]
  ): boolean {
    return this.auth.hasAnyPermission(
      permissions
    );
  }

  hasRole(role: string): boolean {
    return this.auth.hasRole(role);
  }

  hasAnyRole(
    roles: string[]
  ): boolean {
    return roles.includes(
      this.auth.role() ?? ''
    );
  }
}