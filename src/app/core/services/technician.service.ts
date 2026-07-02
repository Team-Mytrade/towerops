import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type TechnicianStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'ON_SITE'
  | 'OFF_DUTY'
  | 'INACTIVE';

export type TechnicianPayload = {
  technicianCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  designation: string;
  department: string;
  tenantId: string;
  siteCode: string;
  status: TechnicianStatus;
  enabled: boolean;
  skillSet: string;
  remarks: string;
  userId: number | null;
};

export type Technician = TechnicianPayload & {
  id: number;
  username: string;
};

@Injectable({
  providedIn: 'root',
})
export class TechnicianService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly endpoint = 'technicians';

  getAll() {
    return this.api.get<Technician[]>(this.endpoint);
  }

  getById(id: number | string) {
    return this.api.get<Technician>(`${this.endpoint}/${id}`);
  }

  create(payload: TechnicianPayload) {
    return this.api.post<Technician>(this.endpoint, payload, this.headers());
  }

  update(id: number | string, payload: TechnicianPayload) {
    return this.api.put<Technician>(`${this.endpoint}/${id}`, payload, this.headers());
  }

  delete(id: number | string) {
    return this.api.delete<void>(`${this.endpoint}/${id}`, this.headers());
  }

  getBySite(siteCode: string) {
    return this.api.get<Technician[]>(`${this.endpoint}/site/${siteCode}`);
  }

  getAvailable() {
    return this.api.get<Technician[]>(`${this.endpoint}/available`);
  }

  private headers(): Record<string, string> {
    return {
      'X-Tenant-Id': this.auth.getTenantId() || 'DEFAULT',
    };
  }
}