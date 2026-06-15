import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

type DemoAccount = {
  role: string;
  email: string;
  password: string;
  testId: string;
};

@Component({
  selector: 'to-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  email = 'noc@towerops.io';
  password = 'Noc@123';

  loading = signal(false);
  showPassword = signal(false);

  currentYear = new Date().getFullYear();

  metrics = [
    { value: '7', label: 'Live Sites' },
    { value: '42', label: 'Devices' },
    { value: '5', label: 'Roles' },
  ];

  demoAccounts: DemoAccount[] = [
    {
      role: 'Super Admin',
      email: 'admin@towerops.io',
      password: 'Admin@123',
      testId: 'demo-super-admin',
    },
    {
      role: 'NOC Operator',
      email: 'noc@towerops.io',
      password: 'Noc@123',
      testId: 'demo-noc-operator',
    },
    {
      role: 'Maintenance Eng.',
      email: 'kiran@towerops.io',
      password: 'Kiran@123',
      testId: 'demo-maintenance-eng',
    },
    {
      role: 'Field Engineer',
      email: 'ravi@towerops.io',
      password: 'Ravi@123',
      testId: 'demo-field-engineer',
    },
  ];

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  fillDemo(account: DemoAccount): void {
    this.email = account.email;
    this.password = account.password;
  }

  submit(): void {
    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/dashboard']);
    }, 600);
  }
}