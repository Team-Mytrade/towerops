import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  input,
  output,
} from '@angular/core';

import * as L from 'leaflet';

import { MapMarker } from './map.models';

@Component({
  selector: 'to-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: true })
  private mapContainer!: ElementRef<HTMLDivElement>;

  readonly markers = input<MapMarker[]>([]);
  readonly markerClick = output<MapMarker>();

  private map: L.Map | null = null;
  private markerLayer = L.layerGroup();

  ngAfterViewInit(): void {
    this.initializeMap();
    this.renderMarkers();

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['markers'] && this.map) {
      this.renderMarkers();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private initializeMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      attributionControl: true,
    }).setView([24.4539, 54.3773], 7);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    ).addTo(this.map);

    this.markerLayer.addTo(this.map);

    const uaeBounds = L.latLngBounds(
      [22.6, 51.4],
      [26.2, 56.5]
    );

    this.map.setMaxBounds(uaeBounds);
    this.map.fitBounds(uaeBounds);
  }

  private renderMarkers(): void {
    if (!this.map) return;

    this.markerLayer.clearLayers();

    const visibleMarkers = this.markers();

    visibleMarkers.forEach((site) => {
      const marker = L.marker(
        [site.latitude, site.longitude],
        {
          icon: this.createMarkerIcon(site),
          title: site.name,
        }
      );

      marker.bindTooltip(this.getTooltipContent(site), {
        direction: 'top',
        offset: [0, -18],
        opacity: 1,
        sticky: true,
        className: 'to-map-tooltip',
      });

      marker.on('click', () => {
        this.markerClick.emit(site);
      });

      marker.addTo(this.markerLayer);
    });

    if (visibleMarkers.length > 0) {
      const bounds = L.latLngBounds(
        visibleMarkers.map((site) => [
          site.latitude,
          site.longitude,
        ])
      );

      this.map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 10,
      });
    }
  }

  private getTooltipContent(site: MapMarker): string {
    return `
      <div class="to-map-tooltip-card">
        <div class="to-map-tooltip-card__top">
          <span class="to-map-tooltip-card__type">${site.type}</span>
          <span class="to-map-tooltip-card__status">${site.status}</span>
        </div>

        <div class="to-map-tooltip-card__title">${site.name}</div>
        <div class="to-map-tooltip-card__meta">${site.location}, ${site.emirate}</div>

        <div class="to-map-tooltip-card__row">
          <span>Active Alarms</span>
          <strong>${site.activeAlarms}</strong>
        </div>

        <div class="to-map-tooltip-card__row">
          <span>Devices</span>
          <strong>${site.deviceCount}</strong>
        </div>
      </div>
    `;
  }

  private createMarkerIcon(site: MapMarker): L.DivIcon {
    const colorMap: Record<MapMarker['status'], string> = {
      healthy: '#10B981',
      warning: '#F59E0B',
      critical: '#EF4444',
      offline: '#64748B',
    };

    const iconMap: Record<MapMarker['type'], string> = {
      tower: 'fa-solid fa-tower-cell',
      building: 'fa-solid fa-building',
      warehouse: 'fa-solid fa-warehouse',
    };

    return L.divIcon({
      className: '',
      html: `
        <div
          class="to-map-marker to-map-marker--${site.type}"
          style="--marker-color:${colorMap[site.status]}"
        >
          <span class="to-map-marker__pulse"></span>

          <span class="to-map-marker__icon">
            <i class="${iconMap[site.type]}"></i>
          </span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      tooltipAnchor: [0, -20],
    });
  }
}