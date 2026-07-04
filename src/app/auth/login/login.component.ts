import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { firstValueFrom } from 'rxjs';

import { UserType } from '../../core/enums/user-type.enum';
import { SiteCategory } from '../../core/enums/site-category.enum';
import { Site, SiteService } from '../../core/services/site.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'to-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    ToggleSwitchModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  username = '';
  password = '';

  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');
  demoMode = signal(localStorage.getItem('demoMode') === 'false');

  currentYear = new Date().getFullYear();

  metrics = [
    { value: '7', label: 'Live Sites' },
    { value: '42', label: 'Devices' },
    { value: '5', label: 'Roles' },
  ];

  demoAccounts = [
    {
      username: 'superadmin',
      role: 'Super Admin',
      description: 'Platform administration & tenants',
    },
    {
      username: 'tenantadmin',
      role: 'Tenant Admin',
      description: 'Operations NOC dashboard',
    },
    {
      username: 'technician',
      role: 'Technician',
      description: 'Field engineer task dashboard',
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private sitesService: SiteService,
  ) { }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  toggleDemoMode(value: boolean): void {
    this.demoMode.set(value);
    localStorage.setItem('demoMode', String(value));
    this.errorMessage.set('');
  }

  async submit(): Promise<void> {
    if (this.loading()) return;
    console.log('called')

    this.errorMessage.set('');

    const username = this.username.trim();

    if (!username || !this.password) {
      this.errorMessage.set('Please enter username and password.');
      return;
    }

    try {
      this.loading.set(true);
      console.log('Requested')
      const response = await this.authService.login({
        username,
        password: this.password,
      });

      if (!response?.success || !response.data?.token) {
        this.errorMessage.set(response?.message || 'Login failed.');
        return;
      }

      await this.navigateAfterLogin(response.data.userType);
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage.set('Invalid username or password.');
    } finally {
      this.loading.set(false);
    }
  }

  async demoLogin(account: { username: string }): Promise<void> {
    if (!this.demoMode()) {
      this.errorMessage.set('Enable Demo Mode to use demo login.');
      return;
    }

    const mapping: Record<string, UserType> = {
      superadmin: UserType.SUPER_ADMIN,
      tenantadmin: UserType.TENANT_ADMIN,
      technician: UserType.TECHNICIAN,
    };

    const userType = mapping[account.username];

    if (!userType) {
      this.errorMessage.set('Unknown demo account.');
      return;
    }

    try {
      this.loading.set(true);
      this.errorMessage.set('');

      await this.authService.loginDemo(userType, account.username);
      await this.navigateAfterLogin(userType);
    } catch (error) {
      console.error('Demo login failed:', error);
      this.errorMessage.set('Demo login failed.');
    } finally {
      this.loading.set(false);
    }
  }

  private async navigateAfterLogin(userType?: UserType): Promise<void> {
    switch (userType) {
      case UserType.SUPER_ADMIN:
        await this.router.navigateByUrl('/platform-dashboard', {
          replaceUrl: true,
        });
        return;

      case UserType.TECHNICIAN:
        await this.router.navigateByUrl('/technician-dashboard', {
          replaceUrl: true,
        });
        return;

      case UserType.TENANT_ADMIN:
      case UserType.ADMIN:
        await this.handleTenantAdminNavigation();
        return;

      default:
        this.errorMessage.set('Unsupported user type.');
    }
  }

  private async handleTenantAdminNavigation(): Promise<void> {
    try {
      const response = await firstValueFrom(this.sitesService.getAll());

      if (!response?.success) {
        await this.router.navigateByUrl('/site-category-selection', {
          replaceUrl: true,
        });
        return;
      }

      const categoryCounts = this.getCategoryCounts(response.data ?? []);

      sessionStorage.setItem(
        'siteCategoryCounts',
        JSON.stringify(categoryCounts),
      );

      const categories = Object.keys(categoryCounts).filter(
        (key) => (categoryCounts[key as SiteCategory] ?? 0) > 0,
      ) as SiteCategory[];

      if (categories.length === 1) {
        await this.router.navigate(
          ['/dashboard/site-category', categories[0].toLowerCase()],
          { replaceUrl: true },
        );
        return;
      }

      await this.router.navigateByUrl('/site-category-selection', {
        replaceUrl: true,
      });
    } catch (error) {
      console.error('Site loading failed after login:', error);

      await this.router.navigateByUrl('/site-category-selection', {
        replaceUrl: true,
      });
    }
  }

  private getCategoryCounts(
    sites: Site[],
  ): Partial<Record<SiteCategory, number>> {
    return sites.reduce((acc, site) => {
      if (!site.category) return acc;

      acc[site.category] = (acc[site.category] ?? 0) + 1;
      return acc;
    }, {} as Partial<Record<SiteCategory, number>>);
  }
}