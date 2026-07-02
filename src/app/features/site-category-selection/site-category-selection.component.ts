import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

type SiteCategoryKey = 'tower' | 'building' | 'warehouse';

type SiteCategoryCard = {
  key: SiteCategoryKey;
  label: string;
  subtitle: string;
  count: number;
  icon: string;
  testId: string;
};

@Component({
  selector: 'app-site-category-selection',
  standalone: true,
  imports: [CommonModule, ButtonModule, TitleCasePipe],
  templateUrl: './site-category-selection.component.html',
  styleUrl: './site-category-selection.component.scss',
})
export class SiteCategorySelectionComponent {
  private readonly router = inject(Router);

  readonly tenantName = signal('Algotricz Telecom');
  readonly categories = signal<Record<SiteCategoryKey, number>>({
    tower: 12,
    building: 5,
    warehouse: 3,
  });

  readonly cards = computed<SiteCategoryCard[]>(() => {
  const data = this.categories();

  const cards: SiteCategoryCard[] = [
    {
      key: 'tower',
      label: 'Towers',
      subtitle: 'Monitor telecom towers, devices, alarms and maintenance.',
      count: data.tower ?? 0,
      icon: 'pi pi-broadcast-tower',
      testId: 'site-category-tower-card',
    },
    {
      key: 'building',
      label: 'Buildings',
      subtitle: 'Track building infrastructure, IoT devices and service health.',
      count: data.building ?? 0,
      icon: 'pi pi-building',
      testId: 'site-category-building-card',
    },
    {
      key: 'warehouse',
      label: 'Warehouses',
      subtitle: 'Manage warehouse assets, devices, alerts and work orders.',
      count: data.warehouse ?? 0,
      icon: 'pi pi-warehouse',
      testId: 'site-category-warehouse-card',
    },
  ];

  return cards.filter((card) => card.count > 0);
});

  selectCategory(category: SiteCategoryKey): void {
    this.router.navigate(['/dashboard/site-category', category]);
  }
}