import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'to-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, PasswordModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  email = 'admin@towerops.io';
  password = 'Admin@123';
  loading = signal(false);
  currentYear = new Date().getFullYear();

  metrics = [
    { icon: 'pi pi-wifi', value: '24K+', label: 'Live Sensors' },
    { icon: 'pi pi-chart-line', value: '99.8%', label: 'Uptime' },
    { icon: 'pi pi-shield', value: '96%', label: 'SLA Met' },
  ];

  constructor(private router: Router) {}

  submit(): void {
    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/dashboard']);
    }, 600);
  }
}