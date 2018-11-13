import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinAnalysisComponent } from './coin-analysis.component';

describe('CoinAnalysisComponent', () => {
  let component: CoinAnalysisComponent;
  let fixture: ComponentFixture<CoinAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
