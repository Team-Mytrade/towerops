import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App  implements OnInit {
  constructor(
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.initializeMockUser();
  }
  protected readonly title = signal('towerops');
}
