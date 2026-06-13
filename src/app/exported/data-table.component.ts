// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { TableModule } from 'primeng/table';
// import { InputTextModule } from 'primeng/inputtext';
// import { ButtonModule } from 'primeng/button';
// import { CheckboxModule } from 'primeng/checkbox';
// import { StatusBadgeComponent } from './status-badge.component';
// import { SeverityBadgeComponent } from './severity-badge.component';

// export interface UiTableColumn {
//   field: string;
//   header: string;
//   type?: 'text' | 'status' | 'severity' | 'date' | 'number' | 'mono';
//   sortable?: boolean;
//   width?: string;
// }

// @Component({
//   selector: 'app-data-table',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     TableModule,
//     InputTextModule,
//     ButtonModule,
//     CheckboxModule,
//     StatusBadgeComponent,
//     SeverityBadgeComponent,
//   ],
//   template: `
//     <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" [attr.data-testid]="testId">
//       <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <div *ngIf="title" class="font-display text-lg font-semibold tracking-tight text-slate-900">{{ title }}</div>
//           <div *ngIf="subtitle" class="mt-1 text-xs text-slate-500">{{ subtitle }}</div>
//         </div>

//         <div class="flex items-center gap-2">
//           <span class="p-input-icon-left">
//             <i class="pi pi-search"></i>
//             <input
//               pInputText
//               type="text"
//               [(ngModel)]="globalFilter"
//               (input)="dt.filterGlobal(globalFilter, 'contains')"
//               placeholder="Search"
//               class="h-9 w-full rounded-md text-sm sm:w-64"
//               data-testid="table-search-input"
//             />
//           </span>
//           <ng-content select="[table-actions]"></ng-content>
//         </div>
//       </div>

//       <p-table
//         #dt
//         [value]="data"
//         [columns]="columns"
//         [paginator]="paginator"
//         [rows]="rows"
//         [rowsPerPageOptions]="rowsPerPageOptions"
//         [globalFilterFields]="globalFields"
//         [tableStyle]="{ 'min-width': minWidth }"
//         [selection]="selection"
//         (selectionChange)="selectionChange.emit($event)"
//         dataKey="id"
//         styleClass="p-datatable-sm"
//       >
//         <ng-template pTemplate="header" let-columns>
//           <tr>
//             <th *ngIf="selectable" style="width: 3rem">
//               <p-tableHeaderCheckbox data-testid="table-select-all"></p-tableHeaderCheckbox>
//             </th>
//             <th
//               *ngFor="let col of columns"
//               [pSortableColumn]="col.sortable ? col.field : undefined"
//               [style.width]="col.width"
//               class="whitespace-nowrap bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500"
//             >
//               {{ col.header }}
//               <p-sortIcon *ngIf="col.sortable" [field]="col.field"></p-sortIcon>
//             </th>
//             <th *ngIf="showActions" class="bg-slate-50 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
//           </tr>
//         </ng-template>

//         <ng-template pTemplate="body" let-row let-columns="columns">
//           <tr class="cursor-pointer transition hover:bg-slate-50" (click)="rowClick.emit(row)" [attr.data-testid]="rowTestId(row)">
//             <td *ngIf="selectable" (click)="$event.stopPropagation()">
//               <p-tableCheckbox [value]="row" data-testid="table-row-checkbox"></p-tableCheckbox>
//             </td>
//             <td *ngFor="let col of columns" class="text-sm text-slate-700">
//               <ng-container [ngSwitch]="col.type || 'text'">
//                 <app-status-badge *ngSwitchCase="'status'" [value]="cell(row, col.field)" [testId]="'status-' + col.field"></app-status-badge>
//                 <app-severity-badge *ngSwitchCase="'severity'" [severity]="cell(row, col.field)" [testId]="'severity-' + col.field"></app-severity-badge>
//                 <span *ngSwitchCase="'date'">{{ cell(row, col.field) | date: 'mediumDate' }}</span>
//                 <span *ngSwitchCase="'number'" class="font-mono">{{ cell(row, col.field) }}</span>
//                 <span *ngSwitchCase="'mono'" class="font-mono text-xs font-semibold text-slate-800">{{ cell(row, col.field) }}</span>
//                 <span *ngSwitchDefault>{{ cell(row, col.field) }}</span>
//               </ng-container>
//             </td>
//             <td *ngIf="showActions" class="text-right" (click)="$event.stopPropagation()">
//               <ng-content select="[row-actions]"></ng-content>
//               <button
//                 pButton
//                 type="button"
//                 icon="pi pi-arrow-right"
//                 text
//                 rounded
//                 severity="secondary"
//                 (click)="rowClick.emit(row)"
//                 data-testid="table-view-row-btn"
//               ></button>
//             </td>
//           </tr>
//         </ng-template>

//         <ng-template pTemplate="emptymessage">
//           <tr>
//             <td [attr.colspan]="columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)" class="py-10 text-center text-sm text-slate-500">
//               {{ emptyMessage }}
//             </td>
//           </tr>
//         </ng-template>
//       </p-table>
//     </div>
//   `,
// })
// export class DataTableComponent {
//   @Input() title = '';
//   @Input() subtitle = '';
//   @Input() data: Record<string, any>[] = [];
//   @Input() columns: UiTableColumn[] = [];
//   @Input() selection: Record<string, any>[] = [];
//   @Input() selectable = false;
//   @Input() showActions = true;
//   @Input() paginator = true;
//   @Input() rows = 10;
//   @Input() rowsPerPageOptions: number[] = [10, 25, 50];
//   @Input() minWidth = '720px';
//   @Input() emptyMessage = 'No records found';
//   @Input() testId = 'data-table';
//   @Output() rowClick = new EventEmitter<Record<string, any>>();
//   @Output() selectionChange = new EventEmitter<Record<string, any>[]>();

//   globalFilter = '';

//   get globalFields(): string[] {
//     return this.columns.map((col) => col.field);
//   }

//   cell(row: Record<string, any>, field: string): any {
//     return field.split('.').reduce((value, key) => value?.[key], row) ?? '-';
//   }

//   rowTestId(row: Record<string, any>): string {
//     return `${this.testId}-row-${row?.id || row?.towerId || row?.ticketId || 'item'}`;
//   }
// }
