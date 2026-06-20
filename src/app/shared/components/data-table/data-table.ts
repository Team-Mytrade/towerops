import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { DataTableColumn } from './data-table.types';

@Component({
  selector: 'to-data-table',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ProgressSpinnerModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable<T = any> {
  @Input() rows: T[] = [];
  @Input() columns: DataTableColumn<T>[] = [];

  @Input() rowKey = 'id';
  @Input() emptyMessage = 'No records found';
  @Input() loading = false;

  @Input() paginator = true;
  @Input() rowsPerPage = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50];

  @Input() sortable = true;
  @Input() striped = false;
  @Input() showGridlines = false;
  @Input() scrollable = true;
  @Input() scrollHeight = 'flex';

  @Input() globalFilterFields: string[] = [];
  @Input() globalFilterValue = '';

  @Output() rowClick = new EventEmitter<T>();

  getValue(row: T, field: string): any {
    return field
      .split('.')
      .reduce((value: any, key) => value?.[key], row as any);
  }

  isSortable(column: DataTableColumn<T>): boolean {
    return this.sortable && column.sortable !== false;
  }

  tagSeverity(value: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const normalized = String(value).toLowerCase();

    if (['healthy', 'resolved', 'completed', 'active'].includes(normalized)) {
      return 'success';
    }

    if (
      [
        'warning',
        'major',
        'assigned',
        'acknowledged',
        'scheduled',
        'pending',
      ].includes(normalized)
    ) {
      return 'warn';
    }

    if (['critical', 'open', 'failed'].includes(normalized)) {
      return 'danger';
    }

    return 'secondary';
  }

  formatDate(value: unknown): string {
    if (!value) return '-';

    const date = new Date(value as string);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}