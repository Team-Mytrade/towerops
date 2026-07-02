import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type WorkOrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'CANCELLED';

export type WorkOrderPayload = {
  workOrderCode: string;
  ticketId: number;
  alertId: number;
  technicianId: number;
  title: string;
  description: string;
  status: WorkOrderStatus;
  scheduledAt: string;
  startedAt: string;
  completedAt: string;
  resolution: string;
  laborHours: number;
  remarks: string;
};

export type WorkOrder = WorkOrderPayload & {
  id: number;
  technicianCode: string;
  technicianName: string;
};

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly endpoint = 'work-orders';

  getAll() {
    return this.api.get<WorkOrder[]>(this.endpoint, {
      headers: this.headers(),
    });
  }

  getById(id: number | string) {
    return this.api.get<WorkOrder>(`${this.endpoint}/${id}`, {
      headers: this.headers(),
    });
  }

  create(payload: WorkOrderPayload) {
    return this.api.post<WorkOrder>(this.endpoint, payload, this.headers());
  }

  update(id: number | string, payload: WorkOrderPayload) {
    return this.api.put<WorkOrder>(`${this.endpoint}/${id}`, payload, this.headers());
  }

  delete(id: number | string) {
    return this.api.delete<void>(`${this.endpoint}/${id}`, this.headers());
  }

  getByTechnician(technicianId: number | string) {
    return this.api.get<WorkOrder[]>(`${this.endpoint}/technician/${technicianId}`, {
      headers: this.headers(),
    });
  }

  getByStatus(status: WorkOrderStatus) {
    return this.api.get<WorkOrder[]>(`${this.endpoint}/status/${status}`, {
      headers: this.headers(),
    });
  }

  private headers(): Record<string, string> {
    return {
      'X-Tenant-Id': this.auth.getTenantId() || 'DEFAULT',
    };
  }
}