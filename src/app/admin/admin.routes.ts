import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview',
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./admin-overview/admin-overview.component').then(
        (m) => m.AdminOverviewComponent
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./admin-users/admin-users.component').then(
        (m) => m.AdminUsersComponent
      ),
  },
  {
    path: 'technicians',
    loadComponent: () =>
      import('./admin-technicians/admin-technicians.component').then(
        (m) => m.AdminTechniciansComponent
      ),
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./admin-roles/admin-roles.component').then(
        (m) => m.AdminRolesComponent
      ),
  },
  {
    path: 'rules',
    loadComponent: () =>
      import('./rule-engine/rule-engine.component').then(
        (m) => m.RuleEngineComponent
      ),
  },
];