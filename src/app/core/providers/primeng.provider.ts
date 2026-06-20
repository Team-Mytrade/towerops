import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';

import {
  ConfirmationService,
  MessageService,
} from 'primeng/api';

import { providePrimeNG } from 'primeng/config';

import { towerOpsTheme } from '../theme/theme.config';

export function providePrimeTheme(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MessageService,
    ConfirmationService,

    providePrimeNG({
      ripple: true,
      theme: {
        preset: towerOpsTheme,
        options: {
          darkModeSelector: '.to-dark',
          cssLayer: false,
        },
      },
    }),
  ]);
}