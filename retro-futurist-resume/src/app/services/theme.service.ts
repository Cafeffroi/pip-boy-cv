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

  toggleTheme(): void {
    const newTheme =
      this.currentThemeSubject.value === 'green' ? 'amber' : 'green';
    this.currentThemeSubject.next(newTheme);
  }

  getThemeColors(themeName: 'green' | 'amber'): Theme {
    return this.themes[themeName];
  }

  getCurrentTheme(): 'green' | 'amber' {
    return this.currentThemeSubject.value;
  }
}
