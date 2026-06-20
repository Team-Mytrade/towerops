import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

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
  ],
};