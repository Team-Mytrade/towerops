import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'to-form-field',
  standalone: true,
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  readonly required = input<boolean>(false);
}