import { CommonModule, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';

import { Site, SiteCategory, SiteService } from '../../core/services/site.service';

type SiteCategoryKey = 'tower' | 'building' | 'warehouse';

@Component({
  selector: 'to-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, TitleCasePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly siteService = inject(SiteService);

  readonly loading = signal(false);
  readonly selectedSite = signal<Site | null>(null);
  readonly sites = signal<Site[]>([]);

  readonly category = computed<SiteCategoryKey>(() => {
    const value = this.route.snapshot.paramMap.get('category')?.toLowerCase();

    if (value === 'building') return 'building';
    if (value === 'warehouse') return 'warehouse';

    return 'tower';
  });

  readonly categoryApi = computed<SiteCategory>(() => {
    const value = this.category();

    if (value === 'building') return 'BUILDING';
    if (value === 'warehouse') return 'WAREHOUSE';

    return 'TOWER';
  });

  readonly pageTitle = computed(() => `${this.category()} Dashboard`);

  readonly kpis = computed(() => {
    const sites = this.sites();

    return [
      {
        label: 'Total Sites',
        value: sites.length,
        icon: 'pi pi-map-marker',
        tone: 'info',
      },
      {
        label: 'Healthy',
        value: sites.filter((site) => site.enabled && site.active).length,
        icon: 'pi pi-check-circle',
        tone: 'success',
      },
      {
        label: 'Warnings',
        value: 2,
        icon: 'pi pi-exclamation-triangle',
        tone: 'warning',
      },
      {
        label: 'Critical',
        value: 1,
        icon: 'pi pi-bolt',
        tone: 'danger',
      },
    ];
  });

  readonly alerts = [
    { title: 'Signal strength dropped', site: 'TW-003', severity: 'Critical' },
    { title: 'Fuel level below threshold', site: 'TW-008', severity: 'Warning' },
    { title: 'Gateway offline', site: 'TW-011', severity: 'Critical' },
  ];

  readonly workOrders = [
    { id: 'WO-10021', title: 'Transmitter inspection', status: 'Pending' },
    { id: 'WO-10032', title: 'Battery replacement', status: 'In Progress' },
    { id: 'WO-10041', title: 'Generator service', status: 'Completed' },
  ];

  readonly maintenance = [
    { title: 'Monthly tower inspection', date: 'Today' },
    { title: 'Battery backup check', date: 'Tomorrow' },
    { title: 'Gateway firmware audit', date: 'This week' },
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

      this.sites.set(response.data ?? []);
    } finally {
      this.loading.set(false);
    }
  }

  selectSite(site: Site): void {
    this.selectedSite.set(site);
  }

  closeSite(): void {
    this.selectedSite.set(null);
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }
}