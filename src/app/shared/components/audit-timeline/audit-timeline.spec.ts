import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditTimeline } from './audit-timeline';

describe('AuditTimeline', () => {
  let component: AuditTimeline;
  let fixture: ComponentFixture<AuditTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditTimeline],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditTimeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
