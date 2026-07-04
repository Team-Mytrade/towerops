import { Routes } from '@angular/router';

import { authRoutes } from './auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
<<<<<<< HEAD
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
=======
  ...authRoutes,
>>>>>>> 07f97517238968882332611f88686810fc127484

  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
<<<<<<< HEAD
        redirectTo: 'select',
=======
        redirectTo: 'site-category-selection',
      },

      {
        path: 'site-category-selection',
        loadComponent: () =>
          import('./features/site-category-selection/site-category-selection.component').then(
            (m) => m.SiteCategorySelectionComponent,
          ),
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
>>>>>>> 07f97517238968882332611f88686810fc127484
      },

      {
<<<<<<< HEAD
        path: 'super-admin',
        loadChildren: () =>
          import('./super-admin/super-admin.routes').then(
            (m) => m.SUPER_ADMIN_ROUTES
=======
        path: 'dashboard/site-category/:category',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'platform-dashboard',
        loadComponent: () =>
          import('./features/platform-dashboard/platform-dashboard.component').then(
            (m) => m.PlatformDashboardComponent,
>>>>>>> 07f97517238968882332611f88686810fc127484
          ),
      },

      {
<<<<<<< HEAD
        path: 'tenant',
        loadChildren: () =>
          import('./tenant/tenant.routes').then(
            (m) => m.TENANT_ROUTES
=======
        path: 'technician-dashboard',
        loadComponent: () =>
          import('./features/technician-dashboard/technician-dashboard.component').then(
            (m) => m.TechnicianDashboardComponent,
          ),
      },

      {
        path: 'tenants',
        loadComponent: () =>
          import('./features/tenants/tenants').then((m) => m.Tenants),
      },

      {
        path: 'sites',
        loadComponent: () =>
          import('./features/sites/sites').then((m) => m.Sites),
      },
      {
        path: 'sites/:id',
        loadComponent: () =>
          import('./features/site-details/site-details.component').then(
            (m) => m.SiteDetailsComponent,
          ),
      },

      {
        path: 'devices',
        loadComponent: () =>
          import('./features/devices/devices').then((m) => m.Devices),
      },
      {
        path: 'device-models',
        loadComponent: () =>
          import('./features/device-models/device-models').then(
            (m) => m.DeviceModels,
          ),
      },

      {
        path: 'map',
        loadComponent: () =>
          import('./features/network-map/network-map').then(
            (m) => m.NetworkMap,
          ),
      },
      {
        path: 'monitoring',
        loadComponent: () =>
          import('./features/monitoring/monitoring').then(
            (m) => m.Monitoring,
          ),
      },

      {
        path: 'alerts',
        loadComponent: () =>
          import('./features/alerts/alerts').then((m) => m.Alerts),
      },
      {
        path: 'alarms',
        loadComponent: () =>
          import('./features/alarms/alarms').then((m) => m.Alarms),
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/tickets/tickets').then((m) => m.Tickets),
      },
      {
        path: 'work-orders',
        loadComponent: () =>
          import('./features/work-orders/work-orders').then(
            (m) => m.WorkOrders,
          ),
      },
      {
        path: 'maintenance',
        loadComponent: () =>
          import('./features/maintenance/maintenance').then(
            (m) => m.Maintenance,
          ),
      },

      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users').then((m) => m.Users),
      },
      {
        path: 'technicians',
        loadComponent: () =>
          import('./features/technicians/technicians').then(
            (m) => m.Technicians,
>>>>>>> 07f97517238968882332611f88686810fc127484
          ),
      },

      {
<<<<<<< HEAD
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
=======
        path: 'roles',
        loadComponent: () =>
          import('./features/roles/roles').then((m) => m.Roles),
      },
      {
        path: 'rules',
        loadComponent: () =>
          import('./features/rules/rules').then((m) => m.Rules),
      },

      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notification-configs/notification-configs').then(
            (m) => m.NotificationConfigs,
          ),
      },
      {
        path: 'configurations',
        loadComponent: () =>
          import('./features/configurations/configurations').then(
            (m) => m.Configurations,
          ),
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./features/audit-logs/audit-logs').then(
            (m) => m.AuditLogs,
>>>>>>> 07f97517238968882332611f88686810fc127484
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];