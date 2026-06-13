// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { ButtonModule } from 'primeng/button';
// import { AvatarModule } from 'primeng/avatar';
// import { MenuModule } from 'primeng/menu';

// @Component({
//   selector: 'app-topbar',
//   standalone: true,
//   imports: [CommonModule, ButtonModule, AvatarModule, MenuModule],
//   template: `
//     <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6" data-testid="app-topbar">
//       <div class="flex min-w-0 items-center gap-3">
//         <button
//           pButton
//           type="button"
//           icon="pi pi-bars"
//           text
//           rounded
//           severity="secondary"
//           class="md:hidden"
//           (click)="menuClick.emit()"
//           data-testid="mobile-menu-btn"
//         ></button>
//         <div class="min-w-0">
//           <div class="text-xs font-semibold uppercase tracking-widest text-slate-500">{{ eyebrow }}</div>
//           <div class="truncate font-display text-base font-semibold text-slate-900">{{ title }}</div>
//         </div>
//       </div>

//       <div class="flex items-center gap-2">
//         <button pButton type="button" icon="pi pi-search" text rounded severity="secondary" data-testid="topbar-search-btn"></button>
//         <button pButton type="button" icon="pi pi-bell" text rounded severity="secondary" data-testid="topbar-notification-btn"></button>
//         <div class="ml-2 hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
//           <div class="text-right">
//             <div class="text-sm font-semibold text-slate-900">{{ userName }}</div>
//             <div class="text-xs text-slate-500">{{ userRole }}</div>
//           </div>
//           <p-avatar [label]="avatarLabel" shape="circle" styleClass="bg-blue-600 text-white" data-testid="topbar-user-avatar"></p-avatar>
//         </div>
//       </div>
//     </header>
//   `,
// })
// export class AppTopbarComponent {
//   @Input() title = 'Dashboard';
//   @Input() eyebrow = 'Network Operations Center';
//   @Input() userName = 'Admin';
//   @Input() userRole = 'NOC Manager';
//   @Output() menuClick = new EventEmitter<void>();

//   get avatarLabel(): string {
//     return this.userName?.trim()?.charAt(0)?.toUpperCase() || 'A';
//   }
// }
