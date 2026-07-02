import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccessService } from '../services/access.service';


export const permissionGuard: CanActivateFn = (route) => {
  const access = inject(AccessService);
  const router = inject(Router);

  const permissions = route.data?.['permissions'] as string[] | undefined;

  if (!permissions?.length) {
    return true;
  }

  return access.hasAnyPermission(permissions)
    ? true
    : router.createUrlTree(['/no-access']);
};