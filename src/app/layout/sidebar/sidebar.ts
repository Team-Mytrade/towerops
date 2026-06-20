import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TooltipModule } from 'primeng/tooltip';

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
  readonly navigated = output<void>();

  readonly collapsed = signal(false);

  activeTenant = 'du Telecom NOC';

  navGroups: NavGroup[] = [
  {
    title: 'Operations',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'fa-solid fa-chart-line',
        testId: 'nav-dashboard',
        exact: true,
      },
      {
        label: 'Sites',
        path: '/sites',
        icon: 'fa-solid fa-tower-broadcast',
        testId: 'nav-sites',
        children: [
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
        icon: 'fa-solid fa-ticket',
        testId: 'nav-tickets',
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Engineers',
        path: '/engineers',
        icon: 'fa-solid fa-user-gear',
        testId: 'nav-engineers',
      },
      {
        label: 'Assets',
        path: '/assets',
        icon: 'fa-solid fa-server',
        testId: 'nav-assets',
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
});

toggleMenu(path: string): void {
  this.expandedMenus.update(state => ({
    ...state,
    [path]: !state[path],
  }));
}

  toggleSidebar(): void {
    this.collapsed.update((value) => !value);
  }

  onNavigate(): void {
    this.navigated.emit();
  }
}