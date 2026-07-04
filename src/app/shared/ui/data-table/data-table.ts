import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type DataTableColumn<T = any> = {
  key: keyof T | string;
  label: string;
  width?: string;
};

@Component({
  selector: 'to-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable<T extends Record<string, any> = any> {
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly rows = input.required<T[]>();
  readonly emptyText = input<string>('No records found');

  readonly rowClick = output<T>();

  getValue(row: T, key: keyof T | string): unknown {
    return row[key as keyof T] ?? '-';
  }
}