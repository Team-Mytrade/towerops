// src/app/shared/ui/drawer/drawer.component.ts

import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  model,
  output
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  DRAWER_BOTTOM_SIZES,
  DRAWER_POSITIONS,
  DRAWER_SIZES
} from './drawer.constants';

import {
  DrawerPosition,
  DrawerSize
} from './drawer.types';

@Component({
  selector: 'fx-drawer',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './drawer.html',

  styleUrl: './drawer.scss',

  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class DrawerComponent {
  open = model(false);

  title = input('');

  description = input('');

  position =
    input<DrawerPosition>('right');

  size = input<DrawerSize>('md');

  closeOnBackdrop = input(true);

  closeOnEscape = input(true);

  showClose = input(true);

  showHandle = input(true);

  loading = input(false);

  className = input('');

  opened = output<void>();

  closed = output<void>();

  drawerClasses = computed(() => {
    const position =
      this.position();

    const sizeClass =
      position === 'bottom'
        ? DRAWER_BOTTOM_SIZES[
            this.size()
          ]
        : position === 'top'
          ? DRAWER_BOTTOM_SIZES[
              this.size()
            ]
          : DRAWER_SIZES[
              this.size()
            ];

    return [
      'fx-drawer__panel',

      DRAWER_POSITIONS[
        position
      ],

      sizeClass,

      this.className()
    ]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  });

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (
      this.open() &&
      this.closeOnEscape()
    ) {
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
    if (
      this.closeOnBackdrop()
    ) {
      this.close();
    }
  }

  isBottom(): boolean {
    return (
      this.position() ===
      'bottom'
    );
  }

  isTop(): boolean {
    return (
      this.position() === 'top'
    );
  }
}