import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AuthUser, LoginResponse } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';

type DemoAccount = {
  role: string;
  name: string;
  email: string;
  password: string;
  permissions: string[];
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
      name: 'Aarav Sharma',
      email: 'admin@towerops.io',
      password: 'Admin@123',
      permissions: ['*'],
      testId: 'demo-super-admin',
    },
    {
      role: 'NOC Operator',
      name: 'Nisha Rao',
      email: 'noc@towerops.io',
      password: 'Noc@123',
      permissions: ['dashboard:view', 'alarms:view', 'work-orders:view'],
      testId: 'demo-noc-operator',
    },
    {
      role: 'Maintenance Eng.',
      name: 'Kiran Kumar',
      email: 'kiran@towerops.io',
      password: 'Kiran@123',
      permissions: ['maintenance:view', 'work-orders:update'],
      testId: 'demo-maintenance-eng',
    },
    {
      role: 'Field Engineer',
      name: 'Ravi Menon',
      email: 'ravi@towerops.io',
      password: 'Ravi@123',
      permissions: ['work-orders:view', 'work-orders:update'],
      testId: 'demo-field-engineer',
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  fillDemo(account: DemoAccount): void {
    this.email = account.email;
    this.password = account.password;
  }

  demoLogin(account: DemoAccount): void {
    this.fillDemo(account);
    this.signInDemoAccount(account);
  }

  submit(): void {
    const account = this.demoAccounts.find(
      (demoAccount) =>
        demoAccount.email.toLowerCase() === this.email.trim().toLowerCase() &&
        demoAccount.password === this.password,
    );

    this.signInDemoAccount(account ?? this.demoAccounts[1]);
  }

  private signInDemoAccount(account: DemoAccount): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    setTimeout(() => {
      this.authService.setSession(this.createDemoSession(account));
      this.loading.set(false);
      this.router.navigate(['/dashboard']);
    }, 600);
  }

  private createDemoSession(account: DemoAccount): LoginResponse {
    const user: AuthUser = {
      id: account.email,
      name: account.name,
      email: account.email,
      role: account.role,
      permissions: account.permissions,
    };

    return {
      accessToken: `demo-access-token:${account.email}`,
      refreshToken: `demo-refresh-token:${account.email}`,
      user,
    };
  }
}
