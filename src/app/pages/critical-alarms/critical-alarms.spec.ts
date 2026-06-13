import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriticalAlarms } from './critical-alarms';

describe('CriticalAlarms', () => {
  let component: CriticalAlarms;
  let fixture: ComponentFixture<CriticalAlarms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriticalAlarms],
    }).compileComponents();

    fixture = TestBed.createComponent(CriticalAlarms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
