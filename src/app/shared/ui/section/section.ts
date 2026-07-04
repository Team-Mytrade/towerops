import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'to-section',
  standalone: true,
  templateUrl: './section.html',
  styleUrl: './section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Section {
  readonly title = input.required<string>();
  readonly eyebrow = input<string>('');
  readonly description = input<string>('');
}