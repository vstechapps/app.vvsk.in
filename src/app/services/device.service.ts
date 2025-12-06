import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class DeviceService {
    isPwa = signal(false);
    isMobile = signal(false);
    isDesktop = signal(false);
    isOnline = signal(true);

    constructor(private router: Router) { }

    initialize(): Promise<void> {
        return new Promise((resolve) => {
            this.checkPwa();
            this.checkDeviceType();
            this.checkNetwork();
            resolve();
        });
    }

    private checkPwa() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        // @ts-ignore
        const isNavigatorStandalone = window.navigator.standalone; // iOS
        this.isPwa.set(isStandalone || isNavigatorStandalone || false);
        if (!this.isPwa()) {
            this.router.navigate(['/install-app']);
        }
    }

    private checkNetwork() {
        this.isOnline.set(navigator.onLine);
        window.addEventListener('online', () => {
            this.isOnline.set(true);
        });
        window.addEventListener('offline', () => {
            this.isOnline.set(false);
            this.router.navigate(['/no-internet']);
        });

        if (!navigator.onLine) {
            this.router.navigate(['/no-internet']);
        }
    }

    private checkDeviceType() {
        const ua = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        this.isMobile.set(isMobile);
        this.isDesktop.set(!isMobile);
    }
}
