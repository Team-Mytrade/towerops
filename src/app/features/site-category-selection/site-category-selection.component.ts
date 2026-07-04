import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SiteCategory } from '../../core/enums/site-category.enum';
import { SiteService } from '../../core/services/site.service';
import { firstValueFrom } from 'rxjs';

type SiteCategoryCard = {
  key: SiteCategory;
  label: string;
  subtitle: string;
  count: number;
  icon: string;
  testId: string;
};

const CATEGORY_META: Record<
  SiteCategory,
  Omit<SiteCategoryCard, 'key' | 'count' | 'testId'>
> = {
  [SiteCategory.TOWER]: {
    label: 'Towers',
    subtitle: 'Telecom tower sites, devices, alarms and maintenance.',
    icon: 'pi pi-wifi',
  },
  [SiteCategory.BUILDING]: {
    label: 'Buildings',
    subtitle: 'Building infrastructure, devices and service health.',
    icon: 'pi pi-building',
  },
  [SiteCategory.WAREHOUSE]: {
    label: 'Warehouses',
    subtitle: 'Warehouse assets, alerts and work orders.',
    icon: 'pi pi-warehouse',
  },
  [SiteCategory.TELECOM]: {
    label: 'Telecom',
    subtitle: 'Telecom network sites and operational monitoring.',
    icon: 'pi pi-sitemap',
  },
  [SiteCategory.POWER]: {
    label: 'Power',
    subtitle: 'Power systems, uptime and energy monitoring.',
    icon: 'pi pi-bolt',
  },
  [SiteCategory.GENERATOR]: {
    label: 'Generators',
    subtitle: 'Generator status, fuel and maintenance tracking.',
    icon: 'pi pi-cog',
  },
  [SiteCategory.FACILITY]: {
    label: 'Facilities',
    subtitle: 'Facility assets, devices and service operations.',
    icon: 'pi pi-building-columns',
  },
  [SiteCategory.MARINE]: {
    label: 'Marine',
    subtitle: 'Marine sites, vessels and remote infrastructure.',
    icon: 'pi pi-compass',
  },
  [SiteCategory.AVIATION]: {
    label: 'Aviation',
    subtitle: 'Airport and aviation infrastructure monitoring.',
    icon: 'pi pi-send',
  },
  [SiteCategory.DEFENSE]: {
    label: 'Defense',
    subtitle: 'Defense infrastructure and secured operations.',
    icon: 'pi pi-shield',
  },
  [SiteCategory.AI_OPS_CENTER]: {
    label: 'AI Ops Center',
    subtitle: 'AI-driven operation centers and command monitoring.',
    icon: 'pi pi-server',
  },
};

@Component({
  selector: 'app-site-category-selection',
  standalone: true,
  imports: [CommonModule, ButtonModule, TitleCasePipe],
  templateUrl: './site-category-selection.component.html',
  styleUrl: './site-category-selection.component.scss',
})
export class SiteCategorySelectionComponent implements OnInit {
  private readonly router = inject(Router);
  readonly siteService = inject(SiteService);

  readonly tenantName = signal('Algotricz Telecom');

  ngOnInit(): void {
    this.getSiteCategorySummary()
  }
  readonly categories = signal<Partial<Record<SiteCategory, number>>>({
    [SiteCategory.TOWER]: 12,
    [SiteCategory.BUILDING]: 5,
    [SiteCategory.WAREHOUSE]: 3,
    [SiteCategory.TELECOM]: 4,
    [SiteCategory.POWER]: 2,
    [SiteCategory.GENERATOR]: 6,
    [SiteCategory.FACILITY]: 3,
    [SiteCategory.MARINE]: 1,
    [SiteCategory.AVIATION]: 1,
    [SiteCategory.DEFENSE]: 1,
    [SiteCategory.AI_OPS_CENTER]: 1,
  });

  readonly cards = computed<SiteCategoryCard[]>(() => {
    const data = this.categories();

    return Object.values(SiteCategory)
      .map((category) => ({
        key: category,
        label: CATEGORY_META[category].label,
        subtitle: CATEGORY_META[category].subtitle,
        icon: CATEGORY_META[category].icon,
        count: data[category] ?? 0,
        testId: `site-category-${category.toLowerCase().replaceAll('_', '-')}-card`,
      }))
      .filter((card) => card.count > 0);
  });

  readonly totalSites = computed(() =>
    this.cards().reduce((total, card) => total + card.count, 0),
  );
  async getSiteCategorySummary() {
    const data = await firstValueFrom(this.siteService.getCategorySummary())
  }
  selectCategory(category: SiteCategory): void {
    this.router.navigate(['/dashboard/site-category', category.toLowerCase()]);
  }
}