import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

type NavItem = {
  label: string;
  path: string;
  icon: string;
  testId: string;
  exact?: boolean;
};

@Component({
  selector: 'to-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  collapsed = signal(false);

  alertCount = signal(3);

  user = {
    name: 'Admin User',
    role: 'NOC Admin',
  };


  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      icon: 'pi pi-objects-column',
      testId: 'nav-dashboard',
      exact: true,
    },
    {
      label: 'Towers',
      path: '/towers',
      icon: 'fa-solid fa-tower-broadcast',
      testId: 'nav-towers',
    },
    {
      label: 'Assets',
      path: '/assets',
      icon: 'pi pi-server',
      testId: 'nav-assets',
    },
    {
      label: 'Monitoring',
      path: '/monitoring',
      icon: 'pi pi-chart-line',
      testId: 'nav-monitoring',
    },
    {
      label: 'Alarms',
      path: '/alarms',
      icon: 'pi pi-bell',
      testId: 'nav-alarms',
    },
    {
      label: 'Maintenance',
      path: '/maintenance',
      icon: 'pi pi-briefcase',
      testId: 'nav-maintenance',
    },
    {
      label: 'Work Orders',
      path: '/work-orders',
      icon: 'pi pi-clipboard',
      testId: 'nav-work-orders',
    },
    {
      label: 'Engineers',
      path: '/engineers',
      icon: 'pi pi-users',
      testId: 'nav-engineers',
    },
  ];

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.collapsed.update(value => !value);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  get userInitial(): string {
    return (this.user.name || 'U').slice(0, 1).toUpperCase();
  }
}