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
    path: '',
    component: WorkspaceLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'sites',
      },
      {
        path: 'select',
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
        redirectTo: 'sites',
      },
      {
        path: 'dashboard/:siteType',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(
            (m) => m.Dashboard
          ),
      },
      {
  path: 'tickets',
  loadComponent: () =>
    import('./pages/work-orders/work-orders').then(
      (m) => m.WorkOrdersComponent
    ),
},
      {
  path: 'users',
  loadComponent: () =>
    import('./pages/users/users.component').then(
      (m) => m.UsersComponent
    ),
},
      {
        path: 'sites',
        loadChildren: () => import('./pages/sites/sites.routes').then(
          (m) => (m.SITES_ROUTES) as Routes
        ),
      },
      {
        path: 'maintenance',
        loadComponent: () =>
          import('./pages/maintenance/maintenance').then(
            (m) => m.MaintenanceComponent
          ),
      },
      {
        path: 'assets',
        loadComponent: () =>
          import('./pages/assets/assets.component').then(
            (m) => m.AssetsComponent
          ),
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./pages/alerts/alerts.component').then(
            (m) => m.AlertsComponent
          ),
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./pages/network-map/network-map.component').then(
            (m) => m.NetworkMapComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(
            (m) => m.SettingsComponent
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