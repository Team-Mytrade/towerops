import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'to-skeleton',
  standalone: true,
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skeleton {
  readonly height = input<string>('16px');
  readonly width = input<string>('100%');
}