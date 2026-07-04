import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type TenantPayload = {
  tenantId: string;
  tenantName: string;
  email: string;
  phoneNumber: string;
  address: string;
  enabled: boolean;
  createdBy?: string;
};

export type Tenant = {
  id: number;
  tenantId: string;
  tenantName: string;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  enabled: boolean;
  active: boolean | null;
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
export class TenantService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly endpoint = '/v1/tenants';


  getAll() {
    return this.api.get<ApiResponse<Tenant[]>>(this.endpoint);
  }
  // , { headers: { 'X-Tenant-Id': this.auth.getTenantId() || 'DEFAULT' } }
  getById(id: number | string) {
    return this.api.get<ApiResponse<Tenant>>(`${this.endpoint}/${id}`);
  }

  create(payload: TenantPayload) {
    return this.api.post<ApiResponse<Tenant>>(
      this.endpoint,
      this.withCreatedBy(payload),
    );
  }

  update(id: number | string, payload: TenantPayload) {
    return this.api.put<ApiResponse<Tenant>>(
      `${this.endpoint}/${id}`,
      this.withCreatedBy(payload),
    );
  }

  delete(id: number | string) {
    return this.api.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
  }

  private withCreatedBy(payload: TenantPayload): TenantPayload {
    return {
      ...payload,
      createdBy: payload.createdBy || this.auth.getUsername() || 'system',
    };
  }
}