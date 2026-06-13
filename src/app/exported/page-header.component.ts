// import { CommonModule } from '@angular/common';
// import { Component, Input } from '@angular/core';

// @Component({
//   selector: 'app-page-header',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" [attr.data-testid]="testId">
//       <div class="min-w-0">
//         <div *ngIf="eyebrow" class="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
//           {{ eyebrow }}
//         </div>
//         <h1 class="truncate font-display text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
//           {{ title }}
//         </h1>
//         <p *ngIf="subtitle" class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
//           {{ subtitle }}
//         </p>
//       </div>

//       <div class="flex shrink-0 flex-wrap items-center gap-2">
//         <ng-content select="[header-actions]"></ng-content>
//       </div>
//     </div>
//   `,
// })
// export class PageHeaderComponent {
//   @Input() title = '';
//   @Input() subtitle = '';
//   @Input() eyebrow = '';
//   @Input() testId = 'page-header';
// }
