// src/app/services/chat.service.ts
import { Injectable, inject } from '@angular/core';
import { 
  Firestore, collection, query, orderBy, 
  addDoc, collectionData, Timestamp, doc, setDoc, updateDoc 
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth'; // <-- 1. Import Auth directly
import { User } from './auth'; // Import User interface only
import { Observable, map } from 'rxjs';
import { Chat, Message } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  firestore = inject(Firestore);
  private firebaseAuth = inject(Auth); // <-- 2. Inject Auth directly

  // 1. Get all users
  getUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef) as Observable<User[]>;
  }

  // Helper to generate Chat ID
  getChatId(uid1: string, uid2: string): string {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  }

  // 2. Create Chat
  createChat(otherUser: User): Promise<void> {
    // 3. Use 'this.firebaseAuth.currentUser' (Accessing the SDK directly)
    const currentUser = this.firebaseAuth.currentUser;
    
    if (!currentUser) return Promise.resolve();

    const chatId = this.getChatId(currentUser.uid, otherUser.uid);
    const chatDoc = doc(this.firestore, `chats/${chatId}`);

    return setDoc(chatDoc, {
      id: chatId,
      userIds: [currentUser.uid, otherUser.uid],
      lastMessageTime: Timestamp.now()
    }, { merge: true });
  }

  // 3. Get Messages
  getMessages(chatId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('sentAt', 'asc'));
    return collectionData(q) as Observable<Message[]>;
  }

  // 4. Send Message
  async sendMessage(chatId: string, text: string) {
    // 3. Use 'this.firebaseAuth.currentUser' here too
    const currentUser = this.firebaseAuth.currentUser;
    
    if (!currentUser) throw new Error('Not logged in');

    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    const chatRef = doc(this.firestore, `chats/${chatId}`);

    await addDoc(messagesRef, {
      text,
      senderId: currentUser.uid,
      sentAt: Timestamp.now()
    });

    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageTime: Timestamp.now()
    });
  }
}