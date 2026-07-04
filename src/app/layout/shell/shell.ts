import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

type UserType = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'CUSTOMER';

type NavItem = {
  label: string;
  route: string;
  icon: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

@Component({
  selector: 'to-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly currentUrl = signal(this.router.url);

  readonly username = this.auth.username;
  readonly tenantId = this.auth.tenantId;

  // Add userType signal in AuthService.
  readonly userType = this.auth.userType;

  readonly isSuperAdmin = computed(
    () =>
      this.userType() === 'SUPER_ADMIN' ||
      this.tenantId() === 'DEFAULT' ||
      this.auth.hasAnyRole(['SUPER_ADMIN']),
  );

  readonly isTechnician = computed(() => this.userType() === 'TECHNICIAN');

  readonly navGroups = computed<NavGroup[]>(() => {
    if (this.isTechnician()) {
      return [
        {
          title: 'My Work',
          items: [
            { label: 'My Dashboard', route: '/technician-dashboard', icon: 'pi pi-home' },
            { label: 'My Work Orders', route: '/work-orders', icon: 'pi pi-wrench' },
            { label: 'Notifications', route: '/notifications', icon: 'pi pi-bell' },
          ],
        },
      ];
    }

    if (this.isSuperAdmin()) {
      return [
        {
          title: 'Overview',
          items: [
            { label: 'Platform Dashboard', route: '/platform-dashboard', icon: 'pi pi-th-large' },
            { label: 'Global Map', route: '/map', icon: 'pi pi-map' },
            { label: 'Global Monitoring', route: '/monitoring', icon: 'pi pi-chart-line' },
          ],
        },
        {
          title: 'Tenant Management',
          items: [
            { label: 'Tenants', route: '/tenants', icon: 'pi pi-briefcase' },
          ],
        },
        {
          title: 'Operations',
          items: [
            { label: 'Work Orders', route: '/work-orders', icon: 'pi pi-wrench' },
          ],
        },
        {
          title: 'People & Access',
          items: [
            { label: 'Users', route: '/users', icon: 'pi pi-user' },
            { label: 'Roles', route: '/roles', icon: 'pi pi-lock' },
          ],
        },
        {
          title: 'Monitoring',
          items: [
            { label: 'Alerts', route: '/alerts', icon: 'pi pi-bell' },
            { label: 'Rules', route: '/rules', icon: 'pi pi-sitemap' },
          ],
        },
        {
          title: 'System',
          items: [
            { label: 'Notification Configs', route: '/notifications', icon: 'pi pi-send' },
          ],
        },
      ];
    }

    return [
      {
        title: 'Overview',
        items: [
          { label: 'Site Categories', route: '/site-category-selection', icon: 'pi pi-th-large' },
          { label: 'Network Map', route: '/map', icon: 'pi pi-map' },
          { label: 'Monitoring', route: '/monitoring', icon: 'pi pi-chart-line' },
        ],
      },
      {
        title: 'Site Management',
        items: [
          { label: 'Sites', route: '/sites', icon: 'pi pi-building' },
          { label: 'Devices', route: '/devices', icon: 'pi pi-microchip' },
        ],
      },
      {
        title: 'Monitoring',
        items: [
          { label: 'Alerts', route: '/alerts', icon: 'pi pi-bell' },
          { label: 'Rules', route: '/rules', icon: 'pi pi-sitemap' },
        ],
      },
      {
        title: 'Operations',
        items: [
          { label: 'Work Orders', route: '/work-orders', icon: 'pi pi-wrench' },
          { label: 'Maintenance', route: '/maintenance', icon: 'pi pi-cog' },
        ],
      },
      {
        title: 'People & Access',
        items: [
          { label: 'Users', route: '/users', icon: 'pi pi-user' },
          { label: 'Roles', route: '/roles', icon: 'pi pi-lock' },
          { label: 'Technicians', route: '/technicians', icon: 'pi pi-users' },
        ],
      },
      {
        title: 'System',
        items: [
          { label: 'Notification Configs', route: '/notifications', icon: 'pi pi-send' },
        ],
      },
    ];
  });

  readonly visibleGroups = computed(() =>
    this.navGroups().filter((group) => group.items.length),
  );

  readonly pageTitle = computed(() => {
    const url = this.currentUrl().split('?')[0];

    const item = this.navGroups()
      .flatMap((group) => group.items)
      .find((nav) => nav.route === url);

    return item?.label ?? 'Dashboard';
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.mobileOpen.set(false);
      });
  }

  createAction(): void {
    if (this.isSuperAdmin()) {
      this.router.navigate(['/tenants'], {
        queryParams: { action: 'create' },
      });
      return;
    }

    this.router.navigate(['/sites'], {
      queryParams: { action: 'create' },
    });
  }

  isExactRoute(route: string): boolean {
    return [
      '/dashboard',
      '/platform-dashboard',
      '/technician-dashboard',
      '/site-category-selection',
    ].includes(route);
  }

  toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  toggleMobile(): void {
    this.mobileOpen.update((value) => !value);
  }

  logout(): void {
    this.auth.logout();
  }
}