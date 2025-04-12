import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrepriseQcmComponent } from './entreprise-qcm.component';

describe('EntrepriseQcmComponent', () => {
  let component: EntrepriseQcmComponent;
  let fixture: ComponentFixture<EntrepriseQcmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrepriseQcmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EntrepriseQcmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
