uimport { TestBed } from '@angular/core/testing';

import { EtudiantWebsocketService } from './etudiant-websocket.service';

describe('EtudiantWebsocketService', () => {
  let service: EtudiantWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtudiantWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
