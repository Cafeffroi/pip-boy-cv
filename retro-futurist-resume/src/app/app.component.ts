import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from './services/theme.service';
import { ResumeDataService } from './services/resume-data.service';
import { LanguageService } from './services/language.service';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { TerminalMenuComponent } from './components/terminal-menu/terminal-menu.component';
import { ResumeSectionsComponent } from './components/resume-sections/resume-sections.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LoadingScreenComponent,
    TerminalMenuComponent,
    ResumeSectionsComponent,
    ContactFormComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoading = true;
  currentView = 'menu';
  currentTheme: any;
  themeName: 'green' | 'amber' = 'green';
  dataLoaded = false;
  loadingScreenComplete = false;
  currentLanguage = 'fr';

  constructor(
    private themeService: ThemeService,
    private resumeService: ResumeDataService,
    private languageService: LanguageService
  ) {
    this.themeService.currentTheme$.subscribe((theme) => {
      this.themeName = theme;
      this.currentTheme = this.themeService.getThemeColors(theme);
      this.updateCSSVariables();
    });

    this.languageService.currentLanguage$.subscribe((lang) => {
      this.currentLanguage = lang;
    });
  }

  ngOnInit(): void {
    this.resumeService.loadResumeData().subscribe({
      next: (data) => {
        console.log('Resume data loaded successfully', data);
        this.dataLoaded = true;
        this.checkIfReadyToShow();
      },
      error: (error) => {
        console.error('Error loading resume data:', error);
        this.dataLoaded = true;
        this.checkIfReadyToShow();
      },
    });
  }

  onLoadingComplete(): void {
    this.loadingScreenComplete = true;
    this.checkIfReadyToShow();
  }

  private checkIfReadyToShow(): void {
    if (this.loadingScreenComplete && this.dataLoaded) {
      this.isLoading = false;
    }
  }

  onViewChange(view: string): void {
    this.currentView = view;
  }

  goBack(): void {
    this.currentView = 'menu';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  updateCSSVariables(): void {
    if (this.currentTheme) {
      document.documentElement.style.setProperty(
        '--primary-color',
        this.currentTheme.primary
      );
      document.documentElement.style.setProperty(
        '--secondary-color',
        this.currentTheme.secondary
      );
      document.documentElement.style.setProperty(
        '--background-color',
        this.currentTheme.background
      );
      document.documentElement.style.setProperty(
        '--glow-color',
        this.currentTheme.glow
      );
    }
  }
}
