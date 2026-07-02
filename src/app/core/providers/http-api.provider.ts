import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { authInterceptor } from '../interceptors/auth.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { loadingInterceptor } from '../interceptors/loading.interceptor';

export const provideHttpApi = () =>
  provideHttpClient(
    withFetch(),
    withInterceptors([
      authInterceptor,
      loadingInterceptor,
      errorInterceptor,
    ]),
  );