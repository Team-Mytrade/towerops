import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideAppRouter } from './core/providers/app-router.provider';
import { provideHttpApi } from './core/providers/http-api.provider';
import { providePrimeTheme } from './core/providers/primeng.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppRouter(),
    provideAnimationsAsync(),
    providePrimeTheme(),
    provideHttpApi(),
  ],
};