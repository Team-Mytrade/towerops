import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'to-server-error-page',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './server-error.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerErrorPage {}