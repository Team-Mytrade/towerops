// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { RouterModule } from '@angular/router';
// import { ButtonModule } from 'primeng/button';

// export interface SidebarNavItem {
//   label: string;
//   route: string;
//   icon: string;
//   testId?: string;
// }

// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [CommonModule, RouterModule, ButtonModule],
//   template: `
//     <aside
//       class="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-800 bg-slate-950 text-slate-100 transition-all duration-200"
//       [class.w-64]="!collapsed"
//       [class.w-16]="collapsed"
//       data-testid="app-sidebar"
//     >
//       <div class="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
//         <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/30">
//           <i class="pi pi-broadcast-tower"></i>
//         </div>
//         <div *ngIf="!collapsed" class="min-w-0">
//           <div class="font-display text-sm font-semibold tracking-tight">TowerOps</div>
//           <div class="text-[11px] font-medium text-slate-400">NOC Platform</div>
//         </div>
//       </div>

//       <nav class="flex-1 space-y-1 overflow-y-auto p-3">
//         <a
//           *ngFor="let item of items"
//           [routerLink]="item.route"
//           routerLinkActive="bg-slate-800 text-white shadow-sm"
//           [routerLinkActiveOptions]="{ exact: item.route === '/' }"
//           class="group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
//           [attr.data-testid]="item.testId || 'sidebar-link-' + item.label.toLowerCase().replaceAll(' ', '-')"
//         >
//           <i [class]="item.icon + ' text-base'"></i>
//           <span *ngIf="!collapsed" class="truncate">{{ item.label }}</span>
//         </a>
//       </nav>

//       <div class="border-t border-slate-800 p-3">
//         <button
//           pButton
//           type="button"
//           [icon]="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
//           [label]="collapsed ? '' : 'Collapse'"
//           severity="secondary"
//           text
//           class="w-full justify-center text-slate-300 hover:bg-slate-900"
//           (click)="collapsedChange.emit(!collapsed)"
//           data-testid="sidebar-collapse-btn"
//         ></button>
//       </div>
//     </aside>
//   `,
// })
// export class AppSidebarComponent {
//   @Input() collapsed = false;
//   @Input() items: SidebarNavItem[] = [
//     { label: 'Dashboard', route: '/', icon: 'pi pi-th-large', testId: 'nav-dashboard' },
//     { label: 'Towers', route: '/towers', icon: 'pi pi-building', testId: 'nav-towers' },
//     { label: 'Assets', route: '/assets', icon: 'pi pi-box', testId: 'nav-assets' },
//     { label: 'Monitoring', route: '/monitoring', icon: 'pi pi-chart-line', testId: 'nav-monitoring' },
//     { label: 'Alarms', route: '/alarms', icon: 'pi pi-bell', testId: 'nav-alarms' },
//     { label: 'Maintenance', route: '/maintenance', icon: 'pi pi-calendar-clock', testId: 'nav-maintenance' },
//     { label: 'Work Orders', route: '/work-orders', icon: 'pi pi-briefcase', testId: 'nav-work-orders' },
//     { label: 'Engineers', route: '/engineers', icon: 'pi pi-users', testId: 'nav-engineers' },
//   ];
//   @Output() collapsedChange = new EventEmitter<boolean>();
// }
