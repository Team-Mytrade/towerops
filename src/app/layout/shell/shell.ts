import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { RequestLoaderService } from '../../core/services/request-loader.service';

@Component({
  selector: 'to-shell',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  readonly loader = inject(RequestLoaderService);

  readonly mobileSidebarOpen = signal(false);

  openMobileSidebar(): void {
    this.mobileSidebarOpen.set(true);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}