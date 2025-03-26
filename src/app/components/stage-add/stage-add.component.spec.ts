import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StageAddComponent } from './stage-add.component';

  let component: StageAddComponent;
  let fixture: ComponentFixture<StageAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StageAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
;
