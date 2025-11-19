// src/app/components/events/events.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event';
import { AuthService } from '../../services/auth';
import { CommunityEvent } from '../../models/data.models';
import { Observable, map, combineLatest } from 'rxjs';

// Define filter types
type FilterType = 'upcoming' | 'week' | 'past' | 'participating';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class EventsComponent {
  eventService = inject(EventService);
  auth = inject(AuthService);

  currentFilter: FilterType = 'upcoming';
  selectedEvent: CommunityEvent | null = null;

  // Get raw events
  rawEvents$ = this.eventService.getEvents();

  // filteredEvents$ combines the raw list + current filter + current user
  filteredEvents$: Observable<CommunityEvent[]> = combineLatest([
    this.rawEvents$, 
    this.auth.user$
  ]).pipe(
    map(([events, user]) => {
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      return events.filter(event => {
        const eventDate = event.date.toDate();

        switch (this.currentFilter) {
          case 'upcoming':
            return eventDate >= now;
          case 'past':
            return eventDate < now;
          case 'week':
            return eventDate >= now && eventDate <= nextWeek;
          case 'participating':
            return user ? event.attendees.includes(user.uid) : false;
          default:
            return true;
        }
      });
    })
  );

  // UI Actions
  setFilter(filter: FilterType) {
    this.currentFilter = filter;
    this.selectedEvent = null; // Deselect when changing filters
  }

  selectEvent(event: CommunityEvent) {
    this.selectedEvent = event;
  }

  // Logic to check if user has joined
  isAttending(event: CommunityEvent, userId: string): boolean {
    return event.attendees.includes(userId);
  }

  async toggleJoin(event: CommunityEvent, userId: string) {
    const isJoining = !this.isAttending(event, userId);
    await this.eventService.toggleParticipation(event.id!, userId, isJoining);
    // Optimistic update for UI (optional, but good for UX)
    if (this.selectedEvent && this.selectedEvent.id === event.id) {
       // Refresh logic handled automatically by Observable
    }
  }
}