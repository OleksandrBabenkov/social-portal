// src/app/services/event.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, updateDoc, arrayUnion, arrayRemove, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommunityEvent } from '../models/data.models';

import { Timestamp } from '@angular/fire/firestore';
import { addDoc} from '@angular/fire/firestore'; // <-- Ensure imports
import { firstValueFrom } from 'rxjs'; // <-- Import rxjs

import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService); // Inject Auth

  async createEvent(eventData: any) {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) throw new Error('Must be logged in');

    const eventsRef = collection(this.firestore, 'events');
    
    await addDoc(eventsRef, {
      ...eventData,
      organizerId: user.uid,
      attendees: [user.uid], // Organizer automatically joins
      // Convert the string date from HTML input to Firestore Timestamp
      date: Timestamp.fromDate(new Date(eventData.date)) 
    });
  }

  // Get all events ordered by date
  getEvents(): Observable<CommunityEvent[]> {
    const eventsRef = collection(this.firestore, 'events');
    const q = query(eventsRef, orderBy('date', 'asc')); 
    return collectionData(q, { idField: 'id' }) as Observable<CommunityEvent[]>;
  }

  // Toggle participation (Join/Leave)
  async toggleParticipation(eventId: string, userId: string, isJoining: boolean) {
    const eventRef = doc(this.firestore, `events/${eventId}`);
    if (isJoining) {
      await updateDoc(eventRef, { attendees: arrayUnion(userId) });
    } else {
      await updateDoc(eventRef, { attendees: arrayRemove(userId) });
    }
  }
}