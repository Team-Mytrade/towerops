import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type DrawerSize = 'compact' | 'medium' | 'wide' | 'full';

@Component({
  selector: 'to-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawer.html',
  styleUrl: './drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Drawer {
  readonly open = input<boolean>(false);
  readonly title = input.required<string>();
  readonly eyebrow = input<string>('');
  readonly size = input<DrawerSize>('compact');

  readonly closed = output<void>();
}