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
import { UserType } from '../enums/user-type.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(this.storage.get(STORAGE_KEYS.token));
  readonly username = signal<string | null>(this.storage.get(STORAGE_KEYS.username));
  readonly tenantId = signal<string | null>(this.storage.get(STORAGE_KEYS.tenantId));

  readonly userId = signal<number | null>(
    this.storage.get<number>(STORAGE_KEYS.userId),
  );

  readonly userType = signal<UserType | null>(
    this.storage.get<UserType>(STORAGE_KEYS.userType),
  );

  readonly roles = signal<string[]>(
    this.storage.get<string[]>(STORAGE_KEYS.roles) ?? [],
  );

  readonly permissions = signal<string[]>(
    this.storage.get<string[]>(STORAGE_KEYS.permissions) ?? [],
  );

  readonly authenticated = computed(() => !!this.token());

  readonly isSuperAdmin = computed(
    () =>
      this.userType() === UserType.SUPER_ADMIN ||
      this.tenantId() === 'DEFAULT' ||
      this.roles().includes(UserType.SUPER_ADMIN),
  );

  readonly isTenantAdmin = computed(
    () =>
      this.userType() === UserType.TENANT_ADMIN ||
      this.userType() === UserType.ADMIN,
  );

  readonly isTechnician = computed(
    () => this.userType() === UserType.TECHNICIAN,
  );

  login(payload: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
    const url = `${environment.apiUrl}/v1/auth/login`;

    console.log('[LOGIN URL]', url);
    console.log('[LOGIN PAYLOAD]', payload);

    return new Promise((resolve, reject) => {
      this.http.post<ApiResponse<LoginResponseData>>(url, payload).subscribe({
        next: (res) => {
          console.log('[LOGIN RESPONSE]', res);

          if (res?.success && res.data?.token) {
            this.setSession(res.data);
          }

          resolve(res);
        },
        error: (error) => {
          console.error('[LOGIN ERROR]', error);
          reject(error);
        },
      });
    });
  }

  setSession(data: LoginResponseData): void {
    const roles = data.roles ?? [];
    const permissions = data.permissions ?? [];

    this.storage.set(STORAGE_KEYS.token, data.token);
    this.storage.set(STORAGE_KEYS.username, data.username);
    this.storage.set(STORAGE_KEYS.tenantId, data.tenantId);
    this.storage.set(STORAGE_KEYS.userId, data.userId);
    this.storage.set(STORAGE_KEYS.userType, data.userType);
    this.storage.set(STORAGE_KEYS.roles, roles);
    this.storage.set(STORAGE_KEYS.permissions, permissions);

    this.token.set(data.token);
    this.username.set(data.username);
    this.tenantId.set(data.tenantId);
    this.userId.set(data.userId);
    this.userType.set(data.userType);
    this.roles.set(roles);
    this.permissions.set(permissions);
  }

  clearSession(): void {
    this.storage.remove(STORAGE_KEYS.token);
    this.storage.remove(STORAGE_KEYS.username);
    this.storage.remove(STORAGE_KEYS.tenantId);
    this.storage.remove(STORAGE_KEYS.userId);
    this.storage.remove(STORAGE_KEYS.userType);
    this.storage.remove(STORAGE_KEYS.roles);
    this.storage.remove(STORAGE_KEYS.permissions);

    this.token.set(null);
    this.username.set(null);
    this.tenantId.set(null);
    this.userId.set(null);
    this.userType.set(null);
    this.roles.set([]);
    this.permissions.set([]);
  }

  logout(): void {
    this.clearSession();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
  /**
   * Development-only demo login that bypasses the backend.
   * Works only when not in production mode.
   */
  loginDemo(userType: UserType, username: string): Promise<void> {
    if (environment.production) {
      return Promise.reject('Demo login is disabled in production');
    }
    const mockData: LoginResponseData = {
      token: 'demo-token',
      username,
      tenantId: 'DEMO',
      userId: 0,
      userType,
      roles: [],
      permissions: [],
    };
    this.setSession(mockData);
    return Promise.resolve();
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

  getUserId(): number | null {
    return this.userId();
  }

  getUserType(): UserType | null {
    return this.userType();
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.roles().includes(role));
  }

  hasPermission(permission: string): boolean {
    const permissions = this.permissions();

    return permissions.includes('*') || permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }
}