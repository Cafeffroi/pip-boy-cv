import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ResumeDataService } from '../../services/resume-data.service';
import { ThemeService } from '../../services/theme.service';
import { ResumeData } from '../../models/resume.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    private themeService: ThemeService,
    private translate: TranslateService,
    private sanitizer: DomSanitizer
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
            setTimeout(() => this.typewriterEffect(), 100);
          }
        })
    );

    // Re-generate full resume when language changes
    this.subscription.add(
      this.translate.onLangChange.subscribe(() => {
        if (this.section === 'resume-full' && this.resumeData) {
          setTimeout(() => this.typewriterEffect(), 100);
        }
      })
    );
  }

  ngOnChanges(): void {
    if (this.section === 'resume-full' && this.resumeData) {
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

  formatDescription(description: string): SafeHtml {
    // Replace newlines with <br> tags
    const formatted = description.replace(/\n/g, '<br>');
    return this.sanitizer.sanitize(1, formatted) || '';
  }

  private generateFullResume(): string {
    if (!this.resumeData) return '';

    const separator =
      '═══════════════════════════════════════════════════════════════════════════════════════';
    let resume = '';

    // Header
    resume += `${this.translate.instant('RESUME.HEADER')}\n${separator}\n\n`;
    resume += `${this.translate.instant('RESUME.NAME')} ${
      this.resumeData.name
    }\n`;
    resume += `${this.translate.instant('RESUME.POSITION')} ${
      this.resumeData.position
    }\n`;
    resume += `${this.translate.instant('RESUME.CLEARANCE')} ${
      this.resumeData.clearance
    }\n`;
    resume += `${this.translate.instant('RESUME.CONTACT')} ${
      this.resumeData.email
    }\n\n`;

    // Summary
    resume += `${separator}\n${this.translate.instant(
      'RESUME.SUMMARY_TITLE'
    )}\n${separator}\n\n`;
    resume += `${this.resumeData.summary}\n\n`;

    // Work Experience
    resume += `${separator}\n${this.translate.instant(
      'RESUME.WORK_EXPERIENCE'
    )}\n${separator}\n\n`;
    this.resumeData.resume.experience.forEach((exp) => {
      resume += `[${exp.title}]\n`;
      resume += `${exp.company} | ${exp.period}\n\n`;
      resume += `${exp.description}\n\n`;
    });

    // Technical Skills
    resume += `${separator}\n${this.translate.instant(
      'RESUME.TECHNICAL_SKILLS'
    )}\n${separator}\n\n`;
    this.resumeData.resume.technicalSkills.forEach((skill) => {
      const blocks = '█'.repeat(skill.level) + '░'.repeat(10 - skill.level);
      resume += `${skill.name} [${blocks}] ${skill.level}/10\n`;
    });
    resume += '\n';

    // Soft Skills
    resume += `${separator}\n${this.translate.instant(
      'RESUME.SOFT_SKILLS'
    )}\n${separator}\n\n`;
    this.resumeData.resume.softSkills.forEach((skill) => {
      const blocks = '█'.repeat(skill.level) + '░'.repeat(10 - skill.level);
      resume += `${skill.name} [${blocks}] ${skill.level}/10\n`;
    });
    resume += '\n';

    // Languages
    resume += `${separator}\n${this.translate.instant(
      'RESUME.LANGUAGES'
    )}\n${separator}\n\n`;
    this.resumeData.resume.languages.forEach((lang) => {
      resume += `${lang.name} - ${lang.level}\n`;
    });
    resume += '\n';

    // Education
    resume += `${separator}\n${this.translate.instant(
      'RESUME.EDUCATION_TITLE'
    )}\n${separator}\n\n`;
    this.resumeData.resume.schools.forEach((school) => {
      resume += `[${school.degree}]\n`;
      resume += `${school.school} | ${school.year}\n\n`;
    });

    // Personal Interests
    resume += `${separator}\n${this.translate.instant(
      'RESUME.PERSONAL_INTERESTS'
    )}\n${separator}\n\n`;
    this.resumeData.resume.hobbies.forEach((hobby) => {
      resume += `* ${hobby}\n`;
    });
    resume += '\n';

    // Footer
    resume += `${separator}\n${this.translate.instant(
      'RESUME.END_OF_FILE'
    )}\n${separator}`;

    return resume;
  }

  typewriterEffect(): void {
    if (!this.resumeData) {
      console.log('No resume data available for typewriter effect');
      return;
    }

    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
    }

    this.displayText = '';
    const fullText = this.generateFullResume();
    let index = 0;

    this.typewriterInterval = setInterval(() => {
      if (index < fullText.length) {
        this.displayText += fullText[index];
        index++;
      } else {
        clearInterval(this.typewriterInterval);
        this.typewriterInterval = null;
      }
    }, 0.5);
  }

  getSkillBlocks(level: number): boolean[] {
    return Array(10)
      .fill(false)
      .map((_, i) => i < level);
  }
}
