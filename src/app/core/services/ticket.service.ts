import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type TicketSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CONFIRMED'
  | 'CLOSED'
  | 'REJECTED';

export type TicketPayload = {
  alarmId: number;
  deviceId: string;
  tenantId: string;
  siteCode: string;
  ruleId: number;
  title: string;
  description: string;
  severity: TicketSeverity;
  assignedUserId: number;
  assignedUserName: string;
};

export type Ticket = TicketPayload & {
  id: number;
  ticketNumber: string;
  status: TicketStatus;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  active: boolean;
};

export type ApiResponse<T> = {
  timestamp: number;
  success: boolean;
  message: string;
  data: T;
};

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly endpoint = '/v1/tickets';

  getAll() {
    return this.api.get<ApiResponse<Ticket[]>>(this.endpoint, {
      headers: this.tenantHeaders(),
    });
  }

  getById(id: number | string) {
    return this.api.get<ApiResponse<Ticket>>(`${this.endpoint}/${id}`, {
      headers: this.tenantHeaders(),
    });
  }

  getByStatus(status: TicketStatus) {
    return this.api.get<ApiResponse<Ticket[]>>(`${this.endpoint}/status/${status}`, {
      headers: this.tenantHeaders(),
    });
  }

  create(payload: TicketPayload) {
    return this.api.post<ApiResponse<Ticket>>(this.endpoint, payload, this.userHeaders());
  }

  assign(id: number | string, userId: number, userName: string) {
    return this.api.put<ApiResponse<Ticket>>(
      `${this.endpoint}/${id}/assign`,
      {},
      this.userHeadersWithQuery(),
      {
        userId,
        userName,
      },
    );
  }

  acknowledge(id: number | string) {
    return this.api.put<ApiResponse<Ticket>>(
      `${this.endpoint}/${id}/acknowledge`,
      {},
      this.userHeaders(),
    );
  }

  resolve(id: number | string, notes: string) {
    return this.api.put<ApiResponse<Ticket>>(
      `${this.endpoint}/${id}/resolve`,
      {},
      this.userHeadersWithQuery(),
      { notes },
    );
  }

  transition(id: number | string, targetStatus: TicketStatus, remarks = '') {
    return this.api.put<ApiResponse<Record<string, unknown>>>(
      `${this.endpoint}/${id}/transition`,
      {},
      this.userHeadersWithQuery(),
      { targetStatus, remarks },
    );
  }

  delete(id: number | string) {
    return this.api.delete<ApiResponse<Record<string, unknown>>>(
      `${this.endpoint}/${id}`,
      this.userHeaders(),
    );
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

  private userHeadersWithQuery(): Record<string, string> {
    return this.userHeaders();
  }
}