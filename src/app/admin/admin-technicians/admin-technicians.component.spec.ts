import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTechniciansComponent } from './admin-technicians.component';

describe('AdminTechniciansComponent', () => {
  let component: AdminTechniciansComponent;
  let fixture: ComponentFixture<AdminTechniciansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTechniciansComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTechniciansComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
