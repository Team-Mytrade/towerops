import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatCardTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'to-stat-card',
  standalone: true,
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly meta = input<string>('');
  readonly icon = input<string>('');
  readonly tone = input<StatCardTone>('default');
}