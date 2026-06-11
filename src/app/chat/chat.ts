import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService, ChatMessage } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements AfterViewChecked {
  @ViewChild('scrollBox') private scrollBox!: ElementRef;

  open = signal(false);
  messages = signal<ChatMessage[]>([]);
  input = '';
  loading = signal(false);

  constructor(private chat: ChatService) {}

  toggle() { this.open.update(v => !v); }

  async send() {
    const text = this.input.trim();
    if (!text || this.loading()) return;

    const history: ChatMessage[] = [
      ...this.messages(),
      { role: 'user', content: text }
    ];
    this.messages.set([...history, { role: 'assistant', content: '' }]);
    this.input = '';
    this.loading.set(true);

    try {
      for await (const chunk of this.chat.stream(history)) {
        this.messages.update(m => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      }
    } catch {
      this.messages.update(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', content: '⚠️ Could not reach the server.' };
        return copy;
      });
    } finally {
      this.loading.set(false);
    }
  }

  ngAfterViewChecked() {
    if (this.scrollBox) {
      this.scrollBox.nativeElement.scrollTop = this.scrollBox.nativeElement.scrollHeight;
    }
  }
}