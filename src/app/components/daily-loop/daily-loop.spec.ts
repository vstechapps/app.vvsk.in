import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyLoop } from './daily-loop';

describe('DailyLoop', () => {
  let component: DailyLoop;
  let fixture: ComponentFixture<DailyLoop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyLoop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyLoop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
