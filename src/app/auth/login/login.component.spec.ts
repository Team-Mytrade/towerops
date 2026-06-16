import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: { setSession: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authService = {
      setSession: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a demo session and navigate to the dashboard', () => {
    vi.useFakeTimers();

    component.demoLogin(component.demoAccounts[0]);
    vi.runAllTimers();

    expect(authService.setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'demo-access-token:admin@towerops.io',
        user: expect.objectContaining({
          email: 'admin@towerops.io',
          role: 'Super Admin',
        }),
      }),
    );
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);

    vi.useRealTimers();
  });
});
