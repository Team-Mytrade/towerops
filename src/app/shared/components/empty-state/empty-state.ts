import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'to-empty-state',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  icon = input<string>('fa-solid fa-inbox');
  title = input<string>('No data found');
  message = input<string>('There are no records to display.');

  actionLabel = input<string>();
  actionIcon = input<string>('pi pi-plus');

  action = output<void>();

  onAction(): void {
    this.action.emit();
  }
}