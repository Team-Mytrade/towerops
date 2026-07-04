import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { SiteCategory } from '../enums/site-category.enum';


export type SiteAddress = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Site = {
  id: number;
  siteCode: string;
  siteName: string;
  category: SiteCategory;
  address: SiteAddress;
  latitude: number;
  longitude: number;
  description: string;
  enabled: boolean;
  active: boolean;
};

export type SitePayload = Omit<Site, 'id' | 'active'>;

export type ApiResponse<T> = {
  timestamp: number;
  success: boolean;
  message: string;
  data: T;
};

@Injectable({ providedIn: 'root' })
export class SiteService extends ApiService {
  private readonly auth = inject(AuthService);

  private readonly oldEndpoint = '/api/sites';
  private readonly endpoint = '/v1/sites';

  getAll() {
    return this.get<ApiResponse<Site[]>>(this.endpoint, {
      headers: this.tenantHeaders(),
    });
  }
  getCategorySummary() {
    return this.get<ApiResponse<any[]>>(`/v1/sites/category/summary`, {
      headers: this.tenantHeaders(),
    });
  }

  getByCategory(category: SiteCategory) {
    return this.getRoot<ApiResponse<Site[]>>(`${this.endpoint}/category/${category}`, {
      headers: this.tenantHeaders(),
    });
  }

  getById(id: number | string) {
    return this.getRoot<ApiResponse<Site>>(`${this.endpoint}/${id}`, {
      headers: this.tenantHeaders(),
    });
  }

  create(payload: SitePayload) {
    return this.postRoot<ApiResponse<Site>>(
      this.endpoint,
      payload,
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
}