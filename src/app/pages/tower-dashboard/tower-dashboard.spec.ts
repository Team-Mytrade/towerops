import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TowerDashboard } from './tower-dashboard';

describe('TowerDashboard', () => {
  let component: TowerDashboard;
  let fixture: ComponentFixture<TowerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TowerDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(TowerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
