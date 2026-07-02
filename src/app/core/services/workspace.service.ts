import { Injectable, computed, signal } from '@angular/core';

export type WorkspaceType = 'TOWER' | 'BUILDING' | 'WAREHOUSE';

export type WorkspaceSummary = {
  type: WorkspaceType;
  label: string;
  description: string;
  count: number;
  devices: number;
  alarms: number;
  healthy: number;
  warning: number;
  critical: number;
  offline: number;
  icon: string;
};

export type WorkspaceSite = {
  id: number;
  siteCode: string;
  siteName: string;
  category: WorkspaceType;
  city: string;
  status: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
};

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  readonly tenantId = signal<string>('DEFAULT');

  readonly workspaces = signal<WorkspaceSummary[]>([
    {
      type: 'TOWER',
      label: 'Towers',
      description: 'Telecom towers, generators, batteries and fuel systems',
      count: 25,
      devices: 318,
      alarms: 8,
      healthy: 21,
      warning: 2,
      critical: 1,
      offline: 1,
      icon: 'fa-solid fa-tower-broadcast',
    },
    {
      type: 'BUILDING',
      label: 'Buildings',
      description: 'Commercial buildings, HVAC, power and facility sensors',
      count: 12,
      devices: 521,
      alarms: 2,
      healthy: 10,
      warning: 1,
      critical: 1,
      offline: 0,
      icon: 'pi pi-building',
    },
    {
      type: 'WAREHOUSE',
      label: 'Warehouses',
      description: 'Warehouse zones, doors, cold storage and energy monitoring',
      count: 7,
      devices: 110,
      alarms: 0,
      healthy: 7,
      warning: 0,
      critical: 0,
      offline: 0,
      icon: 'pi pi-box',
    },
  ]);

  readonly sites = signal<WorkspaceSite[]>([
    {
      id: 1,
      siteCode: 'SITE-DOHA-001',
      siteName: 'West Bay Telecom Tower',
      category: 'TOWER',
      city: 'Doha',
      status: 'Healthy',
    },
    {
      id: 2,
      siteCode: 'BLD-DOHA-001',
      siteName: 'Doha Central Building',
      category: 'BUILDING',
      city: 'Doha',
      status: 'Warning',
    },
    {
      id: 3,
      siteCode: 'WH-DOHA-001',
      siteName: 'Industrial Warehouse',
      category: 'WAREHOUSE',
      city: 'Doha',
      status: 'Healthy',
    },
  ]);

  readonly activeWorkspace = signal<WorkspaceType | null>(null);
  readonly activeSiteId = signal<number | null>(null);

  readonly hasMultipleWorkspaces = computed(() => this.workspaces().length > 1);

  readonly selectedWorkspace = computed(() =>
    this.workspaces().find((item) => item.type === this.activeWorkspace()) ?? null,
  );

  readonly filteredSites = computed(() => {
    const type = this.activeWorkspace();

    if (!type) return [];

    return this.sites().filter((site) => site.category === type);
  });

  readonly selectedSite = computed(() =>
    this.filteredSites().find((site) => site.id === this.activeSiteId()) ?? null,
  );

  initializeForTenant(tenantId: string): void {
    this.tenantId.set(tenantId);

    const available = this.workspaces();

    if (available.length === 1) {
      this.selectWorkspace(available[0].type);
    }
  }

  selectWorkspace(type: WorkspaceType): void {
    this.activeWorkspace.set(type);

    const firstSite = this.sites().find((site) => site.category === type);

    this.activeSiteId.set(firstSite?.id ?? null);
  }

  selectSite(siteId: number): void {
    this.activeSiteId.set(siteId);
  }

  clear(): void {
    this.activeWorkspace.set(null);
    this.activeSiteId.set(null);
  }
}