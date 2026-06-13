import { TemplateRef } from '@angular/core';

export type DataTableColumnType =
  | 'text'
  | 'mono'
  | 'badge'
  | 'date'
  | 'currency'
  | 'percent'
  | 'custom';

export interface DataTableColumn {
  key: string;
  label: string;
  type?: DataTableColumnType;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  wrap?: boolean;
  width?: string;
  template?: TemplateRef<any>;
}