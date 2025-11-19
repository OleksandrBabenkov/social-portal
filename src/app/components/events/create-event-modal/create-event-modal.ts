// src/app/components/events/create-event-modal/create-event-modal.ts
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../../../services/event';

@Component({
  selector: 'app-create-event-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event-modal.html',
  styles: []
})
export class CreateEventModal {
  @Output() close = new EventEmitter<void>(); // Event to tell parent to close

  fb = inject(FormBuilder);
  eventService = inject(EventService);
  isSubmitting = false;

  eventForm = this.fb.group({
    title: ['', Validators.required],
    location: ['', Validators.required],
    date: ['', Validators.required], // datetime-local input
    description: ['', Validators.required]
  });

  async onSubmit() {
    if (this.eventForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      await this.eventService.createEvent(this.eventForm.value);
      this.close.emit(); // Close modal on success
    } catch (err) {
      console.error(err);
    } finally {
      this.isSubmitting = false;
    }
  }

  closeModal() {
    this.close.emit();
  }
}