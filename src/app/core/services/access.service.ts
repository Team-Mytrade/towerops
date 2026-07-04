import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  private readonly auth = inject(AuthService);

  hasPermission(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return this.auth.hasAnyPermission(permissions);
  }

  hasRole(role: string): boolean {
    return this.auth.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.auth.hasAnyRole(roles);
  }
}