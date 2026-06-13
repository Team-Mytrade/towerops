import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailDrawer } from './detail-drawer';

describe('DetailDrawer', () => {
  let component: DetailDrawer;
  let fixture: ComponentFixture<DetailDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailDrawer],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailDrawer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
