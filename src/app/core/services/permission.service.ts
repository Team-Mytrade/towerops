import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type PermissionPayload = {
  permissionCode: string;
  permissionName: string;
  description: string;
};

export type Permission = {
  id: number;
  permissionCode: string;
  permissionName: string;
  description: string;
};

export type ApiResponse<T> = {
  timestamp: number;
  success: boolean;
  message: string;
  data: T;
};

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly endpoint = 'permissions';

  getAll() {
    return this.api.get<ApiResponse<Permission[]>>(this.endpoint);
  }

  getById(id: number | string) {
    return this.api.get<ApiResponse<Permission>>(`${this.endpoint}/${id}`);
  }

  create(payload: PermissionPayload) {
    return this.api.post<ApiResponse<Permission>>(
      this.endpoint,
      payload,
      this.headers(),
    );
  }

  update(id: number | string, payload: PermissionPayload) {
    return this.api.put<ApiResponse<Permission>>(
      `${this.endpoint}/${id}`,
      payload,
      this.headers(),
    );
  }

  delete(id: number | string) {
    return this.api.delete<ApiResponse<null>>(
      `${this.endpoint}/${id}`,
      this.headers(),
    );
  }

  private headers(): Record<string, string> {
    return {
      'X-Tenant-Id': this.auth.getTenantId() || 'DEFAULT',
      'X-User': this.auth.getUsername() || 'system',
    };
  }
}