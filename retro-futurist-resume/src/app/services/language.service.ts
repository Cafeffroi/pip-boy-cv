import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('fr');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  availableLanguages = [
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'en', name: 'English', flag: 'EN' },
  ];

  constructor(private translate: TranslateService) {
    // Set default language
    this.translate.setFallbackLang('fr');

    // Try to get language from localStorage or use default
    const savedLang = localStorage.getItem('preferredLanguage') || 'fr';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLanguageSubject.next(lang);
    localStorage.setItem('preferredLanguage', lang);
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    console.log('selected language : ' + newLang);
    this.setLanguage(newLang);
  }
}
