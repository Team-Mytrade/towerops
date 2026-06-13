// import { CommonModule } from '@angular/common';
// import { Component, Input } from '@angular/core';

// @Component({
//   selector: 'app-severity-badge',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <span
//       class="inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-wide"
//       [ngClass]="classes"
//       [attr.data-testid]="testId"
//     >
//       {{ severity }}
//     </span>
//   `,
// })
// export class SeverityBadgeComponent {
//   @Input() severity: 'Critical' | 'High' | 'Warning' | 'Medium' | 'Low' | 'Info' | string = 'Info';
//   @Input() testId = 'severity-badge';

//   get classes(): string {
//     const value = String(this.severity).toLowerCase();
//     if (value === 'critical' || value === 'high') return 'border-rose-200 bg-rose-50 text-rose-700';
//     if (value === 'warning' || value === 'medium') return 'border-amber-200 bg-amber-50 text-amber-700';
//     if (value === 'low') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
//     return 'border-blue-200 bg-blue-50 text-blue-700';
//   }
// }
