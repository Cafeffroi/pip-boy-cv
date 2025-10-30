import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    FormsModule,
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
  @ViewChild('commandInput') commandInput!: ElementRef<HTMLInputElement>;

  isLoading = true;
  currentView = 'menu';
  currentTheme: any;
  themeName: 'green' | 'amber' = 'green';
  dataLoaded = false;
  loadingScreenComplete = false;
  currentLanguage = 'fr';

  // Command line
  commandText = '';
  commandHint = '';
  showCommandHint = false;

  private commandMap: { [key: string]: string } = {
    '1': 'resume-full',
    '2': 'experience',
    '3': 'skills',
    '4': 'schools',
    '5': 'hobbies',
    '6': 'contact',
  };

  constructor(
    private themeService: ThemeService,
    private resumeService: ResumeDataService,
    private languageService: LanguageService,
    private translate: TranslateService
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

  // Listen for any click in the document and refocus command line
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isLoading) {
      // Small delay to let other click handlers execute first
      setTimeout(() => this.focusCommandLine(), 0);
    }
  }

  // Listen for any focus change and refocus command line
  @HostListener('document:focusin', ['$event'])
  onFocusIn(event: FocusEvent): void {
    if (!this.isLoading && event.target !== this.commandInput?.nativeElement) {
      // Don't steal focus from input/textarea elements in contact form
      const target = event.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        setTimeout(() => this.focusCommandLine(), 0);
      }
    }
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
      // Focus command input after a short delay
      setTimeout(() => this.focusCommandLine(), 100);
    }
  }

  private focusCommandLine(): void {
    if (this.commandInput?.nativeElement) {
      this.commandInput.nativeElement.focus();
    }
  }

  onViewChange(view: string): void {
    this.currentView = view;
    // Refocus after view change
    setTimeout(() => this.focusCommandLine(), 0);
  }

  goBack(): void {
    this.currentView = 'menu';
    // Refocus after navigation
    setTimeout(() => this.focusCommandLine(), 0);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    // Refocus after theme change
    setTimeout(() => this.focusCommandLine(), 0);
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
    // Refocus after language change
    setTimeout(() => this.focusCommandLine(), 0);
  }

  executeCommand(): void {
    const cmd = this.commandText.trim().toLowerCase();

    if (!cmd) {
      this.commandText = '';
      return;
    }

    // Handle 'back' command
    if (cmd === 'back') {
      if (this.currentView !== 'menu') {
        this.goBack();
        this.showFeedback('NAVIGATION.BACK');
      } else {
        this.showFeedback('Already at main menu');
      }
      this.commandText = '';
      return;
    }

    // Handle 'menu' or 'home' command
    if (cmd === 'menu' || cmd === 'home') {
      this.goBack();
      this.showFeedback('Returned to main menu');
      this.commandText = '';
      return;
    }

    // Handle 'help' command
    if (cmd === 'help') {
      this.showHelp();
      this.commandText = '';
      return;
    }

    // Handle 'clear' or 'cls' command
    if (cmd === 'clear' || cmd === 'cls') {
      this.commandText = '';
      this.showCommandHint = false;
      return;
    }

    // Handle numeric commands
    if (this.commandMap[cmd]) {
      this.onViewChange(this.commandMap[cmd]);
      this.showFeedback(`Navigated to section ${cmd}`);
      this.commandText = '';
      return;
    }

    // Handle 'green' or 'amber' theme commands
    if (cmd === 'green' || cmd === 'amber') {
      if (
        (cmd === 'green' && this.themeName !== 'green') ||
        (cmd === 'amber' && this.themeName !== 'amber')
      ) {
        this.toggleTheme();
        this.showFeedback(`Theme changed to ${cmd}`);
      } else {
        this.showFeedback(`Already using ${cmd} theme`);
      }
      this.commandText = '';
      return;
    }

    // Handle 'en' or 'fr' language commands
    if (cmd === 'en' || cmd === 'fr') {
      if (this.currentLanguage !== cmd) {
        this.toggleLanguage();
        this.showFeedback(`Language changed to ${cmd.toUpperCase()}`);
      } else {
        this.showFeedback(`Already using ${cmd.toUpperCase()}`);
      }
      this.commandText = '';
      return;
    }

    // Unknown command
    this.showFeedback(
      `Unknown command: "${cmd}". Type 'help' for available commands.`
    );
    this.commandText = '';
  }

  private showHelp(): void {
    const helpText = `Available commands:
    
Navigation:
  1 - Full Resume
  2 - Experience
  3 - Skills
  4 - Education
  5 - Hobbies
  6 - Contact
  back - Go back to menu
  menu/home - Go to main menu
  
Settings:
  green - Switch to green theme
  amber - Switch to amber theme
  en - Switch to English
  fr - Switch to French
  
Other:
  help - Show this help
  clear/cls - Clear command line`;

    this.commandHint = helpText;
    this.showCommandHint = true;
  }

  private showFeedback(message: string): void {
    this.commandHint = message;
    this.showCommandHint = true;

    setTimeout(() => {
      this.showCommandHint = false;
    }, 3000);
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
