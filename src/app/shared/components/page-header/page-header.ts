import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';

@Component({
  selector: 'to-page-header',
  standalone: true,
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
@Input() title = '';
  @Input() subtitle = '';
  @Input() eyebrow = '';
  @Input() testId = 'page-header';
}