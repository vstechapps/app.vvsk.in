import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WealthMeter } from './wealth-meter';

describe('WealthMeter', () => {
  let component: WealthMeter;
  let fixture: ComponentFixture<WealthMeter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WealthMeter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WealthMeter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
