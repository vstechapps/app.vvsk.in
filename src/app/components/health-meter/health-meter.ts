import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-health-meter',
  standalone: true,
  imports: [],
  templateUrl: './health-meter.html',
  styleUrl: './health-meter.css',
})
export class HealthMeter implements OnChanges {
  @Input() value: number = 78;
  dashArray: string = '0 100';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.updateGauge();
    }
  }

  updateGauge() {
    const pct = Math.max(0, Math.min(100, Math.round(this.value)));
    this.dashArray = `${pct} ${100 - pct}`;
  }
}
