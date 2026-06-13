// import { CommonModule } from '@angular/common';
// import { Component, Input } from '@angular/core';

// export type KpiTone = 'healthy' | 'warning' | 'critical' | 'info' | 'neutral';

// @Component({
//   selector: 'app-kpi-card',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div
//       class="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
//       [ngClass]="accentClass"
//       [attr.data-testid]="testId"
//     >
//       <div class="flex items-start justify-between gap-4">
//         <div class="min-w-0">
//           <div class="text-xs font-semibold uppercase tracking-widest text-slate-500">{{ label }}</div>
//           <div class="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-900">{{ value }}</div>
//           <div *ngIf="sub" class="mt-1 text-xs text-slate-500">{{ sub }}</div>
//         </div>

//         <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" [ngClass]="iconWrapClass">
//           <i *ngIf="icon" [class]="icon + ' text-lg'"></i>
//           <ng-content select="[kpi-icon]"></ng-content>
//         </div>
//       </div>

//       <div *ngIf="delta" class="mt-4 flex items-center gap-2 text-xs font-semibold" [ngClass]="deltaClass">
//         <i [class]="deltaTrend === 'down' ? 'pi pi-arrow-down-right' : 'pi pi-arrow-up-right'"></i>
//         <span>{{ delta }}</span>
//       </div>
//     </div>
//   `,
// })
// export class KpiCardComponent {
//   @Input() label = '';
//   @Input() value: string | number = '';
//   @Input() sub = '';
//   @Input() icon = '';
//   @Input() tone: KpiTone = 'info';
//   @Input() delta = '';
//   @Input() deltaTrend: 'up' | 'down' = 'up';
//   @Input() testId = 'kpi-card';

//   get accentClass(): string {
//     const map: Record<KpiTone, string> = {
//       healthy: 'border-l-4 border-l-emerald-500',
//       warning: 'border-l-4 border-l-amber-500',
//       critical: 'border-l-4 border-l-rose-500',
//       info: 'border-l-4 border-l-blue-500',
//       neutral: 'border-l-4 border-l-slate-300',
//     };
//     return map[this.tone];
//   }

//   get iconWrapClass(): string {
//     const map: Record<KpiTone, string> = {
//       healthy: 'bg-emerald-50 text-emerald-600',
//       warning: 'bg-amber-50 text-amber-600',
//       critical: 'bg-rose-50 text-rose-600',
//       info: 'bg-blue-50 text-blue-600',
//       neutral: 'bg-slate-50 text-slate-600',
//     };
//     return map[this.tone];
//   }

//   get deltaClass(): string {
//     return this.deltaTrend === 'down' ? 'text-rose-600' : 'text-emerald-600';
//   }
// }
