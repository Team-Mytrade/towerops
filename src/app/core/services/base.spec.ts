import { TestBed } from '@angular/core/testing';

import { Base } from './base';

describe('Base', () => {
  let service: Base;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Base);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
