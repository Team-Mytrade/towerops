import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  constructor(
    private readonly confirmationService: ConfirmationService
  ) {}

  confirmDelete(
    message = 'Are you sure you want to delete this record?',
    accept: () => void
  ): void {
    this.confirmationService.confirm({
      header: 'Confirm Delete',
      message,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept,
    });
  }

  confirmAction(
    header: string,
    message: string,
    accept: () => void
  ): void {
    this.confirmationService.confirm({
      header,
      message,
      icon: 'pi pi-info-circle',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      rejectButtonStyleClass: 'p-button-text',
      accept,
    });
  }
}