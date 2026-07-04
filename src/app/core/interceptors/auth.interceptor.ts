import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage.constants';
import { StorageService } from '../services/storage.service';

const TENANT_HEADER_EXCLUDED_URLS = [
  '/v1/auth/login',
  '/v1/auth/logout',
  '/v1/tenants',
];

const USER_HEADER_EXCULDED_URLS = [
  '/api/v1/device-models'
]

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);

  const token = storage.get(STORAGE_KEYS.token);
  const tenantId = storage.get(STORAGE_KEYS.tenantId);

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const shouldSkipTenantHeader = TENANT_HEADER_EXCLUDED_URLS.some((url) =>
    req.url.includes(url),
  );

  if (!shouldSkipTenantHeader && tenantId) {
    headers = headers.set('X-Tenant-Id', tenantId);
  }

  return next(req.clone({ headers }));
};