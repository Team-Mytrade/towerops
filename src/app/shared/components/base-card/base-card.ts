import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'to-base-card',
  standalone: true,
  templateUrl: './base-card.html',
  styleUrl: './base-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseCard {
  title = input<string>();
  subtitle = input<string>();
  testid = input<string>('base-card');
}