import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Activity {
  id?: string;
  name: string;
  icon: string;
  category: string;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(private fs: Firestore) { }

  getActivities(): Observable<Activity[]> {
    const ref = collection(this.fs, 'activities');
    return collectionData(ref, { idField: 'id' }) as Observable<Activity[]>;
  }
}
