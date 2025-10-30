// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// Import the new functional Firebase modules
import { Auth, authState, signInWithPopup, signOut, GoogleAuthProvider } from '@angular/fire/auth';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Define an interface for our User model
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // This is the core of the service.
  // user$ is an Observable that will emit the user object when logged in, or null when logged out.
  // Components will "subscribe" to this to reactively update the UI.
  user$: Observable<User | null>;

  constructor(
    private auth: Auth,           // Injects AngularFire Auth
    private firestore: Firestore, // Injects AngularFire Firestore
    private router: Router        // Injects Angular Router
  ) {

    // This is the magic!
    // authState() returns an Observable of the auth state.
    // We use switchMap to pipe that into another Observable:
    // If the user is logged in, we fetch their document from the 'users' collection.
    // If they are logged out (user is null), we return an Observable of null.
    this.user$ = authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          // User is logged in, get their doc from Firestore
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return docData(userDocRef) as Observable<User>;
        } else {
          // User is logged out, return null
          return of(null);
        }
      })
    );
  }

  // ## 1. Login Logic
  async googleLogin() {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(this.auth, provider);
      // After login, update their data in Firestore
      await this.updateUserData(credential.user);
      // Redirect to the main wall/dashboard
      this.router.navigate(['/']); 
    } catch (error) {
      console.error(error);
    }
  }

  // ## 2. Logout Logic
  async logout() {
    await signOut(this.auth);
    // After logout, redirect to a login page or home page
    this.router.navigate(['/login']); 
  }

  // ## 3. Save User to Firestore
  // This is our "Plan A" logic from earlier.
  // It saves the user's auth data to the 'users' collection.
  private updateUserData(user: any) {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);

    const data: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };

    // setDoc with { merge: true } will create the doc if it doesn't exist,
    // or update it if it does.
    return setDoc(userDocRef, data, { merge: true });
  }
}