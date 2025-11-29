import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AuthService } from '../../services/auth';
import { FirestoreService } from '../../services/firestore';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Filler,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Filler,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MatCardModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  authService = inject(AuthService);
  firestoreService = inject(FirestoreService);

  laScore = 0;
  user$ = this.authService.user$;

  // Bar Chart (Current Score)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#333' }
    },
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['LA Score'],
    datasets: [
      { data: [0], label: 'Score', backgroundColor: ['#3f51b5'], borderRadius: 5 }
    ]
  };

  // Line Chart (History)
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.4 },
      point: { radius: 4, hoverRadius: 6 }
    },
    scales: {
      x: { grid: { display: false } },
      y: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } }
    },
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        label: 'Weekly Progress',
        backgroundColor: 'rgba(63, 81, 181, 0.2)',
        borderColor: '#3f51b5',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3f51b5',
        fill: 'origin',
      }
    ]
  };

  ngOnInit() {
    this.authService.user$.pipe(
      switchMap(user => {
        if (user) {
          this.firestoreService.initUserData(user.uid);
          return this.firestoreService.getUserData(user.uid);
        }
        return of(null);
      })
    ).subscribe(data => {
      if (data && data['laScore'] !== undefined) {
        this.laScore = data['laScore'];
        this.updateChart(this.laScore);
      }
    });
  }

  updateChart(score: number) {
    this.barChartData = {
      labels: ['Current Score'],
      datasets: [
        { data: [score], label: 'LA Score', backgroundColor: ['#3f51b5'], borderRadius: 5 }
      ]
    };

    // Update line chart with dynamic data if available (mocking for now based on score)
    const history = [score - 10, score - 5, score + 2, score - 2, score + 5, score, score];
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [{
        ...this.lineChartData.datasets[0],
        data: history.map(v => Math.max(0, Math.min(100, v))) // Ensure within 0-100
      }]
    };
  }
}
