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
  showInstallButton = signal(false);
  //@ts-ignore


  constructor() {
    localStorage.clear();
    let app_installed = localStorage.getItem("APP_INSTALLED");
    if (app_installed == null || app_installed == "false") {
      // App not installed on device
      this.showInstallButton = signal(true);
    } else if (this.isStandalone()) {
      // Already inside PWA → just navigate
      this.router.navigateByUrl('/home');
    }
  }

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

    //@ts-ignore
    let installedRelatedApps: any = await navigator.getInstalledRelatedApps?.();
    console.log(JSON.stringify(installedRelatedApps));
    alert(JSON.stringify(installedRelatedApps));

    if (this.deferredPrompt) {
      // Show the install prompt
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        localStorage.setItem("APP_INSTALLED", "true");
        this.router.navigateByUrl('/home');
      } else {
        console.log('User dismissed the install prompt');
        localStorage.setItem("APP_INSTALLED", "false");
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
    window.location.href = "https://la.vvsk.in?open=true";
  }
}

