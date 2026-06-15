import { Injectable, signal } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly _items = signal<BreadcrumbItem[]>([]);

readonly items = this._items.asReadonly();

  set(items: BreadcrumbItem[]): void {
    this._items.set(items);
  }

  clear(): void {
    this._items.set([]);
  }
}