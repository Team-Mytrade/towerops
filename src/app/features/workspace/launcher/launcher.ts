import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import {
  WorkspaceService,
  WorkspaceSummary,
} from '../../../core/services/workspace.service';

@Component({
  selector: 'to-workspace-launcher',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
  ],
  templateUrl: './launcher.html',
  styleUrl: './launcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceLauncher {

  private readonly router =
    inject(Router);

  readonly workspace =
    inject(WorkspaceService);

  readonly workspaces =
    this.workspace.workspaces;

  readonly totalSites =
    computed(() =>
      this.workspaces()
        .reduce((sum, w) => sum + w.count, 0),
    );

  readonly totalDevices =
    computed(() =>
      this.workspaces()
        .reduce((sum, w) => sum + w.devices, 0),
    );

  readonly totalAlarms =
    computed(() =>
      this.workspaces()
        .reduce((sum, w) => sum + w.alarms, 0),
    );

  openWorkspace(
    workspace: WorkspaceSummary,
  ): void {

    this.workspace.selectWorkspace(
      workspace.type,
    );

    this.router.navigate([
      '/dashboard',
    ]);

  }

}