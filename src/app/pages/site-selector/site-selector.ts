import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

type SiteType = 'towers' | 'buildings' | 'warehouses';

interface SiteTypeCard {
  type: SiteType;
  title: string;
  subtitle: string;
  count: number;
  icon: string;
  image: string;
}

@Component({
  selector: 'to-site-selector',
  standalone: true,
  templateUrl: './site-selector.html',
  styleUrl: './site-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteSelector {
  readonly siteTypes: SiteTypeCard[] = [
    {
      type: 'towers',
      title: 'Telecom Towers',
      subtitle: 'Monitor RF, power, fuel and generators across UAE telecom sites.',
      count: 5,
      icon: 'fa-solid fa-rss',
      image: 'https://images.pexels.com/photos/34740416/pexels-photo-34740416.jpeg',
    },
    {
      type: 'buildings',
      title: 'Buildings',
      subtitle: 'HVAC, UPS, fire and elevator systems across commercial properties.',
      count: 3,
      icon: 'pi pi-building-columns',
      image: 'https://images.pexels.com/photos/36145985/pexels-photo-36145985.jpeg',
    },
    {
      type: 'warehouses',
      title: 'Warehouses',
      subtitle: 'Cold storage, access control, CCTV and power for logistics hubs.',
      count: 2,
      icon: 'pi pi-warehouse',
      image: 'https://images.pexels.com/photos/10501161/pexels-photo-10501161.jpeg',
    },
  ];

  constructor(private readonly router: Router) {}

  openSite(type: SiteType): void {
    this.router.navigate(['/dashboard', type]);
  }

  openGlobalDashboard(): void {
    this.router.navigate(['/dashboard/towers']);
  }
}