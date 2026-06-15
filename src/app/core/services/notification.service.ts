import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

import { MessageType } from '../enums/message-type.enum';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private readonly messageService: MessageService
  ) {}

  notify(
    message: string,
    type: MessageType,
    summary?: string
  ): void {
    switch (type) {
      case MessageType.Success:
        this.success(message, summary);
        break;

      case MessageType.Info:
        this.info(message, summary);
        break;

      case MessageType.Warn:
        this.warn(message, summary);
        break;

      case MessageType.Error:
        this.error(message, summary);
        break;
    }
  }

  success(
    detail: string,
    summary = 'Success'
  ): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000,
    });
  }

  info(
    detail: string,
    summary = 'Information'
  ): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 3000,
    });
  }

  warn(
    detail: string,
    summary = 'Warning'
  ): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 4000,
    });
  }

  error(
    detail: string,
    summary = 'Error'
  ): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000,
    });
  }

  clear(): void {
    this.messageService.clear();
  }
}