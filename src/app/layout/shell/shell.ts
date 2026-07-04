import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Topbar } from '../topbar/topbar';
import { RequestLoaderService } from '../../core/services/request-loader.service';

@Component({
  selector: 'to-shell',
  standalone: true,
  imports: [RouterOutlet, Topbar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  readonly loader = inject(RequestLoaderService);
}