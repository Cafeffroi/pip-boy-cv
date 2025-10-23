import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
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
      { progress: 15, delay: 300 },
      { progress: 18, delay: 100 },
      { progress: 35, delay: 500 },
      { progress: 38, delay: 100 },
      { progress: 42, delay: 200 },
      { progress: 58, delay: 600 },
      { progress: 62, delay: 150 },
      { progress: 75, delay: 400 },
      { progress: 78, delay: 100 },
      { progress: 85, delay: 300 },
      { progress: 92, delay: 200 },
      { progress: 100, delay: 300 },
    ];

    let currentStep = 0;

    const loadNextStep = () => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];

        // Gradually increase to target progress
        const startProgress = this.loadingProgress;
        const targetProgress = step.progress;
        const steps = targetProgress - startProgress;
        const stepDelay = 50;

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
        }, 500);
      }
    };

    loadNextStep();
  }
}
