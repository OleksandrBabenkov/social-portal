// src/app/components/post/post-list/post-list.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../services/post';
import { Observable } from 'rxjs';
import { Post } from '../../../models/data.models';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule], // CommonModule includes DatePipe and AsyncPipe
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.css']
})
export class PostList {
  postService = inject(PostService);

  // This Observable holds our live list of posts
  posts$: Observable<Post[]> = this.postService.getPosts();
}