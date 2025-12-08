import { inject, Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user as firebaseUser } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, switchMap, from, of } from 'rxjs';
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
              emailVerified: authUser.emailVerified
            };
            await setDoc(userDocRef, newUser);
            return newUser;
          }
          // Return existing user document from Firestore
          return snapshot.data() as AppUser;
        })
      );
    })
  );

  constructor() { }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
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
}
