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

    private getUserNotificationsPath(): string {
        const user = this.auth.currentUser;
        if (!user?.uid) {
            throw new Error('User not authenticated');
        }
        return `users/${user.uid}/notifications`;
    }

    /** Create a new notification */
    async createNotification(payload: NotificationModel): Promise<string> {
        const path = this.getUserNotificationsPath();
        const col = collection(this.firestore, path);
        const docRef = await addDoc(col, {
            ...payload,
            createdAt: new Date()
        });
        return docRef.id;
    }

    /** Update an existing notification by id */
    async updateNotification(id: string, payload: Partial<NotificationModel>): Promise<void> {
        const path = this.getUserNotificationsPath();
        const ref = doc(this.firestore, `${path}/${id}`);
        return updateDoc(ref, payload);
    }

    /** Delete a notification by id */
    async deleteNotification(id: string): Promise<void> {
        const path = this.getUserNotificationsPath();
        const ref = doc(this.firestore, `${path}/${id}`);
        return deleteDoc(ref);
    }

    /**
     * Retrieve one page of notifications ordered by time (or createdAt)
     * @param pageSize number of records per page
     * @param startAfterDoc optional QueryDocumentSnapshot to start after for pagination
     * @returns a Promise resolving to { items: NotificationModel[], lastDoc?: QueryDocumentSnapshot }
     */
    async getNotificationsPage(pageSize = 5, startAfterDoc?: QueryDocumentSnapshot<DocumentData>) {
        const path = this.getUserNotificationsPath();
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
     * Stream notifications (non-paginated).
     * Useful for realtime full-list view (optional).
     */
    streamNotifications(): Observable<NotificationModel[]> {
        const path = this.getUserNotificationsPath();
        const col = collection(this.firestore, path);
        // order by time then createdAt for deterministic ordering
        const q = query(col, orderBy('time'), orderBy('createdAt'));
        return collectionData(q, { idField: 'id' }) as Observable<NotificationModel[]>;
    }
}
