import { Routes } from "@angular/router";

export const SUPER_ADMIN_ROUTES = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./super-admin-dashboard/super-admin-dashboard.component').then(
        (m) => m.SuperAdminDashboardComponent
      ),
  },
  {
    path: 'tenants',
    loadComponent: () =>
      import('./tenants/tenants.component').then(
        (m) => m.TenantsComponent
      ),
  },
] as Routes;
