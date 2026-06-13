import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

type TowerLocation = {
  name: string;
  region: string;
  towerCount: number;
  criticalCount: number;
};


@Component({
  selector: 'to-topbar',
  standalone: true,
  imports: [CommonModule, TooltipModule, DatePipe, SelectModule, FormsModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar implements OnInit, OnDestroy {
  alertCount = signal(1);
  now = signal(new Date());
  isFullscreen = signal(false);

  locations: TowerLocation[] = [
    { name: 'Chennai Network', region: 'Tamil Nadu, India', towerCount: 24, criticalCount: 1 },
    { name: 'Bangalore Network', region: 'Karnataka, India', towerCount: 18, criticalCount: 2 },
    { name: 'Hyderabad Network', region: 'Telangana, India', towerCount: 21, criticalCount: 0 },
    { name: 'Mumbai Network', region: 'Maharashtra, India', towerCount: 32, criticalCount: 4 },
  ];

  selectedLocation: TowerLocation = this.locations[0];
  private timerId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.timerId = setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      this.isFullscreen.set(true);
      return;
    }
    this.isFullscreen.set(false);

    document.exitFullscreen?.();
  }
}