import { Routes } from '@angular/router';

import { authRoutes } from './auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  ...authRoutes,

  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

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
      },
      {
        path: 'platform-dashboard',
        loadComponent: () =>
          import('./features/platform-dashboard/platform-dashboard.component').then(
            (m) => m.PlatformDashboardComponent,
          ),
      },
      {
        path: 'dashboard/site-category/:category',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },

      // {
      //   path: 'technician-dashboard',
      //   loadComponent: () =>
      //     import('./features/technician-dashboard/technician-dashboard.component').then(
      //       (m) => m.TechnicianDashboardComponent,
      //     ),
      // },

      { path: 'home', loadComponent: () => import('./features/home/home').then(m => m.Home) },

      { path: 'tenants', loadComponent: () => import('./features/tenants/tenants').then(m => m.Tenants) },
      {
        path: 'sites/:id',
        loadComponent: () =>
          import('./features/site-details/site-details.component').then(
            (m) => m.SiteDetailsComponent,
          ),
      },
      { path: 'devices', loadComponent: () => import('./features/devices/devices').then(m => m.Devices) },
      { path: 'device-models', loadComponent: () => import('./features/device-models/device-models').then(m => m.DeviceModels) },
      { path: 'map', loadComponent: () => import('./features/network-map/network-map').then(m => m.NetworkMap) },

      { path: 'alerts', loadComponent: () => import('./features/alerts/alerts').then(m => m.Alerts) },
      { path: 'alarms', loadComponent: () => import('./features/alarms/alarms').then(m => m.Alarms) },
      { path: 'tickets', loadComponent: () => import('./features/tickets/tickets').then(m => m.Tickets) },
      { path: 'work-orders', loadComponent: () => import('./features/work-orders/work-orders').then(m => m.WorkOrders) },
      { path: 'maintenance', loadComponent: () => import('./features/maintenance/maintenance').then(m => m.Maintenance) },
      { path: 'monitoring', loadComponent: () => import('./features/monitoring/monitoring').then(m => m.Monitoring) },
      { path: 'approvals', loadComponent: () => import('./features/approvals/approvals').then(m => m.Approvals) },

      { path: 'users', loadComponent: () => import('./features/users/users').then(m => m.Users) },
      { path: 'technicians', loadComponent: () => import('./features/technicians/technicians').then(m => m.Technicians) },
      { path: 'roles', loadComponent: () => import('./features/roles/roles').then(m => m.Roles) },
      { path: 'rules', loadComponent: () => import('./features/rules/rules').then(m => m.Rules) },

      { path: 'configurations', loadComponent: () => import('./features/configurations/configurations').then(m => m.Configurations) },
      { path: 'notifications', loadComponent: () => import('./features/notification-configs/notification-configs').then(m => m.NotificationConfigs) },
      { path: 'audit-logs', loadComponent: () => import('./features/audit-logs/audit-logs').then(m => m.AuditLogs) },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];