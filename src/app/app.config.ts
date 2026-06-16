import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';

import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

import { provideHttpApi } from './core/providers/http-api.provider';
import { providePrimeTheme } from './core/providers/primeng.provider';
import { provideAppRouter } from './core/providers/app-router.provider';

export const appConfig: ApplicationConfig = {
providers: [
  provideBrowserGlobalErrorListeners(),

  provideZoneChangeDetection({
    eventCoalescing: true,
  }),

  provideAppRouter(),

  provideHttpApi(),

  provideAnimationsAsync(),

  providePrimeTheme(),
]
};