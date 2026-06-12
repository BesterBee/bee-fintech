import { Injectable } from '@angular/core';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/chat';

  // 🔧 Flip this to false when your backend is ready
  private useMock = true;

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    if (this.useMock) {
      yield* this.mockStream(messages);
      return;
    }
    yield* this.realStream(messages);
  }

  // ---- Fake streaming ----
  private async *mockStream(messages: ChatMessage[]): AsyncGenerator<string> {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    const reply = this.fakeReply(lastUser?.content ?? '');
    const words = reply.split(' ');

    // small initial "thinking" delay
    await this.delay(500);

    for (const word of words) {
      await this.delay(40 + Math.random() * 60); // jitter feels human
      yield word + ' ';
    }
  }

  private fakeReply(userText: string): string {
    if (/hello|hi|hey/i.test(userText)) {
      return 'Hey there! This is a mock response so you can test the UI. Everything you see is fake — no backend yet. 👋';
    }
    if (/\?$/.test(userText.trim())) {
      return 'Good question! Once the Ollama backend is wired up, I\'ll answer this for real. For now I\'m just here to help you style the chat window.';
    }
    return `You said: "${userText}". This is a simulated streaming reply. Notice how the text appears word by word, just like the real model will. Try resizing, scrolling, and sending a few messages to test the layout.`;
  }

  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  // ---- Real backend (used when useMock = false) ----
  private async *realStream(messages: ChatMessage[]): AsyncGenerator<string> {
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    if (!res.ok || !res.body) throw new Error(`Server error: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  }
}