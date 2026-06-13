// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { RouterModule } from '@angular/router';
// import { AppSidebarComponent } from './app-sidebar.component';
// import { AppTopbarComponent } from './app-topbar.component';

// @Component({
//   selector: 'app-shell',
//   standalone: true,
//   imports: [CommonModule, RouterModule, AppSidebarComponent, AppTopbarComponent],
//   template: `
//     <div class="min-h-screen bg-slate-50 text-slate-900" data-testid="app-shell">
//       <app-sidebar [(collapsed)]="sidebarCollapsed"></app-sidebar>

//       <div class="min-h-screen transition-all duration-200" [ngClass]="sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'">
//         <app-topbar [title]="pageTitle"></app-topbar>
//         <main class="p-6 md:p-8" data-testid="app-main-content">
//           <router-outlet></router-outlet>
//         </main>
//       </div>
//     </div>
//   `,
// })
// export class AppShellComponent {
//   sidebarCollapsed = false;
//   pageTitle = 'Dashboard';
// }
