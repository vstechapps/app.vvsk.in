import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);

  constructor() { }

  getUserData(uid: string): Observable<any> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return docData(userDoc);
  }

  async initUserData(uid: string, email: string) {
    const userDoc = doc(this.firestore, `users/${uid}`);
    const snapshot = await getDoc(userDoc);
    if (!snapshot.exists()) {
      await setDoc(userDoc, {
        id: uid,
        email: email,
        laScore: 0,
        createdAt: new Date()
      });
    }
  }
}
