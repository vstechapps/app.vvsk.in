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
  deferredPrompt: any;
  showInstallButton = false;
  isStandalone = false;

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: Event) {
    e.preventDefault();
    this.deferredPrompt = e;
    // Only show install button in production or test environments
    if (environment.production || environment.test) {
      this.showInstallButton = true;
    }
  }

  ngOnInit() {
    // In development (local), treat as standalone to bypass install prompt
    // Local is defined as neither production nor test
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || (!environment.production && !environment.test);

    // Show install button by default if not in standalone mode
    // The beforeinstallprompt event will update this if it fires
    if (!this.isStandalone) {
      this.showInstallButton = true;
    }

    // If installed (standalone) and authenticated, navigate to dashboard
    if (this.isStandalone) {
      this.authService.user$.subscribe(user => {
        if (user) {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        this.showInstallButton = false;
      }
      this.deferredPrompt = null;
    }
  }
}
