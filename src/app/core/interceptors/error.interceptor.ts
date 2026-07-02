import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const notification = inject(NotificationService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.error?.message ||
        error.error?.error ||
        error.message ||
        'Unexpected error occurred';

      if (error.status === 0) {
        notification.error('Unable to connect to server');
      } else if (error.status === 401) {
        auth.clearSession();
        notification.error('Your session has expired. Please login again.');
        router.navigateByUrl('/login', { replaceUrl: true });
      } else if (error.status === 403) {
        notification.error('You do not have permission to perform this action.');
      } else if (error.status === 400) {
        notification.error(message || 'Invalid request');
      } else if (error.status >= 500) {
        notification.error('Something went wrong. Please try again later.');
      } else {
        notification.error(message);
      }

      return throwError(() => error);
    }),
  );
};