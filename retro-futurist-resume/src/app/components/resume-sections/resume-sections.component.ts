import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ResumeDataService } from '../../services/resume-data.service';
import { ThemeService } from '../../services/theme.service';
import { ResumeData } from '../../models/resume.model';

@Component({
  selector: 'app-resume-sections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-sections.component.html',
  styleUrls: ['./resume-sections.component.scss'],
})
export class ResumeSectionsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() section: string = 'resume-full';

  resumeData: ResumeData | null = null;
  currentTheme: any;
  displayText: string = '';
  private subscription: Subscription = new Subscription();

  constructor(
    private resumeService: ResumeDataService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.themeService.currentTheme$.subscribe((theme) => {
        this.currentTheme = this.themeService.getThemeColors(theme);
      })
    );

    this.subscription.add(
      this.resumeService.resumeData$.subscribe((data) => {
        this.resumeData = data;
        if (data && this.section === 'resume-full') {
          this.typewriterEffect();
        }
      })
    );
  }

  ngOnChanges(): void {
    if (this.section === 'resume-full' && this.resumeData) {
      this.typewriterEffect();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  typewriterEffect(): void {
    if (!this.resumeData) return;

    this.displayText = '';
    const fullText = this.resumeData.resume.full;
    let index = 0;

    const interval = setInterval(() => {
      if (index < fullText.length) {
        this.displayText += fullText[index];
        index++;
      } else {
        clearInterval(interval);
      }
    }, 5);
  }

  getSkillBlocks(level: number): boolean[] {
    return Array(10)
      .fill(false)
      .map((_, i) => i < level);
  }
}
