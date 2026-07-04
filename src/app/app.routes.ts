import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { WorkspaceLayout } from './layout/workspace-layout/workspace-layout';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then((m) => m.authRoutes),
  },

  {
    path: 'select',
    component: WorkspaceLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/site-selector/site-selector').then(
            (m) => m.SiteSelector
          ),
      },
    ],
  },

  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'select',
      },

      {
        path: 'super-admin',
        loadChildren: () =>
          import('./super-admin/super-admin.routes').then(
            (m) => m.SUPER_ADMIN_ROUTES
          ),
      },

      {
        path: 'tenant',
        loadChildren: () =>
          import('./tenant/tenant.routes').then(
            (m) => m.TENANT_ROUTES
          ),
      },

      {
        path: 'technician',
        loadChildren: () =>
          import('./technician/technician.routes').then(
            (m) => m.TECHNICIAN_ROUTES
          ),
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