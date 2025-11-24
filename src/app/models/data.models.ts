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
  
  groupId?: string; // <-- NEW: If present, this post belongs to a group
}

// 2. ADD Group
export interface Group {
  id?: string;
  name: string;
  description: string;
  ownerId: string;      // The creator
  memberIds: string[];  // List of UIDs who joined
}

export interface CommunityEvent {
  id?: string;
  title: string;
  description: string;
  date: Timestamp; // When the event happens
  location: string;
  organizerId: string;
  attendees: string[]; // List of UIDs of people going
  imageUrl?: string; // Optional cover image
}

export interface Message {
  text: string;
  senderId: string;
  sentAt: Timestamp;
}

export interface Chat {
  id: string;
  userIds: string[]; // Array of the 2 users in the chat
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  
  // For UI display (we join this data in the service)
  otherUser?: User; 
}