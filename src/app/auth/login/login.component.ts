import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../core/services/auth.service';
import { Site, SiteCategory, SiteService } from '../../core/services/site.service';
import { firstValueFrom } from 'rxjs';

type SiteCategoryKey = 'tower' | 'building' | 'warehouse';

@Component({
  selector: 'to-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  username = 'admin_user';
  password = 'StrongPass@123';

  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  currentYear = new Date().getFullYear();

  metrics = [
    { value: '7', label: 'Live Sites' },
    { value: '42', label: 'Devices' },
    { value: '5', label: 'Roles' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private sitesService: SiteService,
  ) {
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  async submit(): Promise<void> {
    if (this.loading()) return;

    this.errorMessage.set('');

    const username = this.username.trim();

    if (!username || !this.password) {
      this.errorMessage.set('Please enter username and password.');
      return;
    }

    try {
      this.loading.set(true);

      const response = await this.authService.login({
        username,
        password: this.password,
      });

      if (!response.success || !response.data) {
        this.errorMessage.set(response.message || 'Login failed.');
        return;
      }

      const tenantId = response.data.tenantId;

      if (tenantId === 'DEFAULT') {
        this.router.navigateByUrl('/platform-dashboard', { replaceUrl: true });
        return;
      }

      await this.handleTenantAdminNavigation();
    } catch (error) {
      console.error('Login failed:', error);
      this.errorMessage.set('Invalid username or password.');
    } finally {
      this.loading.set(false);
    }
  }

private async handleTenantAdminNavigation(): Promise<void> {
  const response = await firstValueFrom(this.sitesService.getAll());

  if (!response.success) {
    this.errorMessage.set(response.message || 'Unable to load sites.');
    return;
  }

  const categoryCounts = this.getCategoryCounts(response.data ?? []);
  const categories = Object.keys(categoryCounts) as SiteCategory[];

  sessionStorage.setItem('siteCategoryCounts', JSON.stringify(categoryCounts));

  if (categories.length === 1) {
    this.router.navigate(['/dashboard/site-category', categories[0].toLowerCase()], {
      replaceUrl: true,
    });
    return;
  }

  this.router.navigateByUrl('/site-category-selection', { replaceUrl: true });
}

private getCategoryCounts(sites: Site[]): Partial<Record<SiteCategory, number>> {
  return sites.reduce((acc, site) => {
    if (!site.category) return acc;

    acc[site.category] = (acc[site.category] ?? 0) + 1;
    return acc;
  }, {} as Partial<Record<SiteCategory, number>>);
}

  private normalizeCategory(category: string | null | undefined): SiteCategoryKey | null {
    const value = category?.trim().toLowerCase();

    if (value === 'tower' || value === 'towers') return 'tower';
    if (value === 'building' || value === 'buildings') return 'building';
    if (value === 'warehouse' || value === 'warehouses') return 'warehouse';

    return null;
  }
}