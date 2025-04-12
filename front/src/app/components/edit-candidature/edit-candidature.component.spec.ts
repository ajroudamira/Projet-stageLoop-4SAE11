import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCandidatureComponent } from './edit-candidature.component';

describe('EditCandidatureComponent', () => {
  let component: EditCandidatureComponent;
  let fixture: ComponentFixture<EditCandidatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCandidatureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCandidatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
