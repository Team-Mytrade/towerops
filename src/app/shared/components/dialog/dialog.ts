import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  model,
  output,
} from '@angular/core';

import {
  DIALOG_POSITIONS,
  DIALOG_SIZES,
} from './dialog.constants';

import {
  DialogPosition,
  DialogSize,
} from './dialog.types';

@Component({
  selector: 'fx-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  open = model(false);

  title = input('');
  description = input('');

  size = input<DialogSize>('md');
  position = input<DialogPosition>('center');

  closeOnBackdrop = input(true);
  closeOnEscape = input(true);
  showClose = input(true);
  showFooter = input(true);

  loading = input(false);
  className = input('');

  opened = output<void>();
  closed = output<void>();

  dialogClasses = computed(() =>
    [
      'fx-dialog__panel',
      DIALOG_SIZES[this.size()],
      DIALOG_POSITIONS[this.position()],
      this.className(),
    ]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  );

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.open() && this.closeOnEscape()) {
      this.close();
    }
  }

  show(): void {
    this.open.set(true);
    this.opened.emit();
  }

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }
}