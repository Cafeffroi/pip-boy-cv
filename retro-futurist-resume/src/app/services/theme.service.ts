import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  glow: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themes = {
    green: {
      primary: '#1aff80', // R: 26, G: 255, B: 128
      secondary: '#15cc66',
      background: '#001100',
      glow: 'rgba(26, 255, 128, 0.5)',
    },
    amber: {
      primary: '#ffb642', // R: 255, G: 182, B: 66
      secondary: '#cc9235',
      background: '#110800',
      glow: 'rgba(255, 182, 66, 0.5)',
    },
  };

  private currentThemeSubject = new BehaviorSubject<'green' | 'amber'>('green');
  currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    // Try to get theme from localStorage or use green as default
    const savedTheme = localStorage.getItem('preferredTheme');

    // If there's a saved theme preference, use it; otherwise default to green
    if (savedTheme && (savedTheme === 'green' || savedTheme === 'amber')) {
      this.setTheme(savedTheme as 'green' | 'amber');
    } else {
      // Explicitly set to green
      this.setTheme('green');
    }
  }

  setTheme(theme: 'green' | 'amber'): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem('preferredTheme', theme);
  }

  toggleTheme(): void {
    const newTheme =
      this.currentThemeSubject.value === 'green' ? 'amber' : 'green';
    this.setTheme(newTheme);
  }

  getThemeColors(themeName: 'green' | 'amber'): Theme {
    return this.themes[themeName];
  }

  getCurrentTheme(): 'green' | 'amber' {
    return this.currentThemeSubject.value;
  }
}
