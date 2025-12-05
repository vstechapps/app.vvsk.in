import { Injectable } from '@angular/core';
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
import { Observable, from, map } from 'rxjs';
import { NotificationModel } from './notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private collPath = 'notifications';

    constructor(private firestore: Firestore) { }

    /** Create a new notification */
    createNotification(payload: NotificationModel): Promise<string> {
        const col = collection(this.firestore, this.collPath);
        const docRefPromise = addDoc(col, {
            ...payload,
            createdAt: new Date()
        });
        // return the created doc id (Promise)
        return docRefPromise.then(ref => ref.id);
    }

    /** Update an existing notification by id */
    updateNotification(id: string, payload: Partial<NotificationModel>): Promise<void> {
        const ref = doc(this.firestore, `${this.collPath}/${id}`);
        return updateDoc(ref, payload);
    }

    /** Delete a notification by id */
    deleteNotification(id: string): Promise<void> {
        const ref = doc(this.firestore, `${this.collPath}/${id}`);
        return deleteDoc(ref);
    }

    /**
     * Retrieve one page of notifications ordered by time (or createdAt)
     * @param pageSize number of records per page
     * @param startAfterDoc optional QueryDocumentSnapshot to start after for pagination
     * @returns a Promise resolving to { items: NotificationModel[], lastDoc?: QueryDocumentSnapshot }
     */
    async getNotificationsPage(pageSize = 5, startAfterDoc?: QueryDocumentSnapshot<DocumentData>) {
        const col = collection(this.firestore, this.collPath);
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
        const col = collection(this.firestore, this.collPath);
        // order by time then createdAt for deterministic ordering
        const q = query(col, orderBy('time'), orderBy('createdAt'));
        return collectionData(q, { idField: 'id' }) as Observable<NotificationModel[]>;
    }
}
