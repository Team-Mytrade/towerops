import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'no-access',
        loadComponent: () =>
          import('./shared/pages/no-access/no-access.page').then(
            (m) => m.NoAccessPage
          ),
      },
      {
        path: 'server-error',
        loadComponent: () =>
          import('./shared/pages/server-error/server-error.page').then(
            (m) => m.ServerErrorPage
          ),
      },
      {
        path: 'maintenance',
        loadComponent: () =>
          import('./shared/pages/maintenance/maintenance.page').then(
            (m) => m.MaintenancePage
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.page').then(
        (m) => m.NotFoundPage
      ),
  },
];