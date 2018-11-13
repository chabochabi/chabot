import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestCoinsComponent } from './backtest-coins.component';

describe('CoinsComponent', () => {
  let component: BacktestCoinsComponent;
  let fixture: ComponentFixture<BacktestCoinsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacktestCoinsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestCoinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
