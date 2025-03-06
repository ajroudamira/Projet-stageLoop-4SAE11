import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfficherModerationComponent } from './afficher-moderation.component';

describe('AfficherModerationComponent', () => {
  let component: AfficherModerationComponent;
  let fixture: ComponentFixture<AfficherModerationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AfficherModerationComponent]
    });
    fixture = TestBed.createComponent(AfficherModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
