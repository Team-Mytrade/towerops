import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TooltipModule } from 'primeng/tooltip';

import { PreferencesService } from '../../core/services/preferences.service';

type NavItem = {
  label: string;
  path: string;
  icon: string;
  testId: string;
  exact?: boolean;
  badge?: string;
  children?: NavItem[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

@Component({
  selector: 'to-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  private readonly preferences = inject(PreferencesService);

  readonly navigated = output<void>();
  readonly collapsed = this.preferences.sidebarCollapsed;

  activeTenant = 'du Telecom NOC';

  navGroups: NavGroup[] = [
    {
      title: 'Workspace',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard/towers',
          icon: 'fa-solid fa-chart-line',
          testId: 'nav-dashboard',
          exact: true,
        },
        {
          label: 'Sites',
          path: '/sites',
          icon: 'fa-solid fa-location-dot',
          testId: 'nav-sites',
          children: [
            {
              label: 'All Sites',
              path: '/sites',
              icon: 'fa-solid fa-layer-group',
              testId: 'nav-all-sites',
              exact: true,
            },
            {
              label: 'Towers',
              path: '/sites/towers',
              icon: 'fa-solid fa-tower-cell',
              testId: 'nav-towers',
            },
            {
              label: 'Buildings',
              path: '/sites/buildings',
              icon: 'fa-solid fa-building',
              testId: 'nav-buildings',
            },
            {
              label: 'Warehouses',
              path: '/sites/warehouses',
              icon: 'fa-solid fa-warehouse',
              testId: 'nav-warehouses',
            },
          ],
        },
        {
          label: 'Network Map',
          path: '/map',
          icon: 'fa-solid fa-map-location-dot',
          testId: 'nav-map',
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          label: 'Alerts',
          path: '/alerts',
          icon: 'fa-solid fa-bell',
          badge: '9',
          testId: 'nav-alerts',
        },
        {
          label: 'Work Orders',
          path: '/tickets',
          icon: 'fa-solid fa-clipboard-list',
          testId: 'nav-work-orders',
        },
        {
          label: 'Maintenance',
          path: '/maintenance',
          icon: 'fa-solid fa-screwdriver-wrench',
          testId: 'nav-maintenance',
        },
      ],
    },
    {
      title: 'Assets',
      items: [
        {
          label: 'Assets',
          path: '/assets',
          icon: 'fa-solid fa-server',
          testId: 'nav-assets',
          children: [
            {
              label: 'Devices',
              path: '/assets/devices',
              icon: 'fa-solid fa-microchip',
              testId: 'nav-assets-devices',
            },
            {
              label: 'Towers',
              path: '/assets/towers',
              icon: 'fa-solid fa-tower-broadcast',
              testId: 'nav-assets-towers',
            },
            {
              label: 'Buildings',
              path: '/assets/buildings',
              icon: 'fa-solid fa-building',
              testId: 'nav-assets-buildings',
            },
            {
              label: 'Warehouses',
              path: '/assets/warehouses',
              icon: 'fa-solid fa-warehouse',
              testId: 'nav-assets-warehouses',
            },
          ],
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          label: 'Admin',
          path: '/admin/overview',
          icon: 'fa-solid fa-shield-halved',
          testId: 'nav-admin',
          children: [
            {
              label: 'Overview',
              path: '/admin/overview',
              icon: 'fa-solid fa-chart-pie',
              testId: 'nav-admin-overview',
              exact: true,
            },
            {
              label: 'Users',
              path: '/admin/users',
              icon: 'fa-solid fa-users',
              testId: 'nav-admin-users',
            },
            {
              label: 'Technicians',
              path: '/admin/technicians',
              icon: 'fa-solid fa-user-gear',
              testId: 'nav-admin-technicians',
            },
            {
              label: 'Roles & Permissions',
              path: '/admin/roles',
              icon: 'fa-solid fa-key',
              testId: 'nav-admin-roles',
            },
            {
              label: 'Rule Engine',
              path: '/admin/rules',
              icon: 'fa-solid fa-code-branch',
              testId: 'nav-admin-rules',
            },
          ],
        },
        {
          label: 'Settings',
          path: '/settings',
          icon: 'fa-solid fa-gear',
          testId: 'nav-settings',
        },
      ],
    },
  ];

  readonly expandedMenus = signal<Record<string, boolean>>({
    '/sites': true,
    '/assets': false,
    '/admin/overview': false,
  });

  toggleMenu(path: string): void {
    this.expandedMenus.update((state) => ({
      ...state,
      [path]: !state[path],
    }));
  }

  toggleSidebar(): void {
    this.preferences.toggleSidebar();
  }

  onNavigate(): void {
    this.navigated.emit();
  }
}