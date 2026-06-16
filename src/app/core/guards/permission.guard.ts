import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const permissions = route.data?.['permissions'] as string[] | undefined;

  if (!permissions?.length) {
    return true;
  }

  const allowed = permissionService.hasAnyPermission(permissions);

  if (allowed) {
    return true;
  }

  return router.createUrlTree(['/no-access']);
};