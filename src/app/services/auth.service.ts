import { inject, Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user as firebaseUser, getAdditionalUserInfo } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, switchMap, from, of, shareReplay } from 'rxjs';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { AppUser } from '../app.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  private firestore: Firestore = inject(Firestore);

  // Custom user$ observable that emits Firestore user document with role and other properties
  user$: Observable<AppUser | null> = firebaseUser(this.auth).pipe(
    switchMap(authUser => {
      if (!authUser) {
        return of(null);
      }

      // Get or create user document in Firestore
      const userDocRef = doc(this.firestore, `users/${authUser.uid}`);
      return from(getDoc(userDocRef)).pipe(
        switchMap(async (snapshot) => {
          if (!snapshot.exists()) {
            // Create new user document with default values
            const newUser: AppUser = {
              id: authUser.uid,
              uid: authUser.uid,
              name: authUser.displayName,
              email: authUser.email,
              pic: authUser.photoURL,
              role: 'USER',
              laScore: 0,
              emailVerified: authUser.emailVerified,
              phoneNumber: authUser.phoneNumber,
              gender: null,
              dateOfBirth: null
            };
            await setDoc(userDocRef, newUser);
            return newUser;
          }
          return snapshot.data() as AppUser;
        })
      );
    }),
    shareReplay(1)
  );

  constructor() { }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
    provider.addScope('https://www.googleapis.com/auth/user.gender.read');
    provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');

    try {
      const result = await signInWithPopup(this.auth, provider);
      const details = getAdditionalUserInfo(result);
      const profile: any = details?.profile || {};

      const userDocRef = doc(this.firestore, `users/${result.user.uid}`);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        // Update specific fields ensuring we don't overwrite roles or other critical data
        await setDoc(userDocRef, {
          gender: profile.gender || null,
          dateOfBirth: profile.birthday || profile.dateOfBirth || null,
          phoneNumber: result.user.phoneNumber || profile.phoneNumber || null,
        }, { merge: true });
      } else {
        // Create new user with all details
        const newUser: AppUser = {
          id: result.user.uid,
          uid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          pic: result.user.photoURL,
          role: 'USER',
          laScore: 0,
          emailVerified: result.user.emailVerified,
          gender: profile.gender || null,
          dateOfBirth: profile.birthday || profile.dateOfBirth || null,
          phoneNumber: result.user.phoneNumber || profile.phoneNumber || null
        };
        await setDoc(userDocRef, newUser);
      }

      // The user$ observable will handle Firestore document creation/retrieval
      // Wait a moment to ensure it's processed
      await new Promise(resolve => setTimeout(resolve, 100));
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }

  async updateUser(uid: string, data: Partial<AppUser>) {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userDocRef, data, { merge: true });
  }
}
