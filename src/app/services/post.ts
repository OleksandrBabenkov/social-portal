// src/app/services/post.service.ts
import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  Timestamp, 
  collectionData, 
  query, 
  orderBy 
} from '@angular/fire/firestore';
import { AuthService } from './auth';
import { Post } from '../models/data.models';
import { Observable, switchMap, of, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private firestore: Firestore = inject(Firestore);
  private auth: AuthService = inject(AuthService);

  // Get a stream of all posts, ordered by creation date
  getPosts(): Observable<Post[]> {
    const postsCollection = collection(this.firestore, 'posts');
    // Create a query to order posts by 'createdAt' in descending order
    const postsQuery = query(postsCollection, orderBy('createdAt', 'desc'));

    // collectionData returns an Observable of the data array
    return collectionData(postsQuery, { idField: 'id' }) as Observable<Post[]>;
  }

  // Create a new post
  async createPost(content: string) {
    // We use firstValueFrom to get the *current* user from the observable
    const user = await firstValueFrom(this.auth.user$);

    if (!user) {
      // This should not happen if the user is on the wall (due to authGuard)
      throw new Error('User not logged in');
    }

    // 1. Create the Post object
    const newPost: Omit<Post, 'id'> = {
      content: content,
      authorId: user.uid,
      createdAt: Timestamp.now(), // Get the server timestamp
      authorName: user.displayName,
      authorPhotoURL: user.photoURL
    };

    // 2. Get a reference to the 'posts' collection
    const postsCollection = collection(this.firestore, 'posts');

    // 3. Add the new document
    try {
      const docRef = await addDoc(postsCollection, newPost);
      console.log('Post created with ID: ', docRef.id);
    } catch (error) {
      console.error('Error creating post: ', error);
    }
  }
}