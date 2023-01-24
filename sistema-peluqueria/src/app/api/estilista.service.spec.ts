import { TestBed } from '@angular/core/testing';

import { EstilistaService } from './estilista.service';

describe('EstilistaService', () => {
  let service: EstilistaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstilistaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
