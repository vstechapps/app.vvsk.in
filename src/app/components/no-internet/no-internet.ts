import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-no-internet',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="no-internet-container">
      <mat-card class="message-card">
        <mat-icon class="error-icon" color="warn">wifi_off</mat-icon>
        <h2>Unable to connect to Internet</h2>
        <p>Please check your connection and try again.</p>
        <button mat-raised-button color="primary" (click)="retry()">
          <mat-icon>refresh</mat-icon>
          Retry
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    .no-internet-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .message-card {
      padding: 40px;
      text-align: center;
      max-width: 400px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
    h2 {
      margin: 0;
      color: #333;
    }
    p {
      color: #666;
      margin: 0;
    }
  `]
})
export class NoInternet {
  retry() {
    window.location.href = '/';
  }
}
