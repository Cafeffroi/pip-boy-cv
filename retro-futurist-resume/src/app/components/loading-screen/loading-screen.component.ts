import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss'],
})
export class LoadingScreenComponent implements OnInit {
  @Output() loadingComplete = new EventEmitter<void>();

  loadingProgress = 0;
  currentTheme: any;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.currentTheme$.subscribe((theme) => {
      this.currentTheme = this.themeService.getThemeColors(theme);
    });

    this.simulateLoading();
  }

  private simulateLoading(): void {
    const loadingSteps = [
      { progress: 25, delay: 100 },
      { progress: 45, delay: 400 },
      { progress: 50, delay: 100 },
      { progress: 75, delay: 100 },
      { progress: 95, delay: 200 },
      { progress: 100, delay: 200 },
    ];

    let currentStep = 0;

    const loadNextStep = () => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];

        // Gradually increase to target progress
        const startProgress = this.loadingProgress;
        const targetProgress = step.progress;
        const steps = targetProgress - startProgress;
        const stepDelay = 30; // Faster increment

        let currentIncrement = 0;
        const incrementInterval = setInterval(() => {
          if (currentIncrement < steps) {
            this.loadingProgress++;
            currentIncrement++;
          } else {
            clearInterval(incrementInterval);

            // Wait before next step
            setTimeout(() => {
              currentStep++;
              loadNextStep();
            }, step.delay);
          }
        }, stepDelay);
      } else {
        // Loading complete
        setTimeout(() => {
          this.loadingComplete.emit();
        }, 300);
      }
    };

    loadNextStep();
  }
}
