import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {

      // Network Error

      if (error.status === 0) {
        notificationService.error(
          'Unable to connect to server'
        );

        return throwError(() => error);
      }

      // Unauthorized

      if (error.status === 401) {
        authService.clearSession();

        notificationService.error(
          'Your session has expired. Please login again.'
        );

        router.navigate(['/auth/login']);

        return throwError(() => error);
      }

      // Forbidden

      if (error.status === 403) {
        notificationService.error(
          'You do not have permission to perform this action.'
        );

        return throwError(() => error);
      }

      // Validation Error

      if (error.status === 400) {
        notificationService.error(
          error.error?.message ??
          'Invalid request'
        );

        return throwError(() => error);
      }

      // Server Error

      if (error.status >= 500) {
        notificationService.error(
          'Something went wrong. Please try again later.'
        );

        return throwError(() => error);
      }

      notificationService.error(
        error.error?.message ??
        'Unexpected error occurred'
      );

      return throwError(() => error);
    })
  );
};