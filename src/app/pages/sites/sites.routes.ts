import { Routes } from "@angular/router";
import { SitesTowersComponent } from "./sites-towers/sites-towers.component";
import { TowerDetailComponent } from "./tower-detail/tower-detail.component";
import { DeviceDetailComponent } from "./device-detail/device-detail.component";
import { SitesBuildingsComponent } from "./sites-buildings/sites-buildings.component";
import { BuildingDetailComponent } from "./building-detail/building-detail.component";
import { SitesWarehousesComponent } from "./sites-warehouses/sites-warehouses.component";
import { WarehouseDetailComponent } from "./warehouse-detail/warehouse-detail.component";

export const SITES_ROUTES = [
    {
        path: 'towers',
        component: SitesTowersComponent
    },
    {
        path: 'towers/:id',
        component: TowerDetailComponent
    },
    {
        path: 'devices/:id',
        component: DeviceDetailComponent
    },
    {
        path: 'buildings',
        component: SitesBuildingsComponent
    },
    {
        path: 'buildings/:id',
        component: BuildingDetailComponent
    },
    {
        path: 'warehouses',
        component: SitesWarehousesComponent
    },
    {
        path: 'warehouses/:id',
        component: WarehouseDetailComponent
    },

] as Routes;