import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { BaseService } from './base.service';
import { StorageService } from './storage.service';
import { EnvironmentService } from './environment.service';

import {
  LoginRequest,
  LoginResponse,
  AuthUser,
} from '../models/auth.models';

import { API_ENDPOINTS } from '../constants/api.constants';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { MOCK_USER } from '../../mock/mock-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  private readonly storage = inject(StorageService);
  private readonly _user = signal<AuthUser | null>(
    this.storage.get<AuthUser>(STORAGE_KEYS.USER)
  );

  readonly currentUser = this._user.asReadonly();

  readonly isLoggedIn = computed(
    () => !!this.getAccessToken()
  );

  readonly permissions = computed(
    () => this._user()?.permissions ?? []
  );

  readonly role = computed(
    () => this._user()?.role ?? null
  );

  readonly tenant = computed(
  () => this._user()?.tenant ?? null
);

readonly siteTypes = computed(
  () => this._user()?.siteTypes ?? []
);

readonly country = computed(
  () => this._user()?.country ?? null
);

hasSiteType(
  siteType: string
): boolean {
  return (
    this.siteTypes().includes(
      siteType as any
    )
  );
}

hasSingleSiteType(): boolean {
  return this.siteTypes().length === 1;
}

  login(payload: LoginRequest): Observable<LoginResponse> {
    if (this.env.useMockAuth) {
      const response: LoginResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: MOCK_USER,
      };

      return of(response).pipe(
        tap((mockResponse) => {
          this.setSession(mockResponse);
        })
      );
    }

    return this.post<LoginResponse>(
      API_ENDPOINTS.auth.login,
      payload
    ).pipe(
      tap((response) => {
        this.setSession(response);
      })
    );
  }

  logout(): Observable<unknown> {
    if (this.env.useMockAuth) {
      this.clearSession();
      return of(true);
    }

    return this.post(
      API_ENDPOINTS.auth.logout,
      {}
    ).pipe(
      tap(() => {
        this.clearSession();
      })
    );
  }

  initializeMockUser(): void {
    if (!this.env.useMockAuth) return;

    const existingUser =
      this.storage.get<AuthUser>(STORAGE_KEYS.USER);

    const existingToken =
      this.storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);

    if (existingUser && existingToken) {
      this._user.set(existingUser);
      return;
    }

    const response: LoginResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: MOCK_USER,
    };

    this.setSession(response);
  }

  setSession(response: LoginResponse): void {
    this.storage.set(
      STORAGE_KEYS.ACCESS_TOKEN,
      response.accessToken
    );

    if (response.refreshToken) {
      this.storage.set(
        STORAGE_KEYS.REFRESH_TOKEN,
        response.refreshToken
      );
    }

    this.storage.set(
      STORAGE_KEYS.USER,
      response.user
    );

    this._user.set(response.user);
  }

  clearSession(): void {
    this.storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    this.storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    this.storage.remove(STORAGE_KEYS.USER);

    this._user.set(null);
  }

  getAccessToken(): string | null {
    return this.storage.get<string>(
      STORAGE_KEYS.ACCESS_TOKEN
    );
  }

  getRefreshToken(): string | null {
    return this.storage.get<string>(
      STORAGE_KEYS.REFRESH_TOKEN
    );
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(permission)
    );
  }

  hasRole(role: string): boolean {
    return this.role() === role;
  }
}