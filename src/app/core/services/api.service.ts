import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(
    endpoint: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
    },
  ) {
    return this.http.get<T>(`${environment.apiUrl}${endpoint}`, {
      params: this.buildParams(options?.params),
      headers: new HttpHeaders(options?.headers),
    });
  }

  post<T>(
    endpoint: string,
    body: any,
    headers?: Record<string, string>,
  ) {
    return this.http.post<T>(`${environment.apiUrl}${endpoint}`, body, {
      headers: new HttpHeaders(headers),
    });
  }

put<T>(
  endpoint: string,
  body: any,
  headers?: Record<string, string>,
  params?: Record<string, any>,
) {
  return this.http.put<T>(`${environment.apiUrl}${endpoint}`, body, {
    headers: new HttpHeaders(headers),
    params: this.buildParams(params),
  });
}

  delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ) {
    return this.http.delete<T>(`${environment.apiUrl}${endpoint}`, {
      headers: new HttpHeaders(headers),
    });
  }

  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value);
      }
    });

    return httpParams;
  }

  getRoot<T>(endpoint: string, options?: { params?: Record<string, any>; headers?: Record<string, string> }) {
  return this.http.get<T>(`${environment.apiUrl.replace('/api/v1/', '')}${endpoint}`, {
    params: this.buildParams(options?.params),
    headers: new HttpHeaders(options?.headers),
  });
}

postRoot<T>(endpoint: string, body: any, headers?: Record<string, string>) {
  return this.http.post<T>(`${environment.apiUrl.replace('/api/v1/', '')}${endpoint}`, body, {
    headers: new HttpHeaders(headers),
  });
}
putRoot<T>(
  endpoint: string,
  body: any,
  headers?: Record<string, string>,
) {
  return this.http.put<T>(
    `${environment.apiUrl.replace('/api/v1/', '')}${endpoint}`,
    body,
    {
      headers: new HttpHeaders(headers),
    },
  );
}

deleteRoot<T>(
  endpoint: string,
  headers?: Record<string, string>,
) {
  return this.http.delete<T>(
    `${environment.apiUrl.replace('/api/v1/', '')}${endpoint}`,
    {
      headers: new HttpHeaders(headers),
    },
  );
}
}