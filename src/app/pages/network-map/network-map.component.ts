import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';

import {
  MapMarker,
  MapMarkerStatus,
  MapMarkerType,
} from '../../shared/map/map.models';
import { MapComponent } from '../../shared/map/map.component';

type NetworkSite = MapMarker;

@Component({
  selector: 'to-network-map',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    TagModule,
    MapComponent,
  ],
  templateUrl: './network-map.component.html',
  styleUrl: './network-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkMapComponent {
  search = signal('');
  status = signal<'all' | MapMarkerStatus>('all');
  type = signal<'all' | MapMarkerType>('all');
  emirate = signal<'all' | string>('all');
  alarmsOnly = signal(false);

  selectedSite = signal<NetworkSite | null>(null);

  readonly statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Healthy', value: 'healthy' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' },
    { label: 'Offline', value: 'offline' },
  ];

  readonly typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Towers', value: 'tower' },
    { label: 'Buildings', value: 'building' },
    { label: 'Warehouses', value: 'warehouse' },
  ];

  readonly emirateOptions = [
    { label: 'All Regions', value: 'all' },
    { label: 'Dubai', value: 'Dubai' },
    { label: 'Abu Dhabi', value: 'Abu Dhabi' },
    { label: 'Sharjah', value: 'Sharjah' },
    { label: 'Ajman', value: 'Ajman' },
  ];

  readonly sites = signal<NetworkSite[]>([
    {
      id: 'TW001',
      name: 'Dubai Marina Tower',
      location: 'Dubai Marina',
      emirate: 'Dubai',
      type: 'tower',
      latitude: 25.0806,
      longitude: 55.1404,
      status: 'healthy',
      activeAlarms: 0,
      deviceCount: 18,
      popupContent: 'TW001 · Dubai Marina Tower · Healthy',
    },
    {
      id: 'TW002',
      name: 'Business Bay Tower',
      location: 'Business Bay',
      emirate: 'Dubai',
      type: 'tower',
      latitude: 25.185,
      longitude: 55.272,
      status: 'warning',
      activeAlarms: 2,
      deviceCount: 21,
      popupContent: 'TW002 · Business Bay Tower · Warning',
    },
    {
      id: 'BL001',
      name: 'Abu Dhabi Central Building',
      location: 'Central Abu Dhabi',
      emirate: 'Abu Dhabi',
      type: 'building',
      latitude: 24.4539,
      longitude: 54.3773,
      status: 'critical',
      activeAlarms: 5,
      deviceCount: 34,
      popupContent: 'BL001 · Abu Dhabi Central Building · Critical',
    },
    {
      id: 'WH001',
      name: 'Ajman Coastal Warehouse',
      location: 'Ajman Coast',
      emirate: 'Ajman',
      type: 'warehouse',
      latitude: 25.4052,
      longitude: 55.5136,
      status: 'offline',
      activeAlarms: 1,
      deviceCount: 14,
      popupContent: 'WH001 · Ajman Coastal Warehouse · Offline',
    },
    {
      id: 'TW003',
      name: 'Sharjah Industrial Tower',
      location: 'Industrial Area',
      emirate: 'Sharjah',
      type: 'tower',
      latitude: 25.3463,
      longitude: 55.4209,
      status: 'healthy',
      activeAlarms: 0,
      deviceCount: 19,
      popupContent: 'TW003 · Sharjah Industrial Tower · Healthy',
    },
  ]);

  filteredSites = computed(() => {
    const searchText = this.search().trim().toLowerCase();

    return this.sites().filter((site) => {
      const matchesSearch =
        !searchText ||
        site.id.toLowerCase().includes(searchText) ||
        site.name.toLowerCase().includes(searchText) ||
        site.location.toLowerCase().includes(searchText) ||
        site.emirate.toLowerCase().includes(searchText);

      const matchesStatus =
        this.status() === 'all' || site.status === this.status();

      const matchesType =
        this.type() === 'all' || site.type === this.type();

      const matchesEmirate =
        this.emirate() === 'all' || site.emirate === this.emirate();

      const matchesAlarm =
        !this.alarmsOnly() || site.activeAlarms > 0;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesEmirate &&
        matchesAlarm
      );
    });
  });

  summary = computed(() => {
    const sites = this.filteredSites();

    return {
      total: sites.length,
      healthy: sites.filter((site) => site.status === 'healthy').length,
      warning: sites.filter((site) => site.status === 'warning').length,
      critical: sites.filter((site) => site.status === 'critical').length,
      offline: sites.filter((site) => site.status === 'offline').length,
      alarms: sites.reduce((sum, site) => sum + site.activeAlarms, 0),
    };
  });

  selectSite(site: NetworkSite): void {
    this.selectedSite.set(site);
  }

  clearFilters(): void {
    this.search.set('');
    this.status.set('all');
    this.type.set('all');
    this.emirate.set('all');
    this.alarmsOnly.set(false);
  }

  severity(status: MapMarkerStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'healthy') return 'success';
    if (status === 'warning') return 'warn';
    if (status === 'critical') return 'danger';
    return 'secondary';
  }
}