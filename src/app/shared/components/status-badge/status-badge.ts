import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatusBadgeVariant =
  | 'healthy'
  | 'critical'
  | 'warning'
  | 'info'
  | 'success'
  | 'danger'
  | 'neutral';

@Component({
  selector: 'to-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  label = input.required<string>();
  variant = input<StatusBadgeVariant>('neutral');

  readonly classes = computed(() => `to-status-badge to-status-badge--${this.variant()}`);
}