import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { STORAGE_KEYS } from '../constants/storage.constants';
import {
  ApiResponse,
  LoginRequest,
  LoginResponseData,
} from '../models/auth.models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(this.storage.get(STORAGE_KEYS.token));
  readonly username = signal<string | null>(this.storage.get(STORAGE_KEYS.username));
  readonly tenantId = signal<string | null>(this.storage.get(STORAGE_KEYS.tenantId));

  readonly role = signal<string | null>(this.storage.get(STORAGE_KEYS.role));
  readonly permissions = signal<string[]>(
    this.storage.get<string[]>(STORAGE_KEYS.permissions) ?? [],
  );

  readonly authenticated = computed(() => !!this.token());
  readonly isSuperAdmin = computed(() => this.tenantId() === 'DEFAULT');

  login(payload: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
    return new Promise((resolve, reject) => {
      this.http
        .post<ApiResponse<LoginResponseData>>(
          `${environment.apiUrl}/v1/auth/login`,
          payload,
        )
        .subscribe({
          next: (res) => {
            if (res?.success && res.data?.token) {
              this.setSession(res.data);
            }

            resolve(res);
          },
          error: reject,
        });
    });
  }

  setSession(data: LoginResponseData): void {
    this.storage.set(STORAGE_KEYS.token, data.token);
    this.storage.set(STORAGE_KEYS.username, data.username);
    this.storage.set(STORAGE_KEYS.tenantId, data.tenantId);

    this.token.set(data.token);
    this.username.set(data.username);
    this.tenantId.set(data.tenantId);

    this.extractJwtSession(data.token, data.tenantId);
  }

  private extractJwtSession(token: string, tenantId: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const jwtRole = payload.roles || null;
      const role = tenantId === 'DEFAULT' ? 'SUPER_ADMIN' : jwtRole;

      const permissions = role === 'SUPER_ADMIN' ? ['*'] : [];

      this.storage.set(STORAGE_KEYS.role, role);
      this.storage.set(STORAGE_KEYS.permissions, permissions);

      this.role.set(role);
      this.permissions.set(permissions);
    } catch {
      const role = tenantId === 'DEFAULT' ? 'SUPER_ADMIN' : null;
      const permissions = role === 'SUPER_ADMIN' ? ['*'] : [];

      this.storage.set(STORAGE_KEYS.role, role);
      this.storage.set(STORAGE_KEYS.permissions, permissions);

      this.role.set(role);
      this.permissions.set(permissions);
    }
  }

  clearSession(): void {
    this.storage.remove(STORAGE_KEYS.token);
    this.storage.remove(STORAGE_KEYS.username);
    this.storage.remove(STORAGE_KEYS.tenantId);
    this.storage.remove(STORAGE_KEYS.role);
    this.storage.remove(STORAGE_KEYS.permissions);

    this.token.set(null);
    this.username.set(null);
    this.tenantId.set(null);
    this.role.set(null);
    this.permissions.set([]);
  }

  logout(): void {
    this.clearSession();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  isLoggedIn(): boolean {
    return this.authenticated();
  }

  getToken(): string | null {
    return this.token();
  }

  getUsername(): string | null {
    return this.username();
  }

  getTenantId(): string | null {
    return this.tenantId();
  }

  hasRole(role: string): boolean {
    return this.role() === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.role() ?? '');
  }

  hasPermission(permission: string): boolean {
    const permissions = this.permissions();
    return permissions.includes('*') || permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }
}