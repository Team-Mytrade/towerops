import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  TemplateRef,
  computed,
  input,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DataTableColumn } from './data-table.types';

@Component({
  selector: 'fx-data-table',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    SkeletonModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  readonly data = input<any[]>([]);
  readonly columns = input<DataTableColumn[]>([]);
  readonly testid = input('data-table');
  readonly className = input('');
  readonly rowKey = input('id');
  readonly loading = input(false);
  readonly actions = input<TemplateRef<any> | null>(null);

  readonly rows = input(25);

  readonly classes = computed(() =>
    ['fx-data-table', this.className()].filter(Boolean).join(' ')
  );
  readonly rowsPerPageOptions = input<number[]>([10, 25, 50, 100]);
  readonly showPaginator = input(true);
  readonly showSearch = input(true);
  readonly showFilter = input(true);
  readonly showExport = input(true);
  readonly selectable = input(true);

  @Output() readonly rowClick = new EventEmitter<any>();
  @Output() readonly selectionChange = new EventEmitter<any[]>();

  readonly selectedRows = signal<any[]>([]);

  readonly globalFilterFields = computed(() =>
    this.columns().map((col) => col.key)
  );

  onSelectionChange(rows: any[]) {
    this.selectedRows.set(rows ?? []);
    this.selectionChange.emit(this.selectedRows());
  }

  clearSelection() {
    this.selectedRows.set([]);
    this.selectionChange.emit([]);
  }

  onRow(row: any) {
    this.rowClick.emit(row);
  }

  formatCurrency(value: any): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
  }

  badgeSeverity(
    value: any
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const text = String(value ?? '').toLowerCase();

    if (/active|approved|paid|completed|delivered|synced|won/.test(text)) {
      return 'success';
    }

    if (/pending|draft|progress|hold|waiting/.test(text)) {
      return 'warn';
    }

    if (/failed|rejected|lost|cancelled|overdue|inactive/.test(text)) {
      return 'danger';
    }

    if (/new|open|sent|confirmed/.test(text)) {
      return 'info';
    }

    return 'secondary';
  }
}