// src/app/services/post.service.ts
import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  Timestamp, 
  collectionData, 
  query, 
  orderBy,
  where
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Post } from '../models/data.models';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private firestore: Firestore = inject(Firestore);
  private auth: AuthService = inject(AuthService);

  // Get a stream of all posts, ordered by creation date
  getPosts(groupId: string | null = null): Observable<Post[]> {
    const postsCollection = collection(this.firestore, 'posts');

    let postsQuery;
    if (groupId) {
      postsQuery = query(
        postsCollection, 
        where('groupId', '==', groupId), 
        orderBy('createdAt', 'desc')
      );
    } else {
      postsQuery = query(postsCollection, orderBy('createdAt', 'desc'));
    }
    // collectionData returns an Observable of the data array
    return collectionData(postsQuery, { idField: 'id' }) as Observable<Post[]>;
  }

  // Create a new post
  async createPost(content: string, groupId: string | null = null) {
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

    if (groupId){
      newPost.groupId = groupId;
    }
    // 2. Get a reference to the 'posts' collection
    const postsCollection = collection(this.firestore, 'posts');

    // 3. Add the new document
    try {
      const docRef = await addDoc(postsCollection, newPost);
      //console.log('Post created with ID: ', docRef.id);
    } catch (error) {
      console.error('Error creating post: ', error);
    }
  }
}