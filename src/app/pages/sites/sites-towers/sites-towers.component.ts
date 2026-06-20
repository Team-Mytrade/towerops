import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { MapComponent } from '../../../shared/map/map.component';
import { MapMarker, MapMarkerStatus } from '../../../shared/map/map.models';

type TowerSite = MapMarker & {
  city: string;
  fuelLevel: number;
  openTickets: number;
};

@Component({
  selector: 'to-sites-towers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputTextModule,
    SelectModule,
    TagModule,
    MapComponent,
  ],
  templateUrl: './sites-towers.component.html',
  styleUrl: './sites-towers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SitesTowersComponent {
  search = signal('');
  status = signal<'all' | MapMarkerStatus>('all');

  readonly statusOptions = [
    { label: 'All status', value: 'all' },
    { label: 'Healthy', value: 'healthy' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' },
    { label: 'Offline', value: 'offline' },
  ];

  readonly towers = signal<TowerSite[]>([
    {
      id: 'TW001',
      name: 'Tower Sharjah 01',
      type: 'tower',
      location: 'Industrial Area',
      city: 'Sharjah',
      emirate: 'Sharjah',
      latitude: 25.3463,
      longitude: 55.4209,
      status: 'warning',
      activeAlarms: 1,
      openTickets: 3,
      deviceCount: 8,
      fuelLevel: 64.3,
    },
    {
      id: 'TW002',
      name: 'Tower Dubai 02',
      type: 'tower',
      location: 'Business Bay',
      city: 'Dubai',
      emirate: 'Dubai',
      latitude: 25.185,
      longitude: 55.2708,
      status: 'healthy',
      activeAlarms: 1,
      openTickets: 1,
      deviceCount: 8,
      fuelLevel: 62.1,
    },
    {
      id: 'TW003',
      name: 'Tower Umm 03',
      type: 'tower',
      location: 'Umm Al Quwain Central',
      city: 'Umm Al Quwain',
      emirate: 'Umm Al Quwain',
      latitude: 25.5647,
      longitude: 55.5552,
      status: 'healthy',
      activeAlarms: 0,
      openTickets: 1,
      deviceCount: 8,
      fuelLevel: 76.9,
    },
    {
      id: 'TW004',
      name: 'Tower Sharjah 04',
      type: 'tower',
      location: 'Al Majaz',
      city: 'Sharjah',
      emirate: 'Sharjah',
      latitude: 25.337,
      longitude: 55.38,
      status: 'warning',
      activeAlarms: 2,
      openTickets: 0,
      deviceCount: 8,
      fuelLevel: 27.7,
    },
    {
      id: 'TW005',
      name: 'Tower Ajman 05',
      type: 'tower',
      location: 'Ajman Corniche',
      city: 'Ajman',
      emirate: 'Ajman',
      latitude: 25.4052,
      longitude: 55.5136,
      status: 'offline',
      activeAlarms: 1,
      openTickets: 2,
      deviceCount: 5,
      fuelLevel: 48.2,
    },
    {
      id: 'TW006',
      name: 'Tower Abu 06',
      type: 'tower',
      location: 'Al Danah',
      city: 'Abu Dhabi',
      emirate: 'Abu Dhabi',
      latitude: 24.4539,
      longitude: 54.3773,
      status: 'critical',
      activeAlarms: 4,
      openTickets: 3,
      deviceCount: 9,
      fuelLevel: 67.7,
    },
  ]);

  readonly filteredTowers = computed(() => {
    const q = this.search().trim().toLowerCase();

    return this.towers().filter((tower) => {
      const matchesSearch =
        !q ||
        tower.id.toLowerCase().includes(q) ||
        tower.name.toLowerCase().includes(q) ||
        tower.city.toLowerCase().includes(q) ||
        tower.location.toLowerCase().includes(q);

      const matchesStatus =
        this.status() === 'all' || tower.status === this.status();

      return matchesSearch && matchesStatus;
    });
  });

  severity(status: MapMarkerStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'healthy') return 'success';
    if (status === 'warning') return 'warn';
    if (status === 'critical') return 'danger';
    return 'secondary';
  }

  fuelColor(fuel: number): string {
    if (fuel < 30) return '#ef4444';
    if (fuel < 50) return '#f59e0b';
    return '#22c55e';
  }
}