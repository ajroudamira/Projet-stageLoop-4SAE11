import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrepriseStatisticsComponent } from './entreprise-statistics.component';

describe('EntrepriseStatisticsComponent', () => {
  let component: EntrepriseStatisticsComponent;
  let fixture: ComponentFixture<EntrepriseStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrepriseStatisticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EntrepriseStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
