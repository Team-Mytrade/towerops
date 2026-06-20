import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';

import { filter, Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

import { ThemeService } from '../../core/services/theme.service';
import { PageHeader } from '../../shared/components/page-header/page-header';

type TowerLocation = {
  name: string;
  region: string;
  towerCount: number;
  criticalCount: number;
};

type PageMeta = {
  title: string;
  subtitle: string;
};

@Component({
  selector: 'to-topbar',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
    DatePipe,
    SelectModule,
    FormsModule,
    ButtonModule,
    PageHeader,
    MenuModule,
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);

  readonly mobileMenuClick = output<void>();

  pageTitle = 'NOC Command Center';
  subtitle = 'Live telecom tower monitoring and operations overview';

  alertCount = signal(1);
  now = signal(new Date());
  isFullscreen = signal(false);
  isSiteSelector = signal(false);

  selectedTenant = 'du Telecom NOC';

  tenantMenuItems: MenuItem[] = [
    {
      label: 'du Telecom NOC',
      icon: 'pi pi-building',
      command: () => (this.selectedTenant = 'du Telecom NOC'),
    },
    {
      label: 'Etisalat UAE',
      icon: 'pi pi-building-columns',
      command: () => (this.selectedTenant = 'Etisalat UAE'),
    },
    {
      label: 'TowerOps Demo Tenant',
      icon: 'pi pi-desktop',
      command: () => (this.selectedTenant = 'TowerOps Demo Tenant'),
    },
  ];

  locations: TowerLocation[] = [
    {
      name: 'Chennai Network',
      region: 'Tamil Nadu, India',
      towerCount: 24,
      criticalCount: 1,
    },
    {
      name: 'Bangalore Network',
      region: 'Karnataka, India',
      towerCount: 18,
      criticalCount: 2,
    },
    {
      name: 'Hyderabad Network',
      region: 'Telangana, India',
      towerCount: 21,
      criticalCount: 0,
    },
    {
      name: 'Mumbai Network',
      region: 'Maharashtra, India',
      towerCount: 32,
      criticalCount: 4,
    },
  ];

  selectedLocation: TowerLocation = this.locations[0];

  private timerId?: ReturnType<typeof setInterval>;
  private routerSub?: Subscription;

  private readonly routeMeta: Record<string, PageMeta> = {
    '/dashboard': {
      title: 'NOC Command Center',
      subtitle: 'Live telecom tower monitoring and operations overview',
    },
    '/sites': {
      title: 'Sites',
      subtitle: 'Select a tenant workspace or operational site',
    },
    '/map': {
      title: 'Network Map',
      subtitle: 'Live tower locations, health status and active alarms',
    },
    '/alerts': {
      title: 'Alerts',
      subtitle: 'Critical alarms, threshold breaches and system events',
    },
    '/tickets': {
      title: 'Work Orders',
      subtitle: 'Track fault tickets from assignment to closure',
    },
    '/engineers': {
      title: 'Field Engineers',
      subtitle: 'Engineer availability, assignments and field activity',
    },
    '/assets': {
      title: 'Asset Registry',
      subtitle: '234 devices across the network',
    },
    '/settings': {
      title: 'Settings',
      subtitle: 'Tenant branding, appearance and user access',
    },
  };

  ngOnInit(): void {
    this.updatePageState();

    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageState();
      });

    this.timerId = setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  private updatePageState(): void {
    const cleanUrl = this.getCleanUrl(this.router.url);
    const meta = this.getPageMeta(cleanUrl);

    this.pageTitle = meta.title;
    this.subtitle = meta.subtitle;
    this.isSiteSelector.set(cleanUrl === '/sites');
  }

  private getCleanUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }

  private getPageMeta(url: string): PageMeta {
    if (this.routeMeta[url]) {
      return this.routeMeta[url];
    }

    const matchedRoute = Object.keys(this.routeMeta)
      .sort((a, b) => b.length - a.length)
      .find((route) => url.startsWith(route));

    return matchedRoute
      ? this.routeMeta[matchedRoute]
      : {
          title: 'TowerOps',
          subtitle: 'Telecom tower operations platform',
        };
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      this.isFullscreen.set(true);
      return;
    }

    this.isFullscreen.set(false);
    document.exitFullscreen?.();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();

    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}