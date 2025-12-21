import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from './notifications.service';
import { NotificationModel } from './notification.model';
import { QueryDocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { AppUser } from '../../app.model';
import { DeviceService } from '../../services/device.service';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatCardModule],
    templateUrl: './notifications.html',
    styleUrl: './notifications.css'
})
export class Notifications implements OnInit, OnDestroy {

    pageSize = 5;
    notifications: NotificationModel[] = [];
    loading = false;
    private lastDoc?: QueryDocumentSnapshot<DocumentData> | null = null;
    private pageStack: (QueryDocumentSnapshot<DocumentData> | null)[] = [];

    showModal = false;
    editing?: NotificationModel | null = null;
    form: FormGroup;
    emptyMode = false;
    user: AppUser | null = null;
    private authSub?: Subscription;

    constructor(
        private ns: NotificationService,
        private fb: FormBuilder,
        private authService: AuthService,
        private deviceService: DeviceService,
        private cdr: ChangeDetectorRef
    ) {
        this.form = this.fb.group({
            title: ['', Validators.required],
            repeat: ['Daily'],
            day: ['Everyday'],
            time: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]]
        });
    }

    ngOnInit() {
        this.loading = true;
        this.authSub = this.authService.user$.subscribe(user => {
            if (user) {
                this.user = user;
                this.loadFirstPage();
                this.requestNotificationPermission();
                this.cdr.detectChanges();
            } else {
                this.loading = false;
                this.emptyMode = true;
                this.cdr.detectChanges();
            }
        });
    }

    ngOnDestroy() {
        this.authSub?.unsubscribe();
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }

    async loadFirstPage() {
        if (!this.user?.uid) return;
        this.loading = true;
        this.pageStack = [];
        this.lastDoc = null;
        try {
            const res = await this.ns.getNotificationsPage(this.user.uid, this.pageSize);
            this.notifications = res.items;
            this.lastDoc = res.lastDoc || null;
            this.pageStack.push(this.lastDoc);
            this.emptyMode = this.notifications.length === 0;
            this.deviceService.syncNotifications(this.notifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.notifications = [];
            this.emptyMode = true;
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    async loadNext() {
        if (!this.lastDoc || !this.user?.uid) return;
        this.loading = true;
        try {
            const res = await this.ns.getNotificationsPage(this.user.uid, this.pageSize, this.lastDoc);
            if (res.items.length) {
                this.pageStack.push(res.lastDoc || null);
                this.notifications = res.items;
                this.lastDoc = res.lastDoc || null;
            } else {
                this.lastDoc = null;
            }
            this.emptyMode = this.notifications.length === 0;
            this.deviceService.syncNotifications(this.notifications);
        } catch (error) {
            console.error('Error loading next page:', error);
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    async loadPrevious() {
        if (!this.user?.uid) return;
        if (this.pageStack.length <= 1) {
            await this.loadFirstPage();
            return;
        }
        this.pageStack.pop();
        const prevLast = this.pageStack[this.pageStack.length - 1] || null;
        this.loading = true;
        try {
            let cursor: QueryDocumentSnapshot<DocumentData> | undefined;
            let pageIndexToLoad = this.pageStack.length - 1;
            let items: NotificationModel[] = [];
            cursor = undefined;
            for (let i = 0; i <= pageIndexToLoad; i++) {
                const r = await this.ns.getNotificationsPage(this.user.uid, this.pageSize, cursor);
                items = r.items;
                cursor = r.lastDoc || undefined;
            }
            this.notifications = items;
            this.lastDoc = cursor || null;
            this.emptyMode = this.notifications.length === 0;
        } catch (error) {
            console.error('Error loading previous page:', error);
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    openCreate() {
        this.editing = null;
        this.form.reset({ title: '', repeat: 'Daily', day: 'Everyday', time: '' });
        this.showModal = true;
        this.cdr.detectChanges();
    }

    openEdit(n: NotificationModel) {
        this.editing = n;
        this.form.patchValue({
            title: n.title,
            repeat: n.repeat,
            day: n.day,
            time: n.time
        });
        this.showModal = true;
        this.cdr.detectChanges();
    }

    async submit() {
        if (this.form.invalid || !this.user?.uid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload: NotificationModel = {
            user: this.user.uid,
            title: this.form.value.title,
            repeat: this.form.value.repeat,
            day: this.form.value.day,
            time: this.form.value.time
        };
        if (this.editing && this.editing.id) {
            await this.ns.updateNotification(this.user.uid, this.editing.id, payload);
        } else {
            await this.ns.createNotification(this.user.uid, payload);
        }
        await this.loadFirstPage();
        this.showModal = false;
        this.cdr.detectChanges();
    }

    async delete(n: NotificationModel) {
        if (!n.id || !this.user?.uid) return;
        if (!confirm(`Delete "${n.title}"?`)) return;
        await this.ns.deleteNotification(this.user.uid, n.id);
        await this.loadFirstPage();
        this.cdr.detectChanges();
    }
}
