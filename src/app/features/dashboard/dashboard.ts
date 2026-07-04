import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';

import { Site, SiteService } from '../../core/services/site.service';
import { MapComponent } from '../../shared/components/map/map.component';
import { SiteCategory } from '../../core/enums/site-category.enum';

type SiteHealth = 'healthy' | 'warn' | 'critical' | 'offline';

type OperationalSite = Site & {
  health: SiteHealth;
  deviceCount: number;
  fuel: number;
  battery: number;
  temperature: number;
  openAlerts: number;
  openWorkOrders: number;
  lastSeen: string;
};

type DashboardAlert = {
  title: string;
  description: string;
  siteCode: string;
  severity: 'critical' | 'warn' | 'minor' | 'info';
  time: string;
};

type DashboardWorkOrder = {
  id: string;
  title: string;
  siteCode: string;
  engineer: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Completed';
};

@Component({
  selector: 'to-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, MapComponent, ChartModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly siteService = inject(SiteService);

  readonly loading = signal(false);
  readonly sites = signal<Site[]>([]);
  readonly routeCategory = signal<SiteCategory>(SiteCategory.TOWER);
  readonly lastSync = signal(new Date());

  readonly mapCenter: [number, number] = [24.8, 53.8];
  readonly mapZoom = 6;

  readonly category = computed(() => this.routeCategory());
  readonly categoryApi = computed(() => this.category());
  readonly pageTitle = computed(() => `${this.formatCategoryLabel(this.category())} Dashboard`);

  readonly mapSites = computed<OperationalSite[]>(() =>
    this.sites().map((site, index) => ({
      ...site,
      health: this.getSiteHealth(site, index),
      deviceCount: this.metric(index, 12, 36),
      fuel: this.metric(index + 2, 18, 96),
      battery: this.metric(index + 4, 44, 99),
      temperature: this.metric(index + 6, 27, 48),
      openAlerts: this.metric(index + 1, 0, 5),
      openWorkOrders: this.metric(index + 3, 0, 4),
      lastSeen: `${this.metric(index + 1, 1, 12)} min ago`,
    })),
  );

  readonly siteRows = computed(() => this.mapSites());

  readonly healthSummary = computed(() => {
    const sites = this.mapSites();

    return {
      healthy: sites.filter((site) => site.health === 'healthy').length,
      warn: sites.filter((site) => site.health === 'warn').length,
      critical: sites.filter((site) => site.health === 'critical').length,
      offline: sites.filter((site) => site.health === 'offline').length,
    };
  });

  readonly kpis = computed(() => {
    const sites = this.mapSites();
    const health = this.healthSummary();
    const totalDevices = sites.reduce((sum, site) => sum + site.deviceCount, 0);
    const openAlerts = sites.reduce((sum, site) => sum + site.openAlerts, 0);
    const openWorkOrders = sites.reduce((sum, site) => sum + site.openWorkOrders, 0);

    return [
      {
        label: 'Total Sites',
        value: sites.length,
        icon: 'pi pi-map-marker',
        testId: 'kpi-total-sites',
      },
      {
        label: 'Healthy',
        value: health.healthy,
        icon: 'pi pi-check-circle',
        testId: 'kpi-healthy',
      },
      {
        label: 'Warning',
        value: health.warn,
        icon: 'pi pi-exclamation-circle',
        testId: 'kpi-warning',
      },
      {
        label: 'Critical',
        value: health.critical,
        icon: 'pi pi-bolt',
        testId: 'kpi-critical',
      },
      {
        label: 'Open Alerts',
        value: openAlerts,
        icon: 'pi pi-bell',
        testId: 'kpi-open-alerts',
      },
      {
        label: 'Devices Online',
        value: `${Math.max(0, totalDevices - health.offline * 4)}/${totalDevices}`,
        icon: 'pi pi-microchip',
        testId: 'kpi-devices-online',
      },
      {
        label: 'Active Work Orders',
        value: openWorkOrders,
        icon: 'pi pi-wrench',
        testId: 'kpi-work-orders',
      },
    ];
  });

  readonly distribution = computed(() => {
    const health = this.healthSummary();
    const total = this.mapSites().length || 1;

    return [
      {
        label: 'Healthy',
        value: health.healthy,
        tone: 'healthy',
        percent: Math.round((health.healthy / total) * 100),
      },
      {
        label: 'Warning',
        value: health.warn,
        tone: 'warn',
        percent: Math.round((health.warn / total) * 100),
      },
      {
        label: 'Critical',
        value: health.critical,
        tone: 'critical',
        percent: Math.round((health.critical / total) * 100),
      },
      {
        label: 'Offline',
        value: health.offline,
        tone: 'offline',
        percent: Math.round((health.offline / total) * 100),
      },
    ];
  });

  readonly siteHealthChartData = computed(() => {
    const dist = this.distribution();

    return {
      labels: dist.map((item) => item.label),
      datasets: [
        {
          data: dist.map((item) => item.value),
          backgroundColor: ['#34c759', '#ff9500', '#ff3b30', '#8e8e93'],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  });

  readonly siteHealthChartOptions = {
    cutout: '68%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: true,
      },
    },
    maintainAspectRatio: false,
  };

  readonly fuelRows = computed(() =>
    this.mapSites().slice(0, 7).map((site) => ({
      code: site.siteCode,
      name: site.siteName,
      value: site.fuel,
      tone: this.fuelTone(site.fuel),
    })),
  );

  readonly avgFuel = computed(() => {
    const rows = this.fuelRows();

    if (!rows.length) return 0;

    return Math.round(rows.reduce((sum, row) => sum + row.value, 0) / rows.length);
  });

  readonly alarms = computed<DashboardAlert[]>(() => [
    {
      title: 'Generator Failure',
      description: 'Generator did not start during power fallback.',
      siteCode: this.mapSites()[0]?.siteCode ?? 'TW-001',
      severity: 'critical',
      time: '2 min ago',
    },
    {
      title: 'Low Fuel Level',
      description: 'Fuel level dropped below threshold.',
      siteCode: this.mapSites()[1]?.siteCode ?? 'TW-002',
      severity: 'warn',
      time: '12 min ago',
    },
    {
      title: 'High Temperature',
      description: 'Shelter temperature exceeded safe operating range.',
      siteCode: this.mapSites()[2]?.siteCode ?? 'TW-003',
      severity: 'critical',
      time: '28 min ago',
    },
    {
      title: 'Battery Backup Warning',
      description: 'Battery backup duration is below SLA.',
      siteCode: this.mapSites()[3]?.siteCode ?? 'TW-004',
      severity: 'warn',
      time: '45 min ago',
    },
  ]);

  readonly activeWorkOrders = computed<DashboardWorkOrder[]>(() => [
    {
      id: 'WO-10021',
      title: 'Transmitter Inspection',
      siteCode: this.mapSites()[0]?.siteCode ?? 'TW-001',
      engineer: 'Ahmed Ali',
      priority: 'Critical',
      status: 'Assigned',
    },
    {
      id: 'WO-10032',
      title: 'Battery Replacement',
      siteCode: this.mapSites()[1]?.siteCode ?? 'TW-002',
      engineer: 'Mohammed Khan',
      priority: 'High',
      status: 'In Progress',
    },
    {
      id: 'WO-10041',
      title: 'Generator Service',
      siteCode: this.mapSites()[2]?.siteCode ?? 'TW-003',
      engineer: 'John David',
      priority: 'Medium',
      status: 'Pending',
    },
  ]);

  readonly alarmTrendChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        type: 'bar',
        label: 'Critical',
        data: [4, 6, 3, 7, 5, 2, 4],
        backgroundColor: '#ff3b30',
        borderRadius: 2,
      },
      {
        type: 'bar',
        label: 'Major',
        data: [7, 9, 8, 6, 10, 5, 7],
        backgroundColor: '#ff9500',
        borderRadius: 2,
      },
      {
        type: 'bar',
        label: 'Minor',
        data: [12, 10, 14, 11, 9, 8, 12],
        backgroundColor: '#ffcc00',
        borderRadius: 2,
      },
    ],
  };

  readonly alarmTrendChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          color: '#64748b',
          font: {
            size: 11,
            weight: 600,
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  private readonly demoSites: Site[] = [
    {
      id: 9001,
      siteCode: 'TW-UAE-001',
      siteName: 'Dubai Marina Tower',
      category: SiteCategory.TOWER,
      address: {
        street: 'Dubai Marina',
        city: 'Dubai',
        state: 'Dubai',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 25.0800,
      longitude: 55.1400,
      description: 'Telecom tower site in Dubai Marina.',
      enabled: true,
      active: true,
    },
    {
      id: 9002,
      siteCode: 'TW-UAE-002',
      siteName: 'Business Bay Tower',
      category: SiteCategory.TOWER,
      address: {
        street: 'Business Bay',
        city: 'Dubai',
        state: 'Dubai',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 25.1856,
      longitude: 55.2654,
      description: 'Telecom tower site in Business Bay.',
      enabled: true,
      active: true,
    },
    {
      id: 9003,
      siteCode: 'TW-UAE-003',
      siteName: 'Sharjah Industrial Tower',
      category: SiteCategory.TOWER,
      address: {
        street: 'Industrial Area',
        city: 'Sharjah',
        state: 'Sharjah',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 25.3463,
      longitude: 55.4209,
      description: 'Telecom tower site in Sharjah Industrial Area.',
      enabled: true,
      active: true,
    },
    {
      id: 9004,
      siteCode: 'TW-UAE-004',
      siteName: 'Abu Dhabi Central Tower',
      category: SiteCategory.TOWER,
      address: {
        street: 'Corniche Road',
        city: 'Abu Dhabi',
        state: 'Abu Dhabi',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 24.4667,
      longitude: 54.3667,
      description: 'Telecom tower site in Abu Dhabi.',
      enabled: true,
      active: true,
    },
    {
      id: 9005,
      siteCode: 'TW-UAE-005',
      siteName: 'Ajman Coastal Tower',
      category: SiteCategory.TOWER,
      address: {
        street: 'Ajman Corniche',
        city: 'Ajman',
        state: 'Ajman',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 25.4052,
      longitude: 55.5136,
      description: 'Telecom tower site in Ajman.',
      enabled: true,
      active: false,
    },
    {
      id: 9101,
      siteCode: 'TW-QA-001',
      siteName: 'Doha West Bay Tower',
      category: SiteCategory.TOWER,
      address: {
        street: 'West Bay',
        city: 'Doha',
        state: 'Doha',
        postalCode: '00000',
        country: 'Qatar',
      },
      latitude: 25.3284,
      longitude: 51.5310,
      description: 'Telecom tower site in Doha.',
      enabled: true,
      active: true,
    },
    {
      id: 9102,
      siteCode: 'TW-QA-002',
      siteName: 'Lusail Marina Tower',
      category: SiteCategory.TOWER,
      address: {
        street: 'Lusail Marina',
        city: 'Lusail',
        state: 'Al Daayen',
        postalCode: '00000',
        country: 'Qatar',
      },
      latitude: 25.4173,
      longitude: 51.5113,
      description: 'Telecom tower site in Lusail.',
      enabled: true,
      active: true,
    },
    {
      id: 9201,
      siteCode: 'BL-UAE-001',
      siteName: 'Abu Dhabi Central Building',
      category: SiteCategory.BUILDING,
      address: {
        street: 'Al Danah',
        city: 'Abu Dhabi',
        state: 'Abu Dhabi',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 24.4870,
      longitude: 54.3570,
      description: 'Smart building monitoring site.',
      enabled: true,
      active: true,
    },
    {
      id: 9202,
      siteCode: 'BL-QA-001',
      siteName: 'Lusail Smart Building',
      category: SiteCategory.BUILDING,
      address: {
        street: 'Lusail Boulevard',
        city: 'Lusail',
        state: 'Al Daayen',
        postalCode: '00000',
        country: 'Qatar',
      },
      latitude: 25.4200,
      longitude: 51.5150,
      description: 'Smart building monitoring site in Lusail.',
      enabled: true,
      active: true,
    },
    {
      id: 9301,
      siteCode: 'WH-UAE-001',
      siteName: 'Jebel Ali Warehouse',
      category: SiteCategory.WAREHOUSE,
      address: {
        street: 'Jebel Ali Free Zone',
        city: 'Dubai',
        state: 'Dubai',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 24.9857,
      longitude: 55.0273,
      description: 'Warehouse infrastructure monitoring site.',
      enabled: true,
      active: true,
    },
    {
      id: 9401,
      siteCode: 'GEN-UAE-001',
      siteName: 'Dubai Generator Station',
      category: SiteCategory.GENERATOR,
      address: {
        street: 'Al Quoz',
        city: 'Dubai',
        state: 'Dubai',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 25.1320,
      longitude: 55.2260,
      description: 'Generator monitoring site.',
      enabled: true,
      active: true,
    },
  ];

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.routeCategory.set(this.resolveCategory(params.get('category')));
      this.loadSites();
    });
  }

  async loadSites(): Promise<void> {
    try {
      this.loading.set(true);

      const response = await firstValueFrom(
        this.siteService.getByCategory(this.categoryApi()),
      );

      const apiSites = response.data ?? [];
      const validApiSites = apiSites.filter(
        (site) =>
          Number.isFinite(Number(site.latitude)) &&
          Number.isFinite(Number(site.longitude)),
      );

      const fallbackSites = this.demoSites.filter(
        (site) => site.category === this.categoryApi(),
      );

      this.sites.set(validApiSites.length ? validApiSites : fallbackSites);
      this.lastSync.set(new Date());
    } catch (error) {
      console.error('Dashboard site loading failed:', error);

      this.sites.set(
        this.demoSites.filter((site) => site.category === this.categoryApi()),
      );

      this.lastSync.set(new Date());
    } finally {
      this.loading.set(false);
    }
  }

  refreshDashboard(): void {
    this.loadSites();
  }

  openSite(site: { id: number | string }): void {
    this.router.navigate(['/sites', site.id]);
  }

  onMarkerSelected(site: { id: number | string }): void {
    this.openSite(site);
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  viewAlerts(): void {
    this.router.navigate(['/alerts']);
  }

  viewWorkOrders(): void {
    this.router.navigate(['/work-orders']);
  }

  viewMonitoring(): void {
    this.router.navigate(['/monitoring']);
  }

  severityTag(
    severity: string,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    if (severity === 'critical') return 'danger';
    if (severity === 'warn' || severity === 'minor') return 'warn';
    if (severity === 'info') return 'info';
    return 'secondary';
  }

  statusSeverity(
    status: DashboardWorkOrder['status'],
  ): 'success' | 'secondary' | 'info' | 'warn' {
    if (status === 'Completed') return 'success';
    if (status === 'In Progress') return 'info';
    if (status === 'Assigned') return 'secondary';
    return 'warn';
  }

  siteHealthLabel(health: SiteHealth): string {
    if (health === 'healthy') return 'Healthy';
    if (health === 'warn') return 'Warning';
    if (health === 'critical') return 'Critical';
    return 'Offline';
  }

  siteHealthSeverity(
    health: SiteHealth,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    if (health === 'healthy') return 'success';
    if (health === 'warn') return 'warn';
    if (health === 'critical') return 'danger';
    return 'secondary';
  }

  fuelTone(value: number): string {
    if (value < 35) return 'critical';
    if (value < 55) return 'warn';
    return 'healthy';
  }

  formatLastSync(): string {
    return this.lastSync().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCategoryLabel(category: SiteCategory): string {
    return category
      .toLowerCase()
      .split('_')
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
      .join(' ');
  }

  private resolveCategory(value: string | null): SiteCategory {
    const normalized = value?.toUpperCase() as SiteCategory | undefined;

    if (normalized && Object.values(SiteCategory).includes(normalized)) {
      return normalized;
    }

    return SiteCategory.TOWER;
  }

  private getSiteHealth(site: Site, index: number): SiteHealth {
    if (!site.enabled || !site.active) {
      return 'offline';
    }

    const pattern = index % 8;

    if (pattern === 3) return 'critical';
    if (pattern === 1 || pattern === 5) return 'warn';

    return 'healthy';
  }

  private metric(seed: number, min: number, max: number): number {
    const range = max - min + 1;
    return min + ((seed * 17 + 13) % range);
  }
}