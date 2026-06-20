import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { MapComponent } from '../../../shared/map/map.component';
import { MapMarker, MapMarkerStatus } from '../../../shared/map/map.models';

type WarehouseSite = MapMarker & {
  zones: number;
  capacityUsed: number;
  openTickets: number;
};

@Component({
  selector: 'to-sites-warehouses',
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
  templateUrl: './sites-warehouses.component.html',
  styleUrl: './sites-warehouses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SitesWarehousesComponent {
  search = signal('');
  status = signal<'all' | MapMarkerStatus>('all');

  readonly statusOptions = [
    { label: 'All status', value: 'all' },
    { label: 'Healthy', value: 'healthy' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' },
    { label: 'Offline', value: 'offline' },
  ];

  readonly warehouses = signal<WarehouseSite[]>([
    {
      id: 'WH-UAE-001',
      name: 'Dubai Spare Parts Warehouse',
      type: 'warehouse',
      location: 'Al Quoz',
      emirate: 'Dubai',
      latitude: 25.132,
      longitude: 55.244,
      status: 'healthy',
      activeAlarms: 0,
      deviceCount: 18,
      zones: 6,
      capacityUsed: 68,
      openTickets: 1,
    },
    {
      id: 'WH-UAE-002',
      name: 'Abu Dhabi Equipment Warehouse',
      type: 'warehouse',
      location: 'Mussafah',
      emirate: 'Abu Dhabi',
      latitude: 24.35,
      longitude: 54.52,
      status: 'critical',
      activeAlarms: 3,
      deviceCount: 22,
      zones: 8,
      capacityUsed: 91,
      openTickets: 5,
    },
    {
      id: 'WH-UAE-003',
      name: 'Ajman Logistics Warehouse',
      type: 'warehouse',
      location: 'Al Jurf',
      emirate: 'Ajman',
      latitude: 25.385,
      longitude: 55.53,
      status: 'warning',
      activeAlarms: 1,
      deviceCount: 14,
      zones: 5,
      capacityUsed: 76,
      openTickets: 2,
    },
    {
      id: 'WH-UAE-004',
      name: 'Sharjah Field Stock Yard',
      type: 'warehouse',
      location: 'Industrial Area',
      emirate: 'Sharjah',
      latitude: 25.3463,
      longitude: 55.4209,
      status: 'healthy',
      activeAlarms: 0,
      deviceCount: 16,
      zones: 4,
      capacityUsed: 54,
      openTickets: 0,
    },
  ]);

  readonly filteredWarehouses = computed(() => {
    const q = this.search().trim().toLowerCase();

    return this.warehouses().filter((warehouse) => {
      const matchesSearch =
        !q ||
        warehouse.id.toLowerCase().includes(q) ||
        warehouse.name.toLowerCase().includes(q) ||
        warehouse.location.toLowerCase().includes(q) ||
        warehouse.emirate.toLowerCase().includes(q);

      const matchesStatus =
        this.status() === 'all' || warehouse.status === this.status();

      return matchesSearch && matchesStatus;
    });
  });

  severity(status: MapMarkerStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'healthy') return 'success';
    if (status === 'warning') return 'warn';
    if (status === 'critical') return 'danger';
    return 'secondary';
  }

  capacityColor(value: number): string {
    if (value >= 90) return '#ef4444';
    if (value >= 70) return '#f59e0b';
    return '#22c55e';
  }
}