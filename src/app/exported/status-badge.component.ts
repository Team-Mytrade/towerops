// import { CommonModule } from '@angular/common';
// import { Component, Input } from '@angular/core';

// export type StatusBadgeTone =
//   | 'healthy'
//   | 'warning'
//   | 'critical'
//   | 'info'
//   | 'neutral'
//   | 'success'
//   | 'danger';

// @Component({
//   selector: 'app-status-badge',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <span
//       class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none"
//       [ngClass]="toneClasses"
//       [attr.data-testid]="testId"
//     >
//       <span
//         *ngIf="showDot"
//         class="h-1.5 w-1.5 rounded-full"
//         [ngClass]="dotClasses"
//       ></span>
//       {{ label || value }}
//     </span>
//   `,
// })
// export class StatusBadgeComponent {
//   @Input() value = 'Neutral';
//   @Input() label = '';
//   @Input() tone?: StatusBadgeTone;
//   @Input() showDot = true;
//   @Input() testId = 'status-badge';

//   get resolvedTone(): StatusBadgeTone {
//     if (this.tone) return this.tone;

//     const value = String(this.value).toLowerCase();
//     if (['healthy', 'active', 'online', 'closed', 'resolved', 'completed', 'success'].includes(value)) return 'healthy';
//     if (['warning', 'attention', 'assigned', 'on site', 'in progress', 'open'].includes(value)) return 'warning';
//     if (['critical', 'high', 'offline', 'failed', 'breach', 'danger'].includes(value)) return 'critical';
//     if (['info', 'scheduled', 'pending', 'fix submitted'].includes(value)) return 'info';
//     return 'neutral';
//   }

//   get toneClasses(): string {
//     const map: Record<StatusBadgeTone, string> = {
//       healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
//       success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
//       warning: 'border-amber-200 bg-amber-50 text-amber-700',
//       critical: 'border-rose-200 bg-rose-50 text-rose-700',
//       danger: 'border-rose-200 bg-rose-50 text-rose-700',
//       info: 'border-blue-200 bg-blue-50 text-blue-700',
//       neutral: 'border-slate-200 bg-slate-50 text-slate-600',
//     };
//     return map[this.resolvedTone];
//   }

//   get dotClasses(): string {
//     const map: Record<StatusBadgeTone, string> = {
//       healthy: 'bg-emerald-500',
//       success: 'bg-emerald-500',
//       warning: 'bg-amber-500',
//       critical: 'bg-rose-500',
//       danger: 'bg-rose-500',
//       info: 'bg-blue-500',
//       neutral: 'bg-slate-400',
//     };
//     return map[this.resolvedTone];
//   }
// }
