import { Injectable, computed, inject, signal } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage.constants';
import { StorageService } from './storage.service';

export type SidebarMode = 'expanded' | 'collapsed';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
    private readonly storage = inject(StorageService);

  private readonly _sidebarMode = signal<SidebarMode>(
    this.storage.get<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED)
      ? 'collapsed'
      : 'expanded'
  );

  readonly sidebarMode = this._sidebarMode.asReadonly();

  readonly sidebarCollapsed = computed(
    () => this._sidebarMode() === 'collapsed'
  );


  toggleSidebar(): void {
    this._sidebarMode.update((mode) =>
      mode === 'collapsed' ? 'expanded' : 'collapsed'
    );

    this.persistSidebar();
  }

  collapseSidebar(): void {
    this._sidebarMode.set('collapsed');
    this.persistSidebar();
  }

  expandSidebar(): void {
    this._sidebarMode.set('expanded');
    this.persistSidebar();
  }

  private persistSidebar(): void {
    this.storage.set(
      STORAGE_KEYS.SIDEBAR_COLLAPSED,
      this.sidebarCollapsed()
    );
  }
}