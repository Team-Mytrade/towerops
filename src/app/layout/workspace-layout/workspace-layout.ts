import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RequestLoaderService } from '../../core/services/request-loader.service';

@Component({
  selector: 'to-workspace-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './workspace-layout.html',
  styleUrl: './workspace-layout.scss',
})
export class WorkspaceLayout {
  readonly loader = inject(RequestLoaderService);
}