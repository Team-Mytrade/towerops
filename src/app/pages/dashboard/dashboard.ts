import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'to-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}