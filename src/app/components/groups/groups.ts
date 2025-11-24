import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../services/group';
import { PostService } from '../../services/post';
import { AuthService } from '../../services/auth.service';
import { Group, Post } from '../../models/data.models';
import { CreateGroupModal } from './create-group-modal/create-group-modal';
import { Observable, BehaviorSubject, combineLatest, map, switchMap, of } from 'rxjs';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // For inputs

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, CreateGroupModal, ReactiveFormsModule, FormsModule],
  templateUrl: './groups.html',
  styleUrls: ['./groups.css']
})
export class GroupsComponent {
  groupService = inject(GroupService);
  postService = inject(PostService);
  auth = inject(AuthService);

  // State
  selectedGroup$ = new BehaviorSubject<Group | null>(null);
  currentTab: 'posts' | 'members' | 'info' = 'posts';
  showCreateModal = false;
  newPostContent = '';

  // 1. Groups List
  groups$ = this.groupService.getGroups();

  // 2. Selected Group's Posts (Updates when selectedGroup changes)
  groupPosts$: Observable<Post[]> = this.selectedGroup$.pipe(
    switchMap(group => {
      if (!group) return of([]);
      return this.postService.getPosts(group.id); // Fetch posts for THIS group
    })
  );

  selectGroup(group: Group) {
    this.selectedGroup$.next(group);
    this.currentTab = 'posts'; // Reset to posts tab
  }

  isMember(group: Group, userId: string): boolean {
    return group.memberIds.includes(userId);
  }

  toggleJoin(group: Group, userId: string) {
    if (this.isMember(group, userId)) {
      this.groupService.leaveGroup(group.id!);
    } else {
      this.groupService.joinGroup(group.id!);
    }
  }

  async createGroupPost(groupId: string) {
    if (!this.newPostContent.trim()) return;
    await this.postService.createPost(this.newPostContent, groupId);
    this.newPostContent = '';
  }
}