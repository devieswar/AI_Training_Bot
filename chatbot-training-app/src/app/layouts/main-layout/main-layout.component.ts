import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatBotComponent } from '../../components/chat-bot/chat-bot.component';
import { ContentPaneComponent } from '../../components/content-pane/content-pane.component';

interface Question {
  type: 'mcq' | 'truefalse';
  question: string;
  options: string[];
  answer: string;
  hint: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, ChatBotComponent, ContentPaneComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {


onContentComplete() {
throw new Error('Method not implemented.');
}
  showQuiz = true; // set to false initially; toggle to true after content
  currentQuestions: Question[] = [
    {
      type: 'mcq',
      question: 'What is the purpose of this training?',
      options: ['Safety', 'Fun', 'Marketing', 'Vacation'],
      answer: 'Safety',
      hint: 'It’s about following procedures.'
    },
    {
      type: 'truefalse',
      question: 'All team members must complete training.',
      options: [],
      answer: 'True',
      hint: 'Compliance is mandatory.'
    }
  ];

  onQuizCompleted(score: number): void {
    this.showQuiz = false;
    console.log('Quiz completed! Score:', score);
    // You can also emit this to chatbot or save it
  }
}
