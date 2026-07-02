import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TenantContextService } from '../services/tenant-context.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenant = inject(TenantContextService);

  const tenantId = tenant.tenantId();

  if (!tenantId) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        'X-Tenant-Id': tenantId,
      },
    }),
  );
};