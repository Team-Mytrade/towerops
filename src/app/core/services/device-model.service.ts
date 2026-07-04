import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type DeviceModelPayload = {
  modelCode: string;
  modelName: string;
  manufacturer: string;
  category: string;
  firmwareVersion: string;
  description: string;
  enabled: boolean;
};

export type DeviceModel = DeviceModelPayload & {
  id: number;
  active?: boolean;
};

export type ApiResponse<T> = {
  timestamp: number;
  success: boolean;
  message: string;
  data: T;
};

@Injectable({ providedIn: 'root' })
export class DeviceModelService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly endpoint = '/api/v1/device-models';

  getAll() {
    return this.api.getRoot<ApiResponse<DeviceModel[]>>(this.endpoint, {
      headers: this.headers(),
    });
  }

  getById(id: number | string) {
    return this.api.getRoot<ApiResponse<DeviceModel>>(`${this.endpoint}/${id}`, {
      headers: this.headers(),
    });
  }

  create(payload: DeviceModelPayload) {
    return this.api.postRoot<ApiResponse<DeviceModel>>(this.endpoint, payload, this.headers());
  }

  update(id: number | string, payload: DeviceModelPayload) {
    return this.api.putRoot<ApiResponse<DeviceModel>>(`${this.endpoint}/${id}`, payload, this.headers());
  }

  delete(id: number | string) {
    return this.api.deleteRoot<ApiResponse<null>>(`${this.endpoint}/${id}`, this.headers());
  }

  private headers(): Record<string, string> {
    return {
      'X-Tenant-Id': this.auth.getTenantId() || 'DEFAULT',
      // 'X-User': String(this.auth.getUserId() || 2),
    };
  }
}