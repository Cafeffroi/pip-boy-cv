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
      primary: '#00ff00',
      secondary: '#00aa00',
      background: '#001100',
      glow: 'rgba(0, 255, 0, 0.5)',
    },
    amber: {
      primary: '#ffaa00',
      secondary: '#cc8800',
      background: '#110800',
      glow: 'rgba(255, 170, 0, 0.5)',
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
