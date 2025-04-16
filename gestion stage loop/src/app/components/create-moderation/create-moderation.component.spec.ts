import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateModerationComponent } from './create-moderation.component';

describe('CreateModerationComponent', () => {
  let component: CreateModerationComponent;
  let fixture: ComponentFixture<CreateModerationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateModerationComponent]
    });
    fixture = TestBed.createComponent(CreateModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
