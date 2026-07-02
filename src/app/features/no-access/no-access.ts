import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'to-no-access',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
  ],
  templateUrl: './no-access.html',
  styleUrl: './no-access.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoAccess {
  private readonly router = inject(Router);

  goDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }
}