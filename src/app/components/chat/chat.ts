// src/app/components/chat/chat.component.ts
import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Use simple forms for chat input
import { ChatService } from '../../services/chat.service';
import { AuthService, User } from '../../services/auth';
import { Message } from '../../models/data.models';
import { Observable, combineLatest, map, of, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements AfterViewChecked {
  chatService = inject(ChatService);
  auth = inject(AuthService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // State
  selectedUser: User | null = null;
  activeChatId: string | null = null;
  newMessage = '';

  // 1. Sidebar List: All users except myself
  users$ = combineLatest([this.chatService.getUsers(), this.auth.user$]).pipe(
    map(([users, currentUser]) => 
      users.filter(u => u.uid !== currentUser?.uid)
    )
  );

  // 2. Active Messages Stream
  messages$: Observable<Message[]> = of([]);

  // Action: Select a user from sidebar
  async selectUser(user: User) {
      // 1. Get the current user safely from the Observable
      const currentUser = await firstValueFrom(this.auth.user$);
      
      if (!currentUser) return; // Security check

      this.selectedUser = user;
      
      // 2. Now we have the UID to generate the Chat ID
      this.activeChatId = this.chatService.getChatId(currentUser.uid, user.uid);
      
      this.chatService.createChat(user).then(() => {
        this.messages$ = this.chatService.getMessages(this.activeChatId!);
      });
    }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.activeChatId) return;

    const text = this.newMessage;
    this.newMessage = ''; // Clear input immediately

    await this.chatService.sendMessage(this.activeChatId, text);
    this.scrollToBottom();
  }

  // Auto-scroll to bottom of chat
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}