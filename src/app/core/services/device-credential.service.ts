import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type DeviceCredentialPayload = {
  deviceId: string;
  secret: string;
  tenantId: string;
  deviceType: string;
  model: string;
};

export type DeviceCredential = {
  id: number;
  deviceId: string;
  tenantId: string;
  active: boolean;
  deviceType: string;
  model: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable({ providedIn: 'root' })
export class DeviceCredentialService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly endpoint = 'api/device-credentials';

  getAll() {
    return this.api.getRoot<DeviceCredential[]>(this.endpoint, {
      headers: this.headers(),
    });
  }

  getById(id: number | string) {
    return this.api.getRoot<DeviceCredential>(`${this.endpoint}/${id}`, {
      headers: this.headers(),
    });
  }

  getByDevice(deviceId: string) {
    return this.api.getRoot<DeviceCredential>(`${this.endpoint}/device/${deviceId}`, {
      headers: this.headers(),
    });
  }

  create(payload: DeviceCredentialPayload) {
    return this.api.postRoot<DeviceCredential>(this.endpoint, payload, this.headers());
  }

  update(id: number | string, payload: DeviceCredentialPayload) {
    return this.api.putRoot<DeviceCredential>(`${this.endpoint}/${id}`, payload, this.headers());
  }

  delete(id: number | string) {
    return this.api.deleteRoot<void>(`${this.endpoint}/${id}`, this.headers());
  }

  private headers(): Record<string, string> {
    return {
      tenantId: this.auth.getTenantId() || 'DEFAULT',
    };
  }
}