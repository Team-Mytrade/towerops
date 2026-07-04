import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export type MapSite = {
  id: number | string;
  siteCode: string;
  siteName: string;
  category?: string;
  latitude: number;
  longitude: number;
  active?: boolean;
  enabled?: boolean;
};

@Component({
  selector: 'to-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;

  @Input() sites: MapSite[] = [];
  @Input() height = '560px';
  @Input() zoom = 8;
  @Input() center: [number, number] = [24.4539, 54.3773]; // UAE default

  @Output() siteSelected = new EventEmitter<MapSite>();

  locating = false;

  private map?: L.Map;
  private markersLayer = L.layerGroup();
  private userMarker?: L.Marker;

  ngAfterViewInit(): void {
    this.initMap();
    this.renderMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sites'] && this.map) {
      this.renderMarkers();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  useMyLocation(): void {
    if (!navigator.geolocation || !this.map) return;

    this.locating = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        this.map?.setView([lat, lon], 14);

        this.userMarker?.remove();

        this.userMarker = L.marker([lat, lon], {
          icon: this.createUserIcon(),
        })
          .addTo(this.map!)
          .bindPopup('Your current location')
          .openPopup();

        this.locating = false;
      },
      () => {
        this.locating = false;
      },
    );
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
    }).setView(this.center, this.zoom);

    // CARTO Voyager — clean modern basemap with Latin/English-script labels
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      },
    ).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private renderMarkers(): void {
    if (!this.map) return;

    this.markersLayer.clearLayers();

    const validSites = this.sites.filter(
      (site) => Number.isFinite(site.latitude) && Number.isFinite(site.longitude),
    );

    validSites.forEach((site) => {
      const marker = L.marker([site.latitude, site.longitude], {
        icon: this.createSiteIcon(site),
      });

      marker.bindPopup(`
        <div class="to-map-popup">
          <strong>${site.siteName}</strong>
          <span>${site.siteCode}</span>
          <button type="button" data-site-id="${site.id}">
            Open Site
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        setTimeout(() => {
          const button = document.querySelector(
            `[data-site-id="${site.id}"]`,
          ) as HTMLButtonElement | null;

          button?.addEventListener('click', () => {
            this.siteSelected.emit(site);
          });
        });
      });

      marker.on('click', () => {
        this.siteSelected.emit(site);
      });

      marker.addTo(this.markersLayer);
    });

    if (validSites.length) {
      const bounds = L.latLngBounds(
        validSites.map((site) => [site.latitude, site.longitude]),
      );

      this.map.fitBounds(bounds, {
        padding: [36, 36],
        maxZoom: 13,
      });
    }
  }

  private createSiteIcon(site: MapSite): L.DivIcon {
    const isHealthy = site.active !== false && site.enabled !== false;
    const color = isHealthy ? '#10B981' : '#64748B';

    return L.divIcon({
      className: 'to-leaflet-marker',
      html: `
        <span style="--marker-color: ${color}">
          <i></i>
        </span>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }

  private createUserIcon(): L.DivIcon {
    return L.divIcon({
      className: 'to-leaflet-user-marker',
      html: `<span><i></i></span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }
}