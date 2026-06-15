import {
  HttpContextToken,
  HttpInterceptorFn,
} from '@angular/common/http';

import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { RequestLoaderService } from '../services/request-loader.service';

export const SKIP_LOADING = new HttpContextToken<boolean>(
  () => false
);

export const loadingInterceptor: HttpInterceptorFn = (
  req,
  next
) => {
  const loader = inject(RequestLoaderService);

  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  loader.start();

  return next(req).pipe(
    finalize(() => loader.stop())
  );
};