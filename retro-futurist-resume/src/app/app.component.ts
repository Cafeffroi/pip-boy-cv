import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ThemeService } from './services/theme.service';
import { ResumeDataService } from './services/resume-data.service';
import { LanguageService } from './services/language.service';
import { AudioService } from './services/audio.service';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { TerminalMenuComponent } from './components/terminal-menu/terminal-menu.component';
import { ResumeSectionsComponent } from './components/resume-sections/resume-sections.component';
import { ContactComponent } from './components/contact/contact.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

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
    ContactComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('commandInput') commandInput!: ElementRef<HTMLInputElement>;

  isLoading = true;
  currentView = 'menu';
  currentTheme: any;
  themeName: 'green' | 'amber' = 'green';
  dataLoaded = false;
  loadingScreenComplete = false;
  currentLanguage = 'fr';
  resumeId: string | null = null;
  resumeNotFound = false;

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

  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private resumeService: ResumeDataService,
    private languageService: LanguageService,
    private translate: TranslateService,
    private audioService: AudioService,
  ) {
    this.subscriptions.add(
      this.themeService.currentTheme$.subscribe((theme) => {
        this.themeName = theme;
        this.currentTheme = this.themeService.getThemeColors(theme);
        this.updateCSSVariables();
      }),
    );

    this.subscriptions.add(
      this.languageService.currentLanguage$.subscribe((lang) => {
        const previousLanguage = this.currentLanguage;
        this.currentLanguage = lang;

        // Only reload if language actually changed and we're not in initial load
        if (previousLanguage !== lang && this.loadingScreenComplete) {
          console.log(
            `Language changed from ${previousLanguage} to ${lang}, reloading resume...`,
          );
          this.loadResume();
        }
      }),
    );

    // Subscribe to resume not found status
    this.subscriptions.add(
      this.resumeService.resumeNotFound$.subscribe((notFound) => {
        this.resumeNotFound = notFound;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Global keyboard listener for sound effects
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isLoading && !this.resumeNotFound) {
      // Don't play sound for special keys
      const specialKeys = [
        'Shift',
        'Control',
        'Alt',
        'Meta',
        'Tab',
        'CapsLock',
        'Escape',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
        'PageUp',
        'PageDown',
        'Insert',
        'Delete',
      ];

      if (!specialKeys.includes(event.key)) {
        this.audioService.playKeyboardSound();
      }
    }
  }

  // Listen for clicks but be smart about it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isLoading && !this.resumeNotFound) {
      const target = event.target as HTMLElement;

      // Don't refocus if clicking on form elements
      if (this.isFormElement(target)) {
        return;
      }

      // Small delay to let other click handlers execute first
      setTimeout(() => this.focusCommandLine(), 0);
    }
  }

  // Only refocus if we're not in a form element
  @HostListener('document:focusin', ['$event'])
  onFocusIn(event: FocusEvent): void {
    if (
      !this.isLoading &&
      !this.resumeNotFound &&
      event.target !== this.commandInput?.nativeElement
    ) {
      const target = event.target as HTMLElement;

      // Don't steal focus from form elements
      if (this.isFormElement(target)) {
        return;
      }

      setTimeout(() => this.focusCommandLine(), 0);
    }
  }

  // Helper method to check if an element is a form input
  private isFormElement(element: HTMLElement): boolean {
    if (!element) return false;

    const tagName = element.tagName.toLowerCase();
    const isInput =
      tagName === 'input' || tagName === 'textarea' || tagName === 'button';

    // Also check if it's the command input itself
    const isCommandInput = element === this.commandInput?.nativeElement;

    return (isInput && !isCommandInput) || isCommandInput;
  }

  ngOnInit(): void {
    // Get the resume ID from the route parameter
    this.subscriptions.add(
      this.route.params.subscribe((params) => {
        this.resumeId = params['resumeId'] || null;
        this.loadResume();
      }),
    );

    // Listen for command execution globally and store timestamp
    window.addEventListener('commandExecuted', () => {
      console.log('Command executed - storing timestamp');
      (window as any).lastCommandTime = Date.now();
    });
  }

  private loadResume(): void {
    console.log(`Loading resume with language: ${this.currentLanguage}`);

    // Load resume data with the ID from URL and current language
    this.resumeService
      .loadResumeData(this.resumeId || undefined, this.currentLanguage)
      .subscribe({
        next: (data) => {
          console.log('Resume data loaded successfully', data);
          if (this.resumeId) {
            console.log(`Loaded resume: ${this.resumeId}`);
          }
          this.dataLoaded = true;
          this.resumeNotFound = false;
          this.checkIfReadyToShow();
        },
        error: (error) => {
          console.error('Error loading resume data:', error);
          this.dataLoaded = true;
          this.resumeNotFound = true;
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
      // Focus command input after a short delay (only if resume found)
      if (!this.resumeNotFound) {
        setTimeout(() => this.focusCommandLine(), 100);
      }
    }
  }

  private focusCommandLine(): void {
    if (
      this.commandInput?.nativeElement &&
      document.activeElement !== this.commandInput.nativeElement
    ) {
      // Only focus if we're not already in a form element
      const activeElement = document.activeElement as HTMLElement;
      if (!this.isFormElement(activeElement)) {
        this.commandInput.nativeElement.focus();
      }
    }
  }

  onViewChange(view: string): void {
    this.currentView = view;
    setTimeout(() => this.focusCommandLine(), 50);
  }

  goBack(): void {
    this.currentView = 'menu';
    // Refocus after navigation
    setTimeout(() => this.focusCommandLine(), 50);
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

    // Dispatch custom event to let menu know a command was executed
    window.dispatchEvent(new Event('commandExecuted'));

    // Handle 'back' command - always go to menu
    if (cmd === 'back' || cmd === 'menu' || cmd === 'home') {
      // Clear command BEFORE doing anything else
      this.commandText = '';

      if (this.currentView === 'menu') {
        this.showFeedback('Already at main menu');
      } else {
        this.goBack();
        this.showFeedback('Returned to main menu');
      }

      // Blur the input briefly to prevent enter from being processed again
      if (this.commandInput?.nativeElement) {
        this.commandInput.nativeElement.blur();
        setTimeout(() => {
          this.focusCommandLine();
        }, 100);
      }
      return;
    }

    // Handle 'help' command
    if (cmd === 'help') {
      this.commandText = '';
      this.showHelp();
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
      this.commandText = '';
      this.onViewChange(this.commandMap[cmd]);
      this.showFeedback(`Navigated to section ${cmd}`);
      return;
    }

    // Handle 'green' or 'amber' theme commands
    if (cmd === 'green' || cmd === 'amber') {
      this.commandText = '';
      if (
        (cmd === 'green' && this.themeName !== 'green') ||
        (cmd === 'amber' && this.themeName !== 'amber')
      ) {
        this.toggleTheme();
        this.showFeedback(`Theme changed to ${cmd}`);
      } else {
        this.showFeedback(`Already using ${cmd} theme`);
      }
      return;
    }

    // Handle 'en' or 'fr' language commands
    if (cmd === 'en' || cmd === 'fr') {
      this.commandText = '';
      if (this.currentLanguage !== cmd) {
        this.toggleLanguage();
        this.showFeedback(`Language changed to ${cmd.toUpperCase()}`);
      } else {
        this.showFeedback(`Already using ${cmd.toUpperCase()}`);
      }
      return;
    }

    // Unknown command
    this.commandText = '';
    this.showFeedback(
      `Unknown command: "${cmd}". Type 'help' for available commands.`,
    );
  }

  private showHelp(): void {
    const helpText = `${this.translate.instant('HELP.TITLE')}
    
${this.translate.instant('HELP.NAVIGATION')}
  ${this.translate.instant('HELP.NAV_1')}
  ${this.translate.instant('HELP.NAV_2')}
  ${this.translate.instant('HELP.NAV_3')}
  ${this.translate.instant('HELP.NAV_4')}
  ${this.translate.instant('HELP.NAV_5')}
  ${this.translate.instant('HELP.NAV_6')}
  ${this.translate.instant('HELP.NAV_BACK')}
  
${this.translate.instant('HELP.SETTINGS')}
  ${this.translate.instant('HELP.SET_GREEN')}
  ${this.translate.instant('HELP.SET_AMBER')}
  ${this.translate.instant('HELP.SET_EN')}
  ${this.translate.instant('HELP.SET_FR')}
  
${this.translate.instant('HELP.OTHER')}
  ${this.translate.instant('HELP.OTHER_HELP')}
  ${this.translate.instant('HELP.OTHER_CLEAR')}`;

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
        this.currentTheme.primary,
      );
      document.documentElement.style.setProperty(
        '--secondary-color',
        this.currentTheme.secondary,
      );
      document.documentElement.style.setProperty(
        '--background-color',
        this.currentTheme.background,
      );
      document.documentElement.style.setProperty(
        '--glow-color',
        this.currentTheme.glow,
      );
    }
  }
}
