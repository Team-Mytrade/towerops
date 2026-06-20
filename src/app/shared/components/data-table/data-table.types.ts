export type DataTableColumn<T = any> = {
  field: keyof T | string;
  header: string;
  type?: 'text' | 'tag' | 'date' | 'mono' | 'number';
  width?: string;
  sortable?: boolean;
};