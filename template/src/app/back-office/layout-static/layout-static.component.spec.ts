import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutStaticComponent } from './layout-static.component';

describe('LayoutStaticComponent', () => {
  let component: LayoutStaticComponent;
  let fixture: ComponentFixture<LayoutStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutStaticComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LayoutStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
