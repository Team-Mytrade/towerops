import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { MapComponent } from '../../../shared/map/map.component';
import { MapMarker, MapMarkerStatus } from '../../../shared/map/map.models';

type BuildingSite = MapMarker & {
  floors: number;
  occupancy: number;
  openTickets: number;
};

@Component({
  selector: 'to-sites-buildings',
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
  templateUrl: './sites-buildings.component.html',
  styleUrl: './sites-buildings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SitesBuildingsComponent {
  search = signal('');
  status = signal<'all' | MapMarkerStatus>('all');

  readonly statusOptions = [
    { label: 'All status', value: 'all' },
    { label: 'Healthy', value: 'healthy' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' },
    { label: 'Offline', value: 'offline' },
  ];

  readonly buildings = signal<BuildingSite[]>([
    {
      id: 'BL-UAE-001',
      name: 'Dubai Operations Center',
      type: 'building',
      location: 'JLT',
      emirate: 'Dubai',
      latitude: 25.0714,
      longitude: 55.1438,
      status: 'healthy',
      activeAlarms: 0,
      deviceCount: 34,
      floors: 18,
      occupancy: 82,
      openTickets: 2,
    },
    {
      id: 'BL-UAE-002',
      name: 'Abu Dhabi Regional Hub',
      type: 'building',
      location: 'Al Zahiyah',
      emirate: 'Abu Dhabi',
      latitude: 24.488,
      longitude: 54.382,
      status: 'warning',
      activeAlarms: 2,
      deviceCount: 41,
      floors: 22,
      occupancy: 74,
      openTickets: 4,
    },
    {
      id: 'BL-UAE-003',
      name: 'Sharjah NOC Facility',
      type: 'building',
      location: 'Al Majaz',
      emirate: 'Sharjah',
      latitude: 25.337,
      longitude: 55.38,
      status: 'healthy',
      activeAlarms: 0,
      deviceCount: 29,
      floors: 12,
      occupancy: 69,
      openTickets: 1,
    },
    {
      id: 'BL-UAE-004',
      name: 'Ajman Field Office',
      type: 'building',
      location: 'Al Jurf',
      emirate: 'Ajman',
      latitude: 25.385,
      longitude: 55.53,
      status: 'critical',
      activeAlarms: 3,
      deviceCount: 25,
      floors: 8,
      occupancy: 61,
      openTickets: 5,
    },
  ]);

  readonly filteredBuildings = computed(() => {
    const q = this.search().trim().toLowerCase();

    return this.buildings().filter((building) => {
      const matchesSearch =
        !q ||
        building.id.toLowerCase().includes(q) ||
        building.name.toLowerCase().includes(q) ||
        building.location.toLowerCase().includes(q) ||
        building.emirate.toLowerCase().includes(q);

      const matchesStatus =
        this.status() === 'all' || building.status === this.status();

      return matchesSearch && matchesStatus;
    });
  });

  severity(status: MapMarkerStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'healthy') return 'success';
    if (status === 'warning') return 'warn';
    if (status === 'critical') return 'danger';
    return 'secondary';
  }

  occupancyColor(value: number): string {
    if (value >= 85) return '#ef4444';
    if (value >= 70) return '#f59e0b';
    return '#22c55e';
  }
}