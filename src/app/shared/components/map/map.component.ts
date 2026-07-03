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
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
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

  searchText = '';
  searching = false;

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

  searchLocation(): void {
    const query = this.searchText.trim();

    if (!query || !this.map) return;

    this.searching = true;

    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?format=json` +
      `&limit=1` +
      `&accept-language=en` +
      `&q=${encodeURIComponent(query)}`;

    fetch(url)
      .then((res) => res.json())
      .then((results) => {
        const location = results?.[0];

        if (!location || !this.map) return;

        const lat = Number(location.lat);
        const lon = Number(location.lon);

        this.map.setView([lat, lon], 13);

        L.popup()
          .setLatLng([lat, lon])
          .setContent(`<strong>${location.display_name}</strong>`)
          .openOn(this.map);
      })
      .finally(() => {
        this.searching = false;
      });
  }

  useMyLocation(): void {
    if (!navigator.geolocation || !this.map) return;

    navigator.geolocation.getCurrentPosition((position) => {
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
    });
  }

  shareCurrentView(): void {
    if (!this.map) return;

    const center = this.map.getCenter();
    const zoom = this.map.getZoom();

    const url = `${window.location.origin}${window.location.pathname}?lat=${center.lat.toFixed(
      6,
    )}&lng=${center.lng.toFixed(6)}&zoom=${zoom}`;

    navigator.clipboard?.writeText(url);
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
    }).setView(this.center, this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    this.applySharedLocationFromUrl();
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

  private applySharedLocationFromUrl(): void {
    if (!this.map) return;

    const params = new URLSearchParams(window.location.search);
    const lat = Number(params.get('lat'));
    const lng = Number(params.get('lng'));
    const zoom = Number(params.get('zoom') || 13);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      this.map.setView([lat, lng], zoom);
    }
  }
}