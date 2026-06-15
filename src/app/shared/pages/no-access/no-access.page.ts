import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'to-no-access-page',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './no-access.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoAccessPage {}