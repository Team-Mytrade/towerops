import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'to-detail-field',
  standalone: true,
  templateUrl: './detail-field.html',
  styleUrl: './detail-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailField {
  readonly label = input.required<string>();
  readonly value = input<string | number | null | undefined>('-');
}