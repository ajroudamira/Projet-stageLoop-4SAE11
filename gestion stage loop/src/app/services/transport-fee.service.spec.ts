import { TestBed } from '@angular/core/testing';

import { TransportFeeService } from './transport-fee.service';

describe('TransportFeeService', () => {
  let service: TransportFeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransportFeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
