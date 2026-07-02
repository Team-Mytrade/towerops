import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage.constants';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);

  const token = storage.get(STORAGE_KEYS.token);
  const username = storage.get(STORAGE_KEYS.username);
  const tenantId = storage.get(STORAGE_KEYS.tenantId);

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (tenantId) {
    headers = headers.set('X-Tenant-Id', tenantId);
    headers = headers.set('tenantId', tenantId);
  }

  if (username) {
    headers = headers.set('username', username);
  }

  return next(req.clone({ headers }));
};