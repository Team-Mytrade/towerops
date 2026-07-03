import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { MapComponent, MapSite } from '../../shared/components/map/map.component';

type PlatformSiteStatus = 'Healthy' | 'warn' | 'Critical' | 'Offline';

type PlatformSite = MapSite & {
  tenantName: string;
  category: 'TOWER' | 'BUILDING' | 'WAREHOUSE';
  city: string;
  country: string;
  status: PlatformSiteStatus;
  devices: number;
  active: boolean;
  enabled: boolean;
};

@Component({
  selector: 'to-platform-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, MapComponent],
  templateUrl: './platform-dashboard.component.html',
  styleUrl: './platform-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformDashboardComponent {
  readonly sites = signal<PlatformSite[]>([
    {
      id: 1,
      tenantName: 'ALG Telecom',
      siteName: 'Dubai Marina Tower',
      siteCode: 'TW-001',
      category: 'TOWER',
      city: 'Dubai',
      country: 'UAE',
      status: 'Healthy',
      devices: 18,
      latitude: 25.08,
      longitude: 55.14,
      active: true,
      enabled: true,
    },
    {
      id: 2,
      tenantName: 'ALG Telecom',
      siteName: 'Business Bay Tower',
      siteCode: 'TW-002',
      category: 'TOWER',
      city: 'Dubai',
      country: 'UAE',
      status: 'warn',
      devices: 21,
      latitude: 25.1856,
      longitude: 55.2654,
      active: true,
      enabled: true,
    },
    {
      id: 3,
      tenantName: 'Metro Infra',
      siteName: 'Abu Dhabi Central Building',
      siteCode: 'BL-001',
      category: 'BUILDING',
      city: 'Abu Dhabi',
      country: 'UAE',
      status: 'Critical',
      devices: 34,
      latitude: 24.4667,
      longitude: 54.3667,
      active: true,
      enabled: false,
    },
    {
      id: 4,
      tenantName: 'Logix Net',
      siteName: 'Ajman Coastal Warehouse',
      siteCode: 'WH-001',
      category: 'WAREHOUSE',
      city: 'Ajman',
      country: 'UAE',
      status: 'Offline',
      devices: 14,
      latitude: 25.4052,
      longitude: 55.5136,
      active: false,
      enabled: true,
    },
    {
      id: 5,
      tenantName: 'Qatar Connect',
      siteName: 'Doha West Bay Tower',
      siteCode: 'TW-QA-001',
      category: 'TOWER',
      city: 'Doha',
      country: 'Qatar',
      status: 'Healthy',
      devices: 22,
      latitude: 25.3284,
      longitude: 51.531,
      active: true,
      enabled: true,
    },
    {
      id: 6,
      tenantName: 'Qatar Connect',
      siteName: 'Lusail Smart Building',
      siteCode: 'BL-QA-001',
      category: 'BUILDING',
      city: 'Lusail',
      country: 'Qatar',
      status: 'warn',
      devices: 27,
      latitude: 25.4173,
      longitude: 51.5113,
      active: true,
      enabled: true,
    },
  ]);

  readonly kpis = computed(() => {
    const sites = this.sites();

    return [
      {
        label: 'Total Tenants',
        value: 4,
        icon: 'pi pi-building',
        testId: 'platform-kpi-tenants',
      },
      {
        label: 'Total Sites',
        value: sites.length,
        icon: 'pi pi-map-marker',
        testId: 'platform-kpi-sites',
      },
      {
        label: 'Total Devices',
        value: sites.reduce((total, site) => total + site.devices, 0),
        icon: 'pi pi-microchip',
        testId: 'platform-kpi-devices',
      },
      {
        label: 'Critical Sites',
        value: sites.filter((site) => site.status === 'Critical').length,
        icon: 'pi pi-bolt',
        testId: 'platform-kpi-critical',
      },
    ];
  });

  readonly categorySummary = computed(() => {
    const sites = this.sites();

    return [
      {
        label: 'Towers',
        value: sites.filter((site) => site.category === 'TOWER').length,
        icon: 'pi pi-broadcast-tower',
      },
      {
        label: 'Buildings',
        value: sites.filter((site) => site.category === 'BUILDING').length,
        icon: 'pi pi-building',
      },
      {
        label: 'Warehouses',
        value: sites.filter((site) => site.category === 'WAREHOUSE').length,
        icon: 'pi pi-warehouse',
      },
    ];
  });

  readonly alerts = [
    {
      title: 'Gateway offline',
      tenant: 'Logix Net',
      site: 'WH-001',
      severity: 'Critical',
    },
    {
      title: 'Temperature threshold crossed',
      tenant: 'Metro Infra',
      site: 'BL-001',
      severity: 'Critical',
    },
    {
      title: 'Fuel level warn',
      tenant: 'ALG Telecom',
      site: 'TW-002',
      severity: 'warn',
    },
  ];

  constructor(private router: Router) {}

  createTenant(): void {
    this.router.navigate(['/tenants'], {
      queryParams: {
        action: 'create',
      },
    });
  }

  openSite(site: PlatformSite | MapSite): void {
    this.router.navigate(['/sites', site.id]);
  }

  openAlerts(): void {
    this.router.navigate(['/alerts']);
  }

  statusSeverity(status: PlatformSiteStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'Healthy') return 'success';
    if (status === 'warn') return 'warn';
    if (status === 'Critical') return 'danger';
    return 'secondary';
  }
}