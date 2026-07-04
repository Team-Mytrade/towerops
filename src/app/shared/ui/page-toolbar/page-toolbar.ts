import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'to-page-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './page-toolbar.html',
  styleUrl: './page-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageToolbar {
  readonly search = input<string>('');
  readonly searchPlaceholder = input<string>('Search...');
  readonly showSearch = input<boolean>(true);

  readonly searchChange = output<string>();
}