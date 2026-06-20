import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  input,
} from '@angular/core';

import { Router } from '@angular/router';
import { inject } from '@angular/core';

import * as L from 'leaflet';

import { MapMarker } from '../map.models';

@Component({
  selector: 'to-tower-map',
  standalone: true,
  templateUrl: './tower-map.html',
  styleUrl: './tower-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TowerMap implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);

  @ViewChild('mapContainer', { static: true })
  private mapContainer!: ElementRef<HTMLDivElement>;

  markers = input<MapMarker[]>([]);

  private map: L.Map | null = null;
  private markerLayer = L.layerGroup();

  ngAfterViewInit(): void {
    this.initMap();
    this.renderMarkers();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      attributionControl: true,
    }).setView([24.4539, 54.3773], 7);

    L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution:
      '&copy; OpenStreetMap contributors',
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

    this.markers().forEach((tower) => {
      const marker = L.marker(
        [tower.latitude, tower.longitude],
        {
          icon: this.createMarkerIcon(tower.status),
          title: tower.name,
        }
      );

      marker.bindTooltip(this.getTooltipContent(tower), {
        direction: 'top',
        offset: [0, -18],
        opacity: 1,
        sticky: true,
        className: 'to-map-tooltip',
      });

      marker.on('click', () => {
        this.router.navigate([
          '/sites/towers',
          tower.id,
        ]);
      });

      marker.addTo(this.markerLayer);
    });
  }

  private getTooltipContent(tower: MapMarker): string {
    return `
      <div class="to-map-tooltip-card">
        <div class="to-map-tooltip-card__title">${tower.name}</div>
        <div class="to-map-tooltip-card__meta">${tower.location}, ${tower.emirate}</div>

        <div class="to-map-tooltip-card__row">
          <span>Status</span>
          <strong>${tower.status}</strong>
        </div>

        <div class="to-map-tooltip-card__row">
          <span>Active Alarms</span>
          <strong>${tower.activeAlarms}</strong>
        </div>

        <div class="to-map-tooltip-card__row">
          <span>Devices</span>
          <strong>${tower.deviceCount}</strong>
        </div>
      </div>
    `;
  }

  private createMarkerIcon(status: MapMarker['status']): L.DivIcon {
    const colorMap: Record<MapMarker['status'], string> = {
      healthy: '#10b981',
      warning: '#f59e0b',
      critical: '#ef4444',
      offline: '#64748b',
    };

    return L.divIcon({
      className: '',
      html: `
        <div class="to-map-marker" style="background:${colorMap[status]}">
          <i class="fa-solid fa-tower-cell"></i>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      tooltipAnchor: [0, -18],
    });
  }
}