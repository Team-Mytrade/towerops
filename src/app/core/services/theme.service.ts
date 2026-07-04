import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage.constants';
import { StorageService } from './storage.service';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(StorageService);

  private readonly _theme = signal<AppTheme>(
    this.storage.get<AppTheme>(STORAGE_KEYS.theme) ?? 'light'
  );

  readonly theme = this._theme.asReadonly();

  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    effect(() => {
      const theme = this._theme();

      this.document.documentElement.classList.toggle(
        'to-dark',
        theme === 'dark'
      );

      this.storage.set(STORAGE_KEYS.theme, theme);
    });
  }

  toggleTheme(): void {
    this._theme.update((theme) =>
      theme === 'dark' ? 'light' : 'dark'
    );
  }

  setTheme(theme: AppTheme): void {
    this._theme.set(theme);
  }

  setLight(): void {
    this.setTheme('light');
  }

  setDark(): void {
    this.setTheme('dark');
  }
}