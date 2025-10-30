import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(withEventReplay()), provideFirebaseApp(() => initializeApp({ projectId: "social-portal-ce047", appId: "1:346660627817:web:334c2bf088ee53ecc889f8", storageBucket: "social-portal-ce047.firebasestorage.app", apiKey: "AIzaSyAz3cqDg_0TsX6PjD3GofTOVQCBJEUQMs8", authDomain: "social-portal-ce047.firebaseapp.com", messagingSenderId: "346660627817", projectNumber: "346660627817", version: "2" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};
