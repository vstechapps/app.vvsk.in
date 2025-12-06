import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-install-app',
  standalone: true,
  imports: [],
  templateUrl: './install-app.html',
  styleUrl: './install-app.css',
})
export class InstallApp implements OnInit {
  deferredPrompt: any;
  showInstallButton = signal(false);

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
}
