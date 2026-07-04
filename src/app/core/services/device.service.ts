import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type DevicePayload = {
  deviceId: string;
  messageType: string;
  serialNumber: string;
  deviceName: string;
  status: string;
  siteId: number;
  deviceModelId: number;
  firmwareVersion: string;
  ipAddress: string;
  macAddress: string;
  lastSeen: string;
};

export type Device = DevicePayload & {
  id: number;
  active: boolean;
};

export type ApiResponse<T> = {
  timestamp: number;
  success: boolean;
  message: string;
  data: T;
};

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly endpoint = '/v1/devices';

  getAll() {
    return this.api.get<ApiResponse<Device[]>>(this.endpoint);
  }

  getById(id: number | string) {
    return this.api.get<ApiResponse<Device>>(`${this.endpoint}/${id}`);
  }

  getBySite(siteId: number | string) {
    return this.api.get<ApiResponse<Device[]>>(`${this.endpoint}/site/${siteId}`);
  }

  create(payload: DevicePayload) {
    return this.api.post<ApiResponse<Device>>(this.endpoint, payload, this.headers());
  }

  update(id: number | string, payload: DevicePayload) {
    return this.api.put<ApiResponse<Device>>(`${this.endpoint}/${id}`, payload, this.headers());
  }

  delete(id: number | string) {
    return this.api.delete<ApiResponse<null>>(`${this.endpoint}/${id}`, this.headers());
  }

  private headers(): Record<string, string> {
    return {
      'X-Tenant-Id': this.auth.getTenantId() || 'DEFAULT',
      // 'X-User': this.auth.getUsername() || 'system',
    };
  }
}