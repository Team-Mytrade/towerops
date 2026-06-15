import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';

import { provideRouter, withComponentInputBinding } from '@angular/router';

import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';

import { towerOpsTheme } from './core/theme/theme.config';

import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,

    provideBrowserGlobalErrorListeners(),

    provideZoneChangeDetection({
      eventCoalescing: true,
    }),

    provideRouter(
      routes,
      withComponentInputBinding()
    ),

    provideHttpClient(
      withInterceptors([
        loadingInterceptor,
        authInterceptor,
        errorInterceptor,
      ])
    ),

    provideAnimationsAsync(),

    providePrimeNG({
      ripple: true,
      theme: {
        preset: towerOpsTheme,
        options: {
          darkModeSelector: '.to-dark',
        },
      },
    }),
  ],
};