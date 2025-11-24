// src/app/components/post/create-post/create-post.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'; // <-- Import Forms
import { AuthService } from '../../../services/auth.service';
import { PostService } from '../../../services/post';

import { CreateEventModal } from '../../events/create-event-modal/create-event-modal'; // <-- IMPORT

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CreateEventModal], // <-- Add ReactiveFormsModule
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.css']
})

export class CreatePost {
  auth = inject(AuthService);
  fb = inject(FormBuilder);
  postService = inject(PostService);

  isLoading = false;

  showEventModal = false; // <-- State for the modal

  toggleEventModal() {
    this.showEventModal = !this.showEventModal;
  }

  // We'll add a simple form for the post content
  postForm = this.fb.group({
    content: ['', Validators.required]
  });

  // This will be our data model in the next step
  // For now, it just logs to the console.
  async onSubmit() {
    if (this.postForm.invalid || this.isLoading) {
      console.log('page had not yet loaded or post form is not valid');
      return;
    }

    this.isLoading = true;
    const content = this.postForm.value.content;

    try {
      await this.postService.createPost(content!);
      this.postForm.reset(); // Clear the form on success
    } catch (error) {
      console.error('Failed to create post:', error);
      // Here you could set a user-facing error message
    } finally {
      this.isLoading = false; // Re-enable the button
    }
  }
}