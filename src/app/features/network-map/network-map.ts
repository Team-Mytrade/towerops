import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import * as L from 'leaflet';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type SiteStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';
type SiteType = 'Tower' | 'Building' | 'Warehouse';

type MapSite = {
  id: string;
  code: string;
  name: string;
  type: SiteType;
  tenant: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  devices: number;
  alerts: number;
  workOrders: number;
  status: SiteStatus;
};

@Component({
  selector: 'to-network-map',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    Drawer,
    DetailField,
    StatusBadge,
  ],
  templateUrl: './network-map.html',
  styleUrl: './network-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkMap implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  private markers: L.Marker[] = [];

  readonly search = signal('');
  readonly statusFilter = signal<'All' | SiteStatus>('All');
  readonly typeFilter = signal<'All' | SiteType>('All');

  readonly drawerOpen = signal(false);
  readonly selectedSite = signal<MapSite | null>(null);

  readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Healthy', value: 'Healthy' },
    { label: 'Warning', value: 'Warning' },
    { label: 'Critical', value: 'Critical' },
    { label: 'Offline', value: 'Offline' },
  ];

  readonly typeOptions = [
    { label: 'All Types', value: 'All' },
    { label: 'Tower', value: 'Tower' },
    { label: 'Building', value: 'Building' },
    { label: 'Warehouse', value: 'Warehouse' },
  ];

  readonly sites = signal<MapSite[]>([
    {
      id: 'SITE-001',
      code: 'TW-001',
      name: 'Dubai Marina Tower',
      type: 'Tower',
      tenant: 'du Telecom NOC',
      city: 'Dubai',
      address: 'Dubai Marina',
      lat: 25.0812,
      lng: 55.1414,
      devices: 18,
      alerts: 1,
      workOrders: 3,
      status: 'Healthy',
    },
    {
      id: 'SITE-002',
      code: 'TW-002',
      name: 'Business Bay Tower',
      type: 'Tower',
      tenant: 'du Telecom NOC',
      city: 'Dubai',
      address: 'Business Bay',
      lat: 25.184,
      lng: 55.272,
      devices: 21,
      alerts: 3,
      workOrders: 2,
      status: 'Warning',
    },
    {
      id: 'SITE-003',
      code: 'BL-004',
      name: 'Abu Dhabi HQ',
      type: 'Building',
      tenant: 'Etisalat UAE',
      city: 'Abu Dhabi',
      address: 'Central Business District',
      lat: 24.4539,
      lng: 54.3773,
      devices: 42,
      alerts: 4,
      workOrders: 2,
      status: 'Critical',
    },
    {
      id: 'SITE-004',
      code: 'WH-002',
      name: 'Ajman Coastal Warehouse',
      type: 'Warehouse',
      tenant: 'TowerOps Demo',
      city: 'Ajman',
      address: 'Ajman Industrial Area',
      lat: 25.4052,
      lng: 55.5136,
      devices: 14,
      alerts: 5,
      workOrders: 5,
      status: 'Offline',
    },
  ]);

  readonly filteredSites = computed(() => {
    const query = this.search().toLowerCase().trim();
    const status = this.statusFilter();
    const type = this.typeFilter();

    return this.sites().filter((site) => {
      const matchesSearch =
        !query ||
        site.name.toLowerCase().includes(query) ||
        site.code.toLowerCase().includes(query) ||
        site.city.toLowerCase().includes(query) ||
        site.tenant.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || site.status === status;
      const matchesType = type === 'All' || site.type === type;

      return matchesSearch && matchesStatus && matchesType;
    });
  });

  ngAfterViewInit(): void {
    this.initMap();
    this.renderMarkers();
  }

  refreshMap(): void {
    this.renderMarkers();
  }

  openSite(site: MapSite): void {
    this.selectedSite.set(site);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedSite.set(null);
  }

  statusTone(status: SiteStatus): 'success' | 'warning' | 'danger' | 'muted' {
    if (status === 'Healthy') return 'success';
    if (status === 'Warning') return 'warning';
    if (status === 'Critical') return 'danger';
    return 'muted';
  }

  private initMap(): void {
    this.map = L.map('networkMap', {
      zoomControl: true,
      attributionControl: false,
    }).setView([24.4539, 54.3773], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(this.map);
  }

  private renderMarkers(): void {
    if (!this.map) return;

    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    for (const site of this.filteredSites()) {
      const marker = L.marker([site.lat, site.lng], {
        icon: this.markerIcon(site.status),
      });

      marker.on('click', () => this.openSite(site));

      marker
        .bindTooltip(
          `
          <strong>${site.code}</strong><br/>
          ${site.name}<br/>
          ${site.status}
        `,
          { direction: 'top' },
        )
        .addTo(this.map);

      this.markers.push(marker);
    }
  }

  private markerIcon(status: SiteStatus): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<span class="to-map-marker ${status.toLowerCase()}"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}