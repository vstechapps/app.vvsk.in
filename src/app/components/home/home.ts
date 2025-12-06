import { Component, OnInit, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';


import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  isStandalone = false;

  ngOnInit() {
    // In development (local), treat as standalone to bypass install prompt
    // Local is defined as neither production nor test
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || (!environment.production && !environment.test);

    // If installed (standalone) and authenticated, navigate to dashboard
    if (this.isStandalone) {
      this.authService.user$.subscribe(user => {
        if (user) {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }
}
