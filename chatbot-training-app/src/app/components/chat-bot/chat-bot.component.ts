import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../services/training.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  sender: 'bot' | 'user';
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ChatBotComponent implements OnInit {
  userMessage = '';
  isLoading = false;

  messages: ChatMessage[] = [];

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    this.messages.push(
      { text: '🤖 Welcome to your AI-powered training assistant!', sender: 'bot' },
      { text: '🤖 To get started, type a topic like "Cybersecurity", "Angular", or "AI in healthcare".', sender: 'bot' },
      { text: '🤖 I’ll generate chapters, video-based content, and quiz questions for you.', sender: 'bot' },
      { text: '🤖 Complete the quiz to unlock the next chapter. Let’s begin!', sender: 'bot' }
    );
  }

  async sendMessage() {
    if (!this.userMessage.trim()) return;

    const prompt = this.userMessage.trim();
    this.messages.push({ text: `🧑 ${prompt}`, sender: 'user' });
    this.isLoading = true;

    try {
      await this.trainingService.loadChapters(prompt);
      this.messages.push({ text: `🤖 Chapters loaded for: "${prompt}"!`, sender: 'bot' });
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
      this.messages.push({ text: '🤖 Sorry, I couldn’t load training content for that topic.', sender: 'bot' });
    } finally {
      this.isLoading = false;
      this.userMessage = '';
    }
  }
}
