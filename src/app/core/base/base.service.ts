import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_BASE_URL } from '../constants/api.constants';
import { ApiResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class BaseService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: Record<string, string | number | boolean>) {
    return this.http.get<ApiResponse<T>>(`${API_BASE_URL}${url}`, {
      params: this.toParams(params),
    });
  }

  post<T, B = unknown>(url: string, body: B) {
    return this.http.post<ApiResponse<T>>(`${API_BASE_URL}${url}`, body);
  }

  put<T, B = unknown>(url: string, body?: B) {
    return this.http.put<ApiResponse<T>>(`${API_BASE_URL}${url}`, body ?? {});
  }

  delete<T>(url: string) {
    return this.http.delete<ApiResponse<T>>(`${API_BASE_URL}${url}`);
  }

  private toParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    Object.entries(params).forEach(([key, value]) => {
      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }
}