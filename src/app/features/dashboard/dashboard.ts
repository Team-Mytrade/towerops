import { CommonModule, TitleCasePipe } from '@angular/common';
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

import { Site, SiteCategory, SiteService } from '../../core/services/site.service';
import { MapComponent } from '../../shared/components/map/map.component';

type SiteCategoryKey = 'tower' | 'building' | 'warehouse';

@Component({
  selector: 'to-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TitleCasePipe,
    MapComponent,
    ChartModule,
  ],
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

  readonly category = computed<SiteCategoryKey>(() => {
    const value = this.route.snapshot.paramMap.get('category')?.toLowerCase();

    if (value === 'building') return 'building';
    if (value === 'warehouse') return 'warehouse';

    return 'tower';
  });

  readonly categoryApi = computed<SiteCategory>(() => {
    if (this.category() === 'building') return 'BUILDING';
    if (this.category() === 'warehouse') return 'WAREHOUSE';

    return 'TOWER';
  });

  readonly pageTitle = computed(() => `${this.category()} Dashboard`);

  readonly kpis = computed(() => {
    const sites = this.sites();
    const healthy = sites.filter((site) => site.enabled && site.active).length;
    const offline = sites.filter((site) => !site.enabled || !site.active).length;

    return [
      {
        label: 'Total Sites',
        value: sites.length,
        icon: 'pi pi-map-marker',
        testId: 'kpi-total-sites',
      },
      {
        label: 'Healthy',
        value: healthy,
        icon: 'pi pi-bolt',
        testId: 'kpi-healthy',
      },
      {
        label: 'Critical',
        value: 2,
        icon: 'pi pi-bell',
        testId: 'kpi-critical',
      },
      {
        label: 'Open Alarms',
        value: 8,
        icon: 'pi pi-exclamation-triangle',
        testId: 'kpi-open-alarms',
      },
      {
        label: 'Open Tickets',
        value: 5,
        icon: 'pi pi-ticket',
        testId: 'kpi-open-tickets',
      },
      {
        label: 'Devices Online',
        value: `${Math.max(0, sites.length * 8 - offline)}/${sites.length * 8 || 0}`,
        icon: 'pi pi-microchip',
        testId: 'kpi-devices-online',
      },
    ];
  });

  readonly distribution = computed(() => {
    const sites = this.sites();
    const total = sites.length || 1;
    const healthy = sites.filter((site) => site.enabled && site.active).length;
    const offline = sites.filter((site) => !site.enabled || !site.active).length;

    return [
      {
        label: 'Healthy',
        value: healthy,
        tone: 'healthy',
        percent: Math.round((healthy / total) * 100),
      },
      {
        label: 'warn',
        value: 2,
        tone: 'warn',
        percent: 18,
      },
      {
        label: 'Critical',
        value: 2,
        tone: 'critical',
        percent: 14,
      },
      {
        label: 'Offline',
        value: offline,
        tone: 'offline',
        percent: Math.round((offline / total) * 100),
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

  readonly alarms = [
    {
      title: 'Power Failure',
      description: 'Mains power outage detected, running on backup.',
      severity: 'critical',
    },
    {
      title: 'Low Fuel Level',
      description: 'Generator fuel below 20% threshold.',
      severity: 'warn',
    },
    {
      title: 'High Temperature Alert',
      description: 'Device temperature exceeded threshold.',
      severity: 'critical',
    },
    {
      title: 'Maintenance Due',
      description: 'Scheduled maintenance window approaching.',
      severity: 'minor',
    },
    {
      title: 'Firmware Update Available',
      description: 'New firmware version available for installation.',
      severity: 'info',
    },
  ];

  readonly fuelRows = computed(() =>
    this.sites().slice(0, 8).map((site, index) => ({
      code: site.siteCode,
      value: [64, 72, 81, 28, 75, 86, 58, 67][index] ?? 66,
    })),
  );

  readonly avgFuel = computed(() => {
    const rows = this.fuelRows();

    if (!rows.length) return 0;

    return Math.round(rows.reduce((sum, row) => sum + row.value, 0) / rows.length);
  });

  private readonly demoSites: Site[] = [
    {
      id: 9001,
      siteCode: 'TW-UAE-001',
      siteName: 'Dubai Marina Tower',
      category: 'TOWER',
      address: {
        street: 'Dubai Marina',
        city: 'Dubai',
        state: 'Dubai',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 25.08,
      longitude: 55.14,
      description: 'Demo telecom tower site in Dubai Marina.',
      enabled: true,
      active: true,
    },
    {
      id: 9002,
      siteCode: 'TW-UAE-002',
      siteName: 'Abu Dhabi Corniche Tower',
      category: 'TOWER',
      address: {
        street: 'Corniche Road',
        city: 'Abu Dhabi',
        state: 'Abu Dhabi',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 24.4667,
      longitude: 54.3667,
      description: 'Demo tower site in Abu Dhabi.',
      enabled: true,
      active: true,
    },
    {
      id: 9003,
      siteCode: 'TW-UAE-003',
      siteName: 'Sharjah Industrial Tower',
      category: 'TOWER',
      address: {
        street: 'Industrial Area',
        city: 'Sharjah',
        state: 'Sharjah',
        postalCode: '00000',
        country: 'UAE',
      },
      latitude: 25.3463,
      longitude: 55.4209,
      description: 'Demo tower site in Sharjah.',
      enabled: true,
      active: true,
    },
    {
      id: 9101,
      siteCode: 'TW-QA-001',
      siteName: 'Doha West Bay Tower',
      category: 'TOWER',
      address: {
        street: 'West Bay',
        city: 'Doha',
        state: 'Doha',
        postalCode: '00000',
        country: 'Qatar',
      },
      latitude: 25.3284,
      longitude: 51.531,
      description: 'Demo telecom tower site in Doha.',
      enabled: true,
      active: false,
    },
    {
      id: 9102,
      siteCode: 'TW-QA-002',
      siteName: 'Lusail Marina Tower',
      category: 'TOWER',
      address: {
        street: 'Lusail Marina',
        city: 'Lusail',
        state: 'Al Daayen',
        postalCode: '00000',
        country: 'Qatar',
      },
      latitude: 25.4173,
      longitude: 51.5113,
      description: 'Demo tower site in Lusail.',
      enabled: true,
      active: true,
    },
  ];

  constructor() {
    this.loadSites();
  }

  async loadSites(): Promise<void> {
    try {
      this.loading.set(true);

      const response = await firstValueFrom(
        this.siteService.getByCategory(this.categoryApi()),
      );

      const apiSites = response.data ?? [];
      const validApiSites = apiSites.filter(
        (site) => Number.isFinite(site.latitude) && Number.isFinite(site.longitude),
      );

      const fallbackSites = this.demoSites.filter(
        (site) => site.category === this.categoryApi(),
      );

      this.sites.set(validApiSites.length ? validApiSites : fallbackSites);
    } finally {
      this.loading.set(false);
    }
  }

  openSite(site: Site): void {
    this.router.navigate(['/sites', site.id]);
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  severityClass(severity: string): string {
    return `to-severity--${severity}`;
  }

  severityTag(severity: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    if (severity === 'critical') return 'danger';
    if (severity === 'warn' || severity === 'minor') return 'warn';
    if (severity === 'info') return 'info';
    return 'secondary';
  }

  fuelTone(value: number): string {
    if (value < 35) return 'critical';
    if (value < 55) return 'warn';
    return 'healthy';
  }
}