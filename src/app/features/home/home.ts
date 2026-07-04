import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import {
  WorkspaceService,
  WorkspaceSummary,
} from '../../core/services/workspace.service';

type HomeKpi = {
  label: string;
  value: string;
  icon: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
};

@Component({
  selector: 'to-home',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly router = inject(Router);
  readonly workspace = inject(WorkspaceService);

  readonly workspaces = this.workspace.workspaces;

  readonly totalSites = computed(() =>
    this.workspaces().reduce((sum, item) => sum + item.count, 0),
  );

  readonly totalDevices = computed(() =>
    this.workspaces().reduce((sum, item) => sum + item.devices, 0),
  );

  readonly totalAlarms = computed(() =>
    this.workspaces().reduce((sum, item) => sum + item.alarms, 0),
  );

  readonly kpis = computed<HomeKpi[]>(() => [
    {
      label: 'Total Sites',
      value: String(this.totalSites()),
      icon: 'pi pi-map-marker',
      tone: 'primary',
    },
    {
      label: 'Total Devices',
      value: String(this.totalDevices()),
      icon: 'pi pi-microchip',
      tone: 'success',
    },
    {
      label: 'Active Alarms',
      value: String(this.totalAlarms()),
      icon: 'pi pi-bell',
      tone: 'danger',
    },
    {
      label: 'SLA Compliance',
      value: '96.8%',
      icon: 'pi pi-chart-line',
      tone: 'warning',
    },
  ]);

  readonly criticalAlarms = [
    {
      title: 'Fuel level below threshold',
      site: 'West Bay Telecom Tower',
      time: '2 mins ago',
      severity: 'Critical',
    },
    {
      title: 'Battery voltage low',
      site: 'Business Bay Tower',
      time: '12 mins ago',
      severity: 'High',
    },
    {
      title: 'Generator overload',
      site: 'Abu Dhabi HQ',
      time: '24 mins ago',
      severity: 'Medium',
    },
  ];

  readonly engineers = [
    {
      name: 'Rashid Ali',
      status: 'Working',
      location: 'Dubai Marina',
      workOrder: 'WO-1002',
    },
    {
      name: 'Ahmed Khan',
      status: 'Available',
      location: 'Abu Dhabi',
      workOrder: 'No active job',
    },
    {
      name: 'Naveen Kumar',
      status: 'Working',
      location: 'Ajman',
      workOrder: 'WO-1003',
    },
  ];

  readonly activities = [
    'New site registered: West Bay Telecom Tower',
    'Rule updated: High Temperature Alert',
    'Ticket created from alarm ALM-1001',
    'Device DEV-DOHA-001 came online',
  ];

  openWorkspace(item: WorkspaceSummary): void {
    this.workspace.selectWorkspace(item.type);
    this.router.navigateByUrl('/dashboard');
  }

  openSites(item: WorkspaceSummary): void {
    this.workspace.selectWorkspace(item.type);
    this.router.navigateByUrl('/sites');
  }
}