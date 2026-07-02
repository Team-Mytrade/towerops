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

  readonly navGroups: NavGroup[] = [
    {
      title: 'Command',
      items: [
        { label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home' },
        { label: 'Network Map', route: '/map', icon: 'pi pi-map', permission: 'map:view' },
      ],
    },
    {
      title: 'Infrastructure',
      items: [
        { label: 'Sites', route: '/sites', icon: 'pi pi-building', permission: 'sites:view' },
        { label: 'Devices', route: '/devices', icon: 'pi pi-microchip', permission: 'devices:view' },
        {
          label: 'Device Models',
          route: '/device-models',
          icon: 'pi pi-box',
          permission: 'device-models:view',
        },
      ],
    },
    {
      title: 'Monitoring',
      items: [
        { label: 'Monitoring', route: '/monitoring', icon: 'pi pi-chart-line', permission: 'monitoring:view' },
        { label: 'Alerts', route: '/alerts', icon: 'pi pi-bell', permission: 'alerts:view' },
        { label: 'Rules', route: '/rules', icon: 'pi pi-sitemap', permission: 'rules:view' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Tickets', route: '/tickets', icon: 'pi pi-ticket', permission: 'tickets:view' },
        {
          label: 'Work Orders',
          route: '/work-orders',
          icon: 'pi pi-wrench',
          permission: 'work-orders:view',
        },
        {
          label: 'Maintenance',
          route: '/maintenance',
          icon: 'pi pi-cog',
          permission: 'maintenance:view',
        },
        {
          label: 'Approvals',
          route: '/approvals',
          icon: 'pi pi-check-circle',
          permission: 'approvals:view',
        },
      ],
    },
    {
      title: 'Workforce',
      items: [
        { label: 'Technicians', route: '/technicians', icon: 'pi pi-users', permission: 'technicians:view' },
        { label: 'Users', route: '/users', icon: 'pi pi-user', permission: 'users:view' },
        { label: 'Roles', route: '/roles', icon: 'pi pi-lock', permission: 'roles:view' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Tenants', route: '/tenants', icon: 'pi pi-briefcase', permission: 'tenants:view' },
        {
          label: 'Notifications',
          route: '/notifications',
          icon: 'pi pi-send',
          permission: 'notifications:view',
        },
        {
          label: 'Configurations',
          route: '/configurations',
          icon: 'pi pi-sliders-h',
          permission: 'configurations:view',
        },
        {
          label: 'Audit Logs',
          route: '/audit-logs',
          icon: 'pi pi-history',
          permission: 'audit-logs:view',
        },
      ],
    },
  ];
createTenant(): void {
  this.router.navigate(['/tenants'], {
    queryParams: { action: 'create' },
  });
}
  readonly visibleGroups = computed(() =>
    this.navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => !item.permission || this.permission.hasPermission(item.permission),
        ),
      }))
      .filter((group) => group.items.length),
  );

  readonly pageTitle = computed(() => {
    const url = this.currentUrl().split('?')[0];

    const item = this.navGroups
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