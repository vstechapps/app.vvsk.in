import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthMeter } from './health-meter';

describe('HealthMeter', () => {
  let component: HealthMeter;
  let fixture: ComponentFixture<HealthMeter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthMeter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthMeter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
