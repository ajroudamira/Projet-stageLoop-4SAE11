import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrepriseFrontComponent } from './entreprise-front.component';

describe('EntrepriseFrontComponent', () => {
  let component: EntrepriseFrontComponent;
  let fixture: ComponentFixture<EntrepriseFrontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrepriseFrontComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EntrepriseFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
