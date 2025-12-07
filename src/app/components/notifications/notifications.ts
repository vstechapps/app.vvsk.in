import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from './notifications.service';
import { NotificationModel } from './notification.model';
import { QueryDocumentSnapshot, DocumentData } from '@angular/fire/firestore';

interface NotificationItem {
    id: string;
    time: string;
    task: string;
}

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatCardModule],
    templateUrl: './notifications.html',
    styleUrl: './notifications.css'
})
export class Notifications implements OnInit {

    pageSize = 5; // configurable records per view
    notifications: NotificationModel[] = [];
    loading = false;
    // pagination control
    private lastDoc?: QueryDocumentSnapshot<DocumentData> | null = null;
    private pageStack: (QueryDocumentSnapshot<DocumentData> | null)[] = []; // for back navigation

    // modal & form
    showModal = false;
    editing?: NotificationModel | null = null;
    form: FormGroup;

    // UI helpers
    emptyMode = false;

    constructor(
        private ns: NotificationService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            title: ['', Validators.required],
            repeat: ['Daily'],
            day: ['Everyday'],
            time: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]]
        });
    }

    ngOnInit() {
        this.loadFirstPage();
    }

    async loadFirstPage() {
        this.loading = true;
        this.pageStack = [];
        this.lastDoc = null;
        try {
            const res = await this.ns.getNotificationsPage(this.pageSize);
            this.notifications = res.items;
            this.lastDoc = res.lastDoc || null;
            this.pageStack.push(this.lastDoc); // push snapshot for first page end
            this.emptyMode = this.notifications.length === 0;
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.notifications = [];
            this.emptyMode = true;
        } finally {
            this.loading = false;
        }
    }

    /** Load next page */
    async loadNext() {
        if (!this.lastDoc) return;
        this.loading = true;
        try {
            const res = await this.ns.getNotificationsPage(this.pageSize, this.lastDoc);
            if (res.items.length) {
                // push current lastDoc to stack for back navigation
                this.pageStack.push(res.lastDoc || null);
                this.notifications = res.items;
                this.lastDoc = res.lastDoc || null;
            } else {
                // no more pages
                this.lastDoc = null;
            }
            this.emptyMode = this.notifications.length === 0;
        } catch (error) {
            console.error('Error loading next page:', error);
        } finally {
            this.loading = false;
        }
    }

    /** Basic previous (back) page implementation using stored stack */
    async loadPrevious() {
        // pop last entry, then re-query using startAfter previous of previous page
        if (this.pageStack.length <= 1) {
            // reload first page
            await this.loadFirstPage();
            return;
        }
        // remove current page marker
        this.pageStack.pop();
        // the new lastDoc pointer is the top of stack (end of previous page)
        const prevLast = this.pageStack[this.pageStack.length - 1] || null;
        // Query from start (no startAfter) until prevLast, then extract that page using getNotificationsPage with startAfter of prevPrev etc.
        // Simpler approach: maintain pageSnapshots to be able to re-run queries; here we'll re-run from start and iterate pages until reach desired page.
        // For small page sizes this is acceptable.
        this.loading = true;
        try {
            // Rebuild by iterating pages from scratch until the page stack length indicates the index we want
            let cursor: QueryDocumentSnapshot<DocumentData> | undefined;
            let pageIndexToLoad = this.pageStack.length - 1; // zero-based
            let items: NotificationModel[] = [];
            // iterate
            cursor = undefined;
            for (let i = 0; i <= pageIndexToLoad; i++) {
                const r = await this.ns.getNotificationsPage(this.pageSize, cursor);
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
        }
    }

    openCreate() {
        this.editing = null;
        this.form.reset({ title: '', repeat: 'Daily', day: 'Everyday', time: '' });
        this.showModal = true;
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
    }

    async submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const payload: NotificationModel = {
            title: this.form.value.title,
            repeat: this.form.value.repeat,
            day: this.form.value.day,
            time: this.form.value.time
        };
        if (this.editing && this.editing.id) {
            // update
            await this.ns.updateNotification(this.editing.id, payload);
        } else {
            // create
            await this.ns.createNotification(payload);
        }
        await this.loadFirstPage();
        this.showModal = false;
    }

    async delete(n: NotificationModel) {
        if (!n.id) return;
        if (!confirm(`Delete "${n.title}"?`)) return;
        await this.ns.deleteNotification(n.id);
        await this.loadFirstPage();
    }
}

