import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { BaseService } from './base.service';
import { StorageService } from './storage.service';

import {
    LoginRequest,
    LoginResponse,
    AuthUser,
} from '../models/auth.models';

import { API_ENDPOINTS } from '../constants/api.constants';
import { STORAGE_KEYS } from '../constants/storage.constants';

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


    login(
        payload: LoginRequest
    ): Observable<LoginResponse> {
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
        return this.post(
            API_ENDPOINTS.auth.logout,
            {}
        ).pipe(
            tap(() => {
                this.clearSession();
            })
        );
    }

    setSession(
        response: LoginResponse
    ): void {
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
        this.storage.remove(
            STORAGE_KEYS.ACCESS_TOKEN
        );

        this.storage.remove(
            STORAGE_KEYS.REFRESH_TOKEN
        );

        this.storage.remove(
            STORAGE_KEYS.USER
        );

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

    hasPermission(
        permission: string
    ): boolean {
        return this.permissions().includes(
            permission
        );
    }

    hasAnyPermission(
        permissions: string[]
    ): boolean {
        return permissions.some(
            (permission) =>
                this.hasPermission(permission)
        );
    }

    hasRole(role: string): boolean {
        return this.role() === role;
    }
}