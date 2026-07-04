import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRolesComponent } from './admin-roles.component';

describe('AdminRolesComponent', () => {
  let component: AdminRolesComponent;
  let fixture: ComponentFixture<AdminRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRolesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRolesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
