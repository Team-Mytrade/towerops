import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TimelineTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

export type TimelineItem = {
  title: string;
  description?: string;
  time?: string;
  tone?: TimelineTone;
};

@Component({
  selector: 'to-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timeline {
  readonly items = input.required<TimelineItem[]>();
}