import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleEngineComponent } from './rule-engine.component';

describe('RuleEngineComponent', () => {
  let component: RuleEngineComponent;
  let fixture: ComponentFixture<RuleEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleEngineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RuleEngineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
