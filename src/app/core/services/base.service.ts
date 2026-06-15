import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentService } from './environment.service';

export abstract class BaseService {
  protected readonly http = inject(HttpClient);
  protected readonly env = inject(EnvironmentService);

  protected readonly apiUrl = this.env.apiUrl;

  protected get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      params: this.buildParams(params),
      withCredentials: true,
    });
  }

  protected post<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body ?? {}, {
      withCredentials: true,
    });
  }

  protected put<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body ?? {}, {
      withCredentials: true,
    });
  }

  protected patch<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, body ?? {}, {
      withCredentials: true,
    });
  }

  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, {
      withCredentials: true,
    });
  }

  private buildParams(
    params?: Record<string, string | number | boolean | null | undefined>
  ): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}