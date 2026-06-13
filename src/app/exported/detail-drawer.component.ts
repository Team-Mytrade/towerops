// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { DrawerModule } from 'primeng/drawer';
// import { ButtonModule } from 'primeng/button';
// import { StatusBadgeComponent } from './status-badge.component';

// export interface DetailDrawerTimelineItem {
//   title: string;
//   subtitle?: string;
//   time?: string | Date;
//   icon?: string;
// }

// @Component({
//   selector: 'app-detail-drawer',
//   standalone: true,
//   imports: [CommonModule, DrawerModule, ButtonModule, StatusBadgeComponent],
//   template: `
//     <p-drawer
//       [visible]="open"
//       position="right"
//       [modal]="true"
//       [dismissible]="true"
//       [style]="{ width: width }"
//       (onHide)="closed.emit()"
//       [attr.data-testid]="testId"
//     >
//       <ng-template pTemplate="header">
//         <div class="min-w-0">
//           <div class="flex items-center gap-2">
//             <h2 class="truncate font-display text-xl font-semibold tracking-tight text-slate-900">{{ title }}</h2>
//             <app-status-badge *ngIf="status" [value]="status" testId="drawer-status-badge"></app-status-badge>
//           </div>
//           <p *ngIf="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
//         </div>
//       </ng-template>

//       <div class="space-y-6" data-testid="drawer-content">
//         <ng-content></ng-content>

//         <section *ngIf="timeline.length" class="rounded-xl border border-slate-200 bg-white p-4">
//           <div class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Timeline</div>
//           <div class="space-y-4">
//             <div *ngFor="let item of timeline" class="flex gap-3">
//               <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
//                 <i [class]="item.icon || 'pi pi-clock'"></i>
//               </div>
//               <div class="min-w-0 flex-1 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
//                 <div class="text-sm font-semibold text-slate-900">{{ item.title }}</div>
//                 <div *ngIf="item.subtitle" class="mt-1 text-sm text-slate-500">{{ item.subtitle }}</div>
//                 <div *ngIf="item.time" class="mt-1 text-xs text-slate-400">{{ item.time | date: 'medium' }}</div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>

//       <ng-template pTemplate="footer">
//         <div class="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
//           <button
//             pButton
//             type="button"
//             label="Close"
//             severity="secondary"
//             outlined
//             (click)="closed.emit()"
//             data-testid="drawer-close-btn"
//           ></button>
//           <ng-content select="[drawer-actions]"></ng-content>
//         </div>
//       </ng-template>
//     </p-drawer>
//   `,
// })
// export class DetailDrawerComponent {
//   @Input() open = false;
//   @Input() title = '';
//   @Input() subtitle = '';
//   @Input() status = '';
//   @Input() width = 'min(92vw, 520px)';
//   @Input() timeline: DetailDrawerTimelineItem[] = [];
//   @Input() testId = 'detail-drawer';
//   @Output() closed = new EventEmitter<void>();
// }
