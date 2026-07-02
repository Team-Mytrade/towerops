import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type RolePayload = {
  roleCode: string;
  roleName: string;
  description: string;
  permissionIds: number[];
};

export type Role = {
  id: number;
  roleCode: string;
  roleName: string;
  description: string;
  permissions: string[];
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
export class RoleService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly endpoint = 'roles';

  getAll() {
    return this.api.get<ApiResponse<Role[]>>(this.endpoint);
  }

  getById(id: number | string) {
    return this.api.get<ApiResponse<Role>>(`${this.endpoint}/${id}`);
  }

  create(payload: RolePayload) {
    return this.api.post<ApiResponse<Role>>(
      this.endpoint,
      payload,
      this.headers(),
    );
  }

  update(id: number | string, payload: RolePayload) {
    return this.api.put<ApiResponse<Role>>(
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