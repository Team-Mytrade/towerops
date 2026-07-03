import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type UserAddress = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type UserPayload = {
  userCode: string;
  userType: string;
  username: string;
  email: string;
  password?: string;
  roleIds: number[];
  enabled: boolean;
  phoneNumber: string;
  address: UserAddress;
};

export type User = {
  id: number;
  userCode: string;
  userType: string;
  username: string;
  email: string;
  roleIds: number[];
  enabled: boolean;
  phoneNumber: string;
  address: UserAddress;
  active: boolean;
};

export type ApiResponse<T> = {
  timestamp: number;
  success: boolean;
  message: string;
  data: T;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly endpoint = '/v1/users';

  getAll() {
    return this.api.get<ApiResponse<User[]>>(this.endpoint);
  }

  getById(id: number | string) {
    return this.api.get<ApiResponse<User>>(`${this.endpoint}/${id}`);
  }

  create(payload: UserPayload) {
    return this.api.post<ApiResponse<User>>(this.endpoint, payload, this.headers());
  }

  update(id: number | string, payload: UserPayload) {
    return this.api.put<ApiResponse<User>>(`${this.endpoint}/${id}`, payload, this.headers());
  }

  delete(id: number | string) {
    return this.api.delete<ApiResponse<null>>(`${this.endpoint}/${id}`, this.headers());
  }

  private headers(): Record<string, string> {
    return {
      'X-Tenant-Id': this.auth.getTenantId() || 'DEFAULT',
      'X-User': this.auth.getUsername() || 'system',
    };
  }
}