// src/app/services/auth.service.ts
import { runInInjectionContext } from '@angular/core';
import { Injectable, inject, Injector } from '@angular/core';
import { Router } from '@angular/router';

// Import the new functional Firebase modules
import { Auth, authState, signInWithPopup, signOut, GoogleAuthProvider,
  createUserWithEmailAndPassword, // email/password sign-up
  signInWithEmailAndPassword,     // email/password sign-up
  sendPasswordResetEmail,        
  updateProfile                    
 } from '@angular/fire/auth';

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

  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  private injector: Injector = inject(Injector);

  user$: Observable<User | null>;

  constructor(){
    this.user$ = authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          // User is logged in, get their doc from Firestore
            return runInInjectionContext(this.injector, () => {
              const userDocRef = doc(this.firestore, `users/${user.uid}`);
              return docData(userDocRef) as Observable<User>;
              }
            );
        } else {
          // User is logged out, return null
          return of(null);
        }
      })
    );
  }

  // ## 1. Login Logic
  async googleLogin(): Promise<string | void> {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(this.auth, provider);
      // After login, update their data in Firestore
      await this.updateUserData(credential.user);
      // Redirect to the main wall/dashboard
      this.router.navigate(['/']); 
    } catch (error) {
      console.error(error);
      return this.handleAuthError(error);
    }
  }

  async emailSignUp(displayName: string, email: string, password: string): Promise<string | void>{
    try{
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(credential.user, { displayName });
      await this.updateUserData(credential.user);
      this.router.navigate(['/']);
    }
    catch(error){
      console.error(error);
      return this.handleAuthError(error);    
    }
  }

  // ### 3. Email/Pass Login (NEW) ###
  async emailLogin(email: string, password: string): Promise<string | void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/']); // Redirect to main wall
    } catch (error) {
      console.error(error);
      return this.handleAuthError(error);
    }
  }

  // ### 4. Forgot Password (NEW) ###
  async sendPasswordReset(email: string): Promise<string | void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      alert('Password reset link sent! Check your email.');
    } catch (error) {
      console.error(error);
      return this.handleAuthError(error);
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
      photoURL: user.photoURL || 'public/default-avatar.png'
    };

    // setDoc with { merge: true } will create the doc if it doesn't exist,
    // or update it if it does.
    return setDoc(userDocRef, data, { merge: true });
  }

  private handleAuthError(error: any): string {
    // You can make this more user-friendly
    return error.message;
  }
}