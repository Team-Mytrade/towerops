import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" [attr.data-testid]="testId">
      <div class="min-w-0">
        <div *ngIf="eyebrow" class="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          {{ eyebrow }}
        </div>
        <h3 class="truncate font-display font-semibold tracking-tight text-slate-900 md:text-xl">
          {{ title }}
        </h3>
        <p *ngIf="subtitle" class="max-w-3xl text-xs text-slate-500">
          {{ subtitle }}
        </p>
      </div>

      <div class="flex shrink-0 flex-wrap items-center gap-2">
        <ng-content select="[header-actions]"></ng-content>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() eyebrow = '';
  @Input() testId = 'page-header';
}
