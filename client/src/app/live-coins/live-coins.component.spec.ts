import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveCoinsComponent } from './live-coins.component';

describe('LiveCoinsComponent', () => {
  let component: LiveCoinsComponent;
  let fixture: ComponentFixture<LiveCoinsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveCoinsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveCoinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
