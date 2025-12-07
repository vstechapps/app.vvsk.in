import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-wealth-meter',
  standalone: true,
  imports: [],
  templateUrl: './wealth-meter.html',
  styleUrl: './wealth-meter.css',
})
export class WealthMeter implements OnChanges {
  @Input() value: number = 61;
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
