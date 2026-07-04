import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { AuthService } from '../../core/services/auth.service';
import { LoginComponent } from './login.component';
import { SiteCategory } from '../../core/enums/site-category.enum';
import { Site, SiteService } from '../../core/services/site.service';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: { login: any; setSession: any };
  let siteService: { getAll: any };
  let router: Router;

  beforeEach(async () => {
    authService = {
      login: vi.fn().mockResolvedValue({
        success: true,
        data: {
          token: 'demo-superadmin-token',
          username: 'superadmin',
          tenantId: 'DEFAULT',
          userId: 1,
          userType: 'SUPER_ADMIN',
          roles: ['SUPER_ADMIN'],
          permissions: ['*'],
        },
      }),
      setSession: vi.fn(),
    };

    siteService = {
      getAll: vi.fn().mockReturnValue(of({ success: true, data: [] })),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: SiteService,
          useValue: siteService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a demo session and navigate to the dashboard', async () => {
    await component.demoLogin(component.demoAccounts[0]);

    expect(authService.login).toHaveBeenCalledWith({
      username: 'superadmin',
      password: 'password',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/platform-dashboard', {
      replaceUrl: true,
    });
  });
});
