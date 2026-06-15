import { Directive, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';

import { NotificationService } from '../services/notification.service';

@Directive()
export abstract class BaseClass implements OnDestroy {
  protected readonly notification = inject(NotificationService);

  protected readonly destroy$ = new Subject<void>();

  protected showSuccess(message: string): void {
    this.notification.success(message);
  }

  protected showError(message: string): void {
    this.notification.error(message);
  }

  protected showInfo(message: string): void {
    this.notification.info(message);
  }

  protected showWarning(message: string): void {
    this.notification.warn(message);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}