// src/app/components/wall/wall.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { RouterModule } from '@angular/router'; // <-- ADD THIS
import { ReactiveFormsModule } from '@angular/forms'; // <-- ADD THIS
import { CreatePost } from '../post/create-post/create-post'; // <-- ADD THIS

@Component({
  selector: 'app-wall',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CreatePost
  ], // <-- ADD THIS
  templateUrl: './wall.html',
  styleUrls: ['./wall.css']
})
export class Wall {
  public auth = inject(AuthService);
}