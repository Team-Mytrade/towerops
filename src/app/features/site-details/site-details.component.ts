import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';

import { Site, SiteService } from '../../core/services/site.service';

@Component({
  selector: 'to-site-details',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule],
  templateUrl: './site-details.component.html',
  styleUrl: './site-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly siteService = inject(SiteService);

  readonly loading = signal(false);
  readonly site = signal<Site | null>(null);

  readonly status = computed(() => {
    const site = this.site();
    return site?.enabled && site?.active ? 'Healthy' : 'Offline';
  });

  readonly devices = [
    { name: 'Gateway Controller', code: 'GW-001', status: 'Online' },
    { name: 'Signal Sensor', code: 'SIG-101', status: 'Online' },
    { name: 'Fuel Sensor', code: 'FUEL-202', status: 'Warning' },
  ];

  readonly alerts = [
    { title: 'Fuel level below threshold', severity: 'Warning', time: '12 min ago' },
    { title: 'Signal fluctuation detected', severity: 'Critical', time: '34 min ago' },
  ];

  readonly workOrders = [
    { id: 'WO-10021', title: 'Fuel sensor inspection', status: 'Pending' },
    { id: 'WO-10032', title: 'Signal calibration', status: 'In Progress' },
  ];

  readonly maintenance = [
    { title: 'Monthly inspection', date: 'Today' },
    { title: 'Battery health check', date: 'Tomorrow' },
  ];

  constructor() {
    this.loadSite();
  }

  async loadSite(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigateByUrl('/dashboard');
      return;
    }

    try {
      this.loading.set(true);
      const response = await firstValueFrom(this.siteService.getById(id));
      this.site.set(response.data);
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    const category = this.site()?.category?.toLowerCase() || 'tower';
    this.router.navigate(['/dashboard/site-category', category]);
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }
}