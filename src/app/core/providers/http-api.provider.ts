import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { mockInterceptor } from '../interceptors/mock.interceptor';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { loadingInterceptor } from '../interceptors/loading.interceptor';

export const provideHttpApi = () =>
  provideHttpClient(
    withFetch(),
    withInterceptors([
      // mockInterceptor,
      authInterceptor,
      loadingInterceptor,
      errorInterceptor,
    ]),
  );