import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AppMode, DEFAULT_DEVICE, Device, DeviceType } from '../app.model';

@Injectable({
    providedIn: 'root'
})
export class DeviceService {

    device: Device = DEFAULT_DEVICE;

    constructor(private router: Router) {
        this.checkPwa();
        this.checkNetwork();
        this.checkDeviceType();
    }

    initialize(): Promise<void> {
        return new Promise((resolve) => {
            this.registerPeriodicSync();
            resolve();
        });
    }

    async registerPeriodicSync() {
        if ('serviceWorker' in navigator && 'periodicSync' in (navigator as any).serviceWorker) {
            const registration = await navigator.serviceWorker.ready;
            try {
                // @ts-ignore
                await registration.periodicSync.register('notification-check', {
                    minInterval: 5 * 60 * 1000, // 5 mins
                });
                console.log('Periodic sync registered');
            } catch (err) {
                console.error('Periodic sync registration failed', err);
            }
        }
    }

    async syncNotifications(notifications: any[]) {
        console.log('Syncing notifications to Service Worker:', notifications.length, 'tasks');
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            if (registration.active) {
                registration.active.postMessage({
                    type: 'SYNC_NOTIFICATIONS',
                    notifications
                });
                console.log('Sync message sent to active Service Worker');
            } else {
                console.warn('Service Worker active instance not found for sync');
            }
        } else {
            console.warn('Service Worker not supported or not registered');
        }
    }

    private checkPwa() {
        let isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        // @ts-ignore
        const isNavigatorStandalone = window.navigator.standalone; // iOS

        isStandalone = isStandalone || isNavigatorStandalone;
        this.device.mode = isStandalone ? AppMode.STANDALONE : AppMode.BROWSER;
        if (this.device.mode == AppMode.BROWSER) {
            this.router.navigate(['/install-app']);
        }
    }

    private checkNetwork() {
        this.device.online = navigator.onLine;
        window.addEventListener('online', () => {
            this.device.online = true;
        });
        window.addEventListener('offline', () => {
            this.device.online = false;
            this.router.navigate(['/no-internet']);
        });

        if (!navigator.onLine) {
            this.router.navigate(['/no-internet']);
        }
    }

    private checkDeviceType() {
        const ua = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        this.device.type = isMobile ? DeviceType.MOBILE : DeviceType.DESKTOP;
    }
}
