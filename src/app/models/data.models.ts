// src/app/models/data.models.ts
import { Timestamp } from '@angular/fire/firestore';

// We can re-use the User interface from AuthService
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface Post {
  id?: string; // The document ID
  content: string;
  authorId: string; // The UID of the user who wrote it
  createdAt: Timestamp; // Firebase's special timestamp
  
  // We'll copy these from the user for easy display
  // This is called "denormalization"
  authorName: string;
  authorPhotoURL: string;
  
  // We'll add this later
  // likes: string[]; 
}