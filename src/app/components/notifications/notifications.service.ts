import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    collectionData,
    query,
    orderBy,
    limit,
    startAfter,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    DocumentData,
    QueryDocumentSnapshot,
    getDocs
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { NotificationModel } from './notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);

    private getUserNotificationsPath(uid: string): string {
        return `users/${uid}/notifications`;
    }

    /** Create a new notification */
    async createNotification(uid: string, payload: NotificationModel): Promise<string> {
        const path = this.getUserNotificationsPath(uid);
        const col = collection(this.firestore, path);
        const docRef = await addDoc(col, {
            ...payload,
            createdAt: new Date()
        });
        return docRef.id;
    }

    /** Update an existing notification by id */
    async updateNotification(uid: string, id: string, payload: Partial<NotificationModel>): Promise<void> {
        const path = this.getUserNotificationsPath(uid);
        const ref = doc(this.firestore, `${path}/${id}`);
        return updateDoc(ref, payload);
    }

    /** Delete a notification by id */
    async deleteNotification(uid: string, id: string): Promise<void> {
        const path = this.getUserNotificationsPath(uid);
        const ref = doc(this.firestore, `${path}/${id}`);
        return deleteDoc(ref);
    }

    /**
     * Retrieve one page of notifications ordered by time (or createdAt)
     * @param uid User ID
     * @param pageSize number of records per page
     * @param startAfterDoc optional QueryDocumentSnapshot to start after for pagination
     * @returns a Promise resolving to { items: NotificationModel[], lastDoc?: QueryDocumentSnapshot }
     */
    async getNotificationsPage(uid: string, pageSize = 5, startAfterDoc?: QueryDocumentSnapshot<DocumentData>) {
        const path = this.getUserNotificationsPath(uid);
        const col = collection(this.firestore, path);
        let q;
        if (startAfterDoc) {
            q = query(col, orderBy('time'), startAfter(startAfterDoc), limit(pageSize));
        } else {
            q = query(col, orderBy('time'), limit(pageSize));
        }

        const snap = await getDocs(q);
        const items: NotificationModel[] = [];
        snap.forEach(d => {
            items.push({ id: d.id, ...(d.data() as any) } as NotificationModel);
        });

        const lastDoc = snap.docs[snap.docs.length - 1];
        return { items, lastDoc };
    }

    /**
     * Get all notifications as a promise
     */
    async getAllNotifications(uid: string): Promise<NotificationModel[]> {
        const path = this.getUserNotificationsPath(uid);
        const col = collection(this.firestore, path);
        const q = query(col, orderBy('time'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as NotificationModel));
    }

    /**
     * Stream notifications (non-paginated).
     * Useful for realtime full-list view.
     */
    streamNotifications(uid: string): Observable<NotificationModel[]> {
        const path = this.getUserNotificationsPath(uid);
        const col = collection(this.firestore, path);
        const q = query(col, orderBy('time'));
        return collectionData(q, { idField: 'id' }) as Observable<NotificationModel[]>;
    }
}
