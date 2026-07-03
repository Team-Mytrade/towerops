import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { AccessService } from '../../core/services/access.service';

type NavItem = {
  label: string;
  route: string;
  icon: string;
  permission?: string;
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
  private readonly permission = inject(AccessService);

  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly currentUrl = signal(this.router.url);

  readonly username = this.auth.username;
  readonly tenantId = this.auth.tenantId;

 readonly isSuperAdmin = computed(() => this.tenantId() === 'DEFAULT');

readonly navGroups = computed<NavGroup[]>(() => {
  const isSuperAdmin = this.isSuperAdmin();

  if (isSuperAdmin) {
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
          { label: 'Permissions', route: '/permissions', icon: 'pi pi-key' },
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
        { label: 'Device Models', route: '/device-models', icon: 'pi pi-box' },
        { label: 'Device Credentials', route: '/device-credentials', icon: 'pi pi-shield' },
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
        { label: 'Permissions', route: '/permissions', icon: 'pi pi-key' },
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
createTenant(): void {
  this.router.navigate(['/tenants'], {
    queryParams: { action: 'create' },
  });
}

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.mobileOpen.set(false);
      });
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