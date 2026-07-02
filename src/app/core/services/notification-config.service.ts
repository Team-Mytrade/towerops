import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type NotificationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type NotificationConfigPayload = {
  name: string;
  eventType: string;
  subject: string;
  body: string;
  severity: NotificationSeverity;
  emailEnabled: boolean;
  smsEnabled: boolean;
  websocketEnabled: boolean;
  emailRecipients: string;
  phoneRecipients: string;
  active: boolean;
};

export type NotificationConfig = NotificationConfigPayload & {
  id: number;
};

@Injectable({ providedIn: 'root' })
export class NotificationConfigService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly endpoint = 'notification-configs';

  getAll() {
    return this.api.get<NotificationConfig[]>(this.endpoint, {
      headers: this.tenantHeaders(),
    });
  }

  getById(id: number | string) {
    return this.api.get<NotificationConfig>(`${this.endpoint}/${id}`, {
      headers: this.tenantHeaders(),
    });
  }

  create(payload: NotificationConfigPayload) {
    return this.api.post<NotificationConfig>(
      this.endpoint,
      payload,
      this.userHeaders(),
    );
  }

  update(id: number | string, payload: NotificationConfigPayload) {
    return this.api.put<NotificationConfig>(
      `${this.endpoint}/${id}`,
      payload,
      this.tenantHeaders(),
    );
  }

  delete(id: number | string) {
    return this.api.delete<void>(`${this.endpoint}/${id}`, this.tenantHeaders());
  }

  private tenantHeaders(): Record<string, string> {
    return {
      'X-Tenant-Id': this.auth.getTenantId() || 'DEFAULT',
    };
  }

  private userHeaders(): Record<string, string> {
    return {
      'X-Tenant-Id': this.auth.getTenantId() || 'DEFAULT',
      'X-User': this.auth.getUsername() || 'system',
    };
  }
}