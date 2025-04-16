import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface Question {
  type: 'mcq' | 'truefalse';
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Chapter {
  chapterTitle: string;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class TrainingService {
  chapters: Chapter[] = [];
  currentChapterIndex = 0;

  content = '';
  media = { type: '', url: '' };
  questions: Question[] = [];

  isLoading = false; // 👈 NEW

  constructor(private http: HttpClient) {}

  async loadChapters(topic: string): Promise<void> {
    this.isLoading = true;
    const response: any = await lastValueFrom(
      this.http.post('http://localhost:3000/api/generate-chapters', { topic })
    );
    this.chapters = response.chapters.map((ch: any) => ({
      chapterTitle: ch.chapterTitle,
      completed: false
    }));
    this.currentChapterIndex = 0;
    await this.loadCurrentChapterContent();
    this.isLoading = false;
  }

  async loadCurrentChapterContent(): Promise<void> {
    this.isLoading = true;
    const chapter = this.chapters[this.currentChapterIndex];
    const response: any = await lastValueFrom(
      this.http.post('http://localhost:3000/api/generate-training', {
        prompt: chapter.chapterTitle
      })
    );
    this.setTrainingContent(response.content, response.media, response.questions);
    this.isLoading = false;
  }

  async goToChapter(index: number): Promise<void> {
    this.currentChapterIndex = index;
    await this.loadCurrentChapterContent();
  }

  markChapterComplete() {
    if (this.chapters[this.currentChapterIndex]) {
      this.chapters[this.currentChapterIndex].completed = true;
    }
  }

  setTrainingContent(content: string, media: any, questions: Question[]) {
    this.content = content;
    this.media = media;
    this.media.url = this.media.url.includes('?') ? this.media.url : `${this.media.url}?rel=0`;
    this.questions = questions;
  }
}
