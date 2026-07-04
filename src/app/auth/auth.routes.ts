import { Routes } from '@angular/router';

<<<<<<< HEAD
import { LoginComponent } from './login/login.component';
=======
import { guestGuard } from '../core/guards/guest.guard';
>>>>>>> 07f97517238968882332611f88686810fc127484

export const authRoutes: Routes = [
  {
    path: 'login',
<<<<<<< HEAD
    component: LoginComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
=======
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
>>>>>>> 07f97517238968882332611f88686810fc127484
  },
];