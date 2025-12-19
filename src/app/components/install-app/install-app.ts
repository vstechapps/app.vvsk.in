import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-install-app',
  standalone: true,
  imports: [],
  templateUrl: './install-app.html',
  styleUrl: './install-app.css',
})
export class InstallApp implements OnInit {
  private router = inject(Router);
  deferredPrompt: any;
  showInstallButton = signal(true);

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      this.showInstallButton.set(true);
    });
  }

  async installPwa() {
    if (this.deferredPrompt) {
      // Show the install prompt
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // We've used the prompt, and can't use it again, throw it away
      this.deferredPrompt = null;
      this.showInstallButton.set(false);
    }
  }

  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
  }

  openApp() {
    if (this.isStandalone()) {
      // Already inside PWA → just navigate
      this.router.navigateByUrl('/login');
    } else {
      showToast('Opening app in 5 seconds...');
      setTimeout(() => {
        window.location.href = "https://la.vvsk.in?open=true";
      }, 5000);
    }
  }
}
function showToast(arg0: string) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = arg0;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

