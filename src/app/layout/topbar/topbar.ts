import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
<<<<<<< HEAD
import { NavigationEnd, Router, RouterLink } from '@angular/router';

import { filter, Subscription } from 'rxjs';

import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

import { ThemeService } from '../../core/services/theme.service';

type Breadcrumb = {
  label: string;
};

type MegaMenuItem = {
  label: string;
  description: string;
  icon: string;
  path: string;
  testId: string;
};

type MegaMenuGroup = {
  title: string;
  items: MegaMenuItem[];
};
=======
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { NavigationService } from '../../core/interceptors/navigation.service';
>>>>>>> 07f97517238968882332611f88686810fc127484

@Component({
  selector: 'to-topbar',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterLink, MenuModule],
=======
  imports: [CommonModule],
>>>>>>> 07f97517238968882332611f88686810fc127484
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  readonly navigation = inject(NavigationService);

<<<<<<< HEAD
  readonly breadcrumbs = signal<Breadcrumb[]>([]);
  readonly megaMenuOpen = signal(false);

  readonly selectedTenant = signal('du Telecom NOC');
  readonly selectedSite = signal('UAE Towers');

  private routerSub?: Subscription;

  readonly tenantMenuItems: MenuItem[] = [
    {
      label: 'du Telecom NOC',
      icon: 'pi pi-building',
      command: () => this.selectedTenant.set('du Telecom NOC'),
    },
    {
      label: 'Etisalat UAE',
      icon: 'pi pi-building-columns',
      command: () => this.selectedTenant.set('Etisalat UAE'),
    },
    {
      label: 'TowerOps Demo',
      icon: 'pi pi-desktop',
      command: () => this.selectedTenant.set('TowerOps Demo'),
    },
  ];

  readonly megaMenuGroups: MegaMenuGroup[] = [
    {
      title: 'Workspace',
      items: [
        {
          label: 'Dashboard',
          description: 'Selected site overview',
          icon: 'fa-solid fa-chart-line',
          path: '/dashboard/towers',
          testId: 'mega-dashboard',
        },
        {
          label: 'Sites',
          description: 'Towers, buildings and warehouses',
          icon: 'fa-solid fa-location-dot',
          path: '/sites',
          testId: 'mega-sites',
        },
        {
          label: 'Network Map',
          description: 'Live site map view',
          icon: 'fa-solid fa-map-location-dot',
          path: '/map',
          testId: 'mega-map',
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          label: 'Alerts',
          description: 'Raised sensor events',
          icon: 'fa-solid fa-bell',
          path: '/alerts',
          testId: 'mega-alerts',
        },
        {
          label: 'Alarms',
          description: 'Converted operational alarms',
          icon: 'fa-solid fa-triangle-exclamation',
          path: '/alarms',
          testId: 'mega-alarms',
        },
        {
          label: 'Tickets',
          description: 'Fault tickets',
          icon: 'fa-solid fa-ticket',
          path: '/tickets',
          testId: 'mega-tickets',
        },
        {
          label: 'Work Orders',
          description: 'Technician assignment flow',
          icon: 'fa-solid fa-clipboard-list',
          path: '/work-orders',
          testId: 'mega-work-orders',
        },
        {
          label: 'Maintenance',
          description: 'Planned service activity',
          icon: 'fa-solid fa-screwdriver-wrench',
          path: '/maintenance',
          testId: 'mega-maintenance',
        },
      ],
    },
    {
      title: 'Assets',
      items: [
        {
          label: 'Devices',
          description: 'IoT and field devices',
          icon: 'fa-solid fa-microchip',
          path: '/assets/devices',
          testId: 'mega-devices',
        },
        {
          label: 'Towers',
          description: 'Tower asset registry',
          icon: 'fa-solid fa-tower-cell',
          path: '/assets/towers',
          testId: 'mega-assets-towers',
        },
        {
          label: 'Buildings',
          description: 'Building sites',
          icon: 'fa-solid fa-building',
          path: '/assets/buildings',
          testId: 'mega-buildings',
        },
        {
          label: 'Warehouses',
          description: 'Warehouse sites',
          icon: 'fa-solid fa-warehouse',
          path: '/assets/warehouses',
          testId: 'mega-warehouses',
        },
      ],
    },
    {
      title: 'Admin',
      items: [
        {
          label: 'Overview',
          description: 'Admin summary',
          icon: 'fa-solid fa-chart-pie',
          path: '/admin/overview',
          testId: 'mega-admin-overview',
        },
        {
          label: 'Users',
          description: 'User access management',
          icon: 'fa-solid fa-users',
          path: '/admin/users',
          testId: 'mega-admin-users',
        },
        {
          label: 'Technicians',
          description: 'Field workforce profiles',
          icon: 'fa-solid fa-user-gear',
          path: '/admin/technicians',
          testId: 'mega-admin-technicians',
        },
        {
          label: 'Roles & Permissions',
          description: 'RBAC configuration',
          icon: 'fa-solid fa-key',
          path: '/admin/roles',
          testId: 'mega-admin-roles',
        },
        {
          label: 'Rule Engine',
          description: 'Sensor condition rules',
          icon: 'fa-solid fa-code-branch',
          path: '/admin/rules',
          testId: 'mega-admin-rules',
        },
      ],
    },
  ];

  ngOnInit(): void {
    this.updateBreadcrumbs();
=======
  @Output() readonly mobileMenu = new EventEmitter<void>();

  private routerSub?: Subscription;

  readonly navigatorOpen = signal(false);
  readonly breadcrumbs = signal<string[]>(['TowerOps', 'Dashboard']);

  readonly filteredGroups = this.navigation.filteredGroups;

  ngOnInit(): void {
    this.setBreadcrumbs();
>>>>>>> 07f97517238968882332611f88686810fc127484

    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
<<<<<<< HEAD
        this.updateBreadcrumbs();
        this.megaMenuOpen.set(false);
      });
  }

  navigateTo(path: string): void {
    this.megaMenuOpen.set(false);
    this.router.navigateByUrl(path);
=======
        this.closeNavigator();
        this.setBreadcrumbs();
      });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeNavigator();
  }

  toggleNavigator(event?: MouseEvent): void {
    event?.stopPropagation();
    this.navigatorOpen.update((open) => !open);
  }

  openMobileMenu(): void {
    this.mobileMenu.emit();
>>>>>>> 07f97517238968882332611f88686810fc127484
  }

  closeNavigator(): void {
    this.navigatorOpen.set(false);
    this.navigation.clearSearch();
  }

<<<<<<< HEAD
  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      return;
    }

    document.exitFullscreen?.();
=======
  onSearch(value: string): void {
    this.navigation.setSearch(value);
  }

  navigate(path: string): void {
    this.closeNavigator();
    this.router.navigateByUrl(path);
  }

  private setBreadcrumbs(): void {
    this.breadcrumbs.set(this.navigation.getBreadcrumbs(this.router.url));
>>>>>>> 07f97517238968882332611f88686810fc127484
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url.split('?')[0].split('#')[0];

    if (url.startsWith('/dashboard')) {
      this.breadcrumbs.set([
        { label: 'TowerOps' },
        { label: 'Dashboard' },
        { label: this.selectedSite() },
      ]);
      return;
    }

    if (url.startsWith('/sites/')) {
      this.breadcrumbs.set([
        { label: 'TowerOps' },
        { label: 'Sites' },
        { label: 'Details' },
      ]);
      return;
    }

    if (url.startsWith('/assets/')) {
      const label = this.toTitle(url.split('/').at(-1) ?? 'Assets');

      this.breadcrumbs.set([
        { label: 'TowerOps' },
        { label: 'Assets' },
        { label },
      ]);
      return;
    }

    const map: Record<string, Breadcrumb[]> = {
      '/sites': [{ label: 'TowerOps' }, { label: 'Sites' }],
      '/map': [{ label: 'TowerOps' }, { label: 'Network Map' }],

      '/alerts': [
        { label: 'TowerOps' },
        { label: 'Operations' },
        { label: 'Alerts' },
      ],
      '/alarms': [
        { label: 'TowerOps' },
        { label: 'Operations' },
        { label: 'Alarms' },
      ],
      '/tickets': [
        { label: 'TowerOps' },
        { label: 'Operations' },
        { label: 'Tickets' },
      ],
      '/work-orders': [
        { label: 'TowerOps' },
        { label: 'Operations' },
        { label: 'Work Orders' },
      ],
      '/maintenance': [
        { label: 'TowerOps' },
        { label: 'Operations' },
        { label: 'Maintenance' },
      ],

      '/assets': [{ label: 'TowerOps' }, { label: 'Assets' }],

      '/admin/overview': [
        { label: 'TowerOps' },
        { label: 'Admin' },
        { label: 'Overview' },
      ],
      '/admin/users': [
        { label: 'TowerOps' },
        { label: 'Admin' },
        { label: 'Users' },
      ],
      '/admin/technicians': [
        { label: 'TowerOps' },
        { label: 'Admin' },
        { label: 'Technicians' },
      ],
      '/admin/roles': [
        { label: 'TowerOps' },
        { label: 'Admin' },
        { label: 'Roles & Permissions' },
      ],
      '/admin/rules': [
        { label: 'TowerOps' },
        { label: 'Admin' },
        { label: 'Rule Engine' },
      ],

      '/settings': [{ label: 'TowerOps' }, { label: 'Settings' }],
    };

    this.breadcrumbs.set(
      map[url] ?? [{ label: 'TowerOps' }, { label: 'Workspace' }],
    );
  }

  private toTitle(value: string): string {
    return value
      .replaceAll('-', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
