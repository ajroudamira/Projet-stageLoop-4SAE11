import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfficherEvaluationComponent } from './afficher-evaluation.component';

describe('AfficherEvaluationComponent', () => {
  let component: AfficherEvaluationComponent;
  let fixture: ComponentFixture<AfficherEvaluationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AfficherEvaluationComponent]
    });
    fixture = TestBed.createComponent(AfficherEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
