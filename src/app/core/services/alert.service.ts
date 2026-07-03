import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CLOSED';

export type AlertPayload = {
  deviceId: string;
  ruleId: number;
  ruleName: string;
  alertType: string;
  severity: AlertSeverity;
  message: string;
};

export type Alert = AlertPayload & {
  id: number;
  acknowledged: boolean;
  timestamp: string;
  status: AlertStatus;
};

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly endpoint = '/v1/alerts';

  getAll() {
    return this.api.get<Alert[]>(this.endpoint, {
      headers: this.headers(),
    });
  }

  getOpen() {
    return this.api.get<Alert[]>(`${this.endpoint}/open`, {
      headers: this.headers(),
    });
  }

  getById(id: number | string) {
    return this.api.get<Alert>(`${this.endpoint}/${id}`, {
      headers: this.headers(),
    });
  }

  getByDevice(deviceId: string) {
    return this.api.get<Alert[]>(`${this.endpoint}/device/${deviceId}`, {
      headers: this.headers(),
    });
  }

  create(payload: AlertPayload) {
    return this.api.post<Alert>(this.endpoint, payload, this.headers());
  }

  acknowledge(id: number | string) {
    return this.api.put<Alert>(`${this.endpoint}/${id}/acknowledge`, {}, this.headers());
  }

  resolve(id: number | string) {
    return this.api.put<Alert>(`${this.endpoint}/${id}/resolve`, {}, this.headers());
  }

  delete(id: number | string) {
    return this.api.delete<void>(`${this.endpoint}/${id}`, this.headers());
  }

  private headers(): Record<string, string> {
    return {
      'X-Tenant-Id': this.auth.getTenantId() || 'DEFAULT',
    };
  }
}