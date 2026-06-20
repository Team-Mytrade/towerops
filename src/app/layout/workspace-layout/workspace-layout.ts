import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Topbar } from '../topbar/topbar';
import { RequestLoaderService } from '../../core/services/request-loader.service';

@Component({
  selector: 'to-workspace-layout',
  standalone: true,
  imports: [RouterOutlet, Topbar],
  templateUrl: './workspace-layout.html',
  styleUrl: './workspace-layout.scss',
})
export class WorkspaceLayout {
  readonly loader = inject(RequestLoaderService);
}