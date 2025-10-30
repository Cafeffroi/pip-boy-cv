import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ResumeDataService } from '../../services/resume-data.service';
import { ThemeService } from '../../services/theme.service';
import { ResumeData } from '../../models/resume.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-resume-sections',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './resume-sections.component.html',
  styleUrls: ['./resume-sections.component.scss'],
})
export class ResumeSectionsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() section: string = 'resume-full';

  resumeData: ResumeData | null = null;
  currentTheme: any;
  displayText: string = '';
  private subscription: Subscription = new Subscription();
  private typewriterInterval: any;

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
      this.resumeService.resumeData$
        .pipe(filter((data) => data !== null))
        .subscribe((data) => {
          this.resumeData = data;
          console.log('Resume data received in component:', data);
          if (this.section === 'resume-full') {
            // Small delay to ensure the view is ready
            setTimeout(() => this.typewriterEffect(), 100);
          }
        })
    );
  }

  ngOnChanges(): void {
    if (this.section === 'resume-full' && this.resumeData) {
      // Clear previous interval if exists
      if (this.typewriterInterval) {
        clearInterval(this.typewriterInterval);
      }
      this.typewriterEffect();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
    }
  }

  typewriterEffect(): void {
    if (!this.resumeData) {
      console.log('No resume data available for typewriter effect');
      return;
    }

    // Clear any existing interval
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
    }

    this.displayText = '';
    const fullText = this.resumeData.resume.full;
    let index = 0;

    this.typewriterInterval = setInterval(() => {
      if (index < fullText.length) {
        this.displayText += fullText[index];
        index++;
      } else {
        clearInterval(this.typewriterInterval);
        this.typewriterInterval = null;
      }
    }, 5);
  }

  getSkillBlocks(level: number): boolean[] {
    return Array(10)
      .fill(false)
      .map((_, i) => i < level);
  }
}
