import { Component } from '@angular/core';
import { TrainingService } from '../../services/training.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-pane',
  standalone: true,
  templateUrl: './content-pane.component.html',
  styleUrls: ['./content-pane.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class ContentPaneComponent {
  selectedAnswers: string[] = [];
  submitted = false;
  score = 0;
  safeVideoUrl: SafeResourceUrl | null = null;
  isLoading = false;

  constructor(
    public trainingService: TrainingService,
    private sanitizer: DomSanitizer
  ) {}

  async switchToChapter(index: number) {
    this.isLoading = true;
    this.submitted = false;
    this.score = 0;
    this.selectedAnswers = [];
    await this.trainingService.goToChapter(index);
    this.isLoading = false;
  }

  async submitAnswers(): Promise<void> {
    this.score = 0;
    this.submitted = true;

    this.trainingService.questions.forEach((q, i) => {
      const userAns = (this.selectedAnswers[i] || '').trim().toLowerCase();
      const correct = q.correctAnswer.trim().toLowerCase();
      if (userAns === correct) {
        this.score++;
      }
    });

    this.trainingService.markChapterComplete();

    // Auto-advance
    const nextIndex = this.trainingService.currentChapterIndex + 1;
    if (this.trainingService.chapters[nextIndex]) {
      this.isLoading = true;
      setTimeout(async () => {
        await this.switchToChapter(nextIndex);
        this.isLoading = false;
      }, 1000);
    }
  }

  isChapterUnlocked(index: number): boolean {
    if (index === 0) return true;
    return this.trainingService.chapters[index - 1]?.completed === true;
  }

  ngDoCheck(): void {
    if (
      this.trainingService.media.type === 'video' &&
      this.trainingService.media.url &&
      (!this.safeVideoUrl || this.safeVideoUrl.toString() !== this.trainingService.media.url)
    ) {
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.trainingService.media.url
      );
    }
  }
}
