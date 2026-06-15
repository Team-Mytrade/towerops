import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'to-maintenance-page',
  standalone: true,
  templateUrl: './maintenance.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenancePage {}