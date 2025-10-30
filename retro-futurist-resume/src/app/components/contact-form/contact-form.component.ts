import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { AudioService } from '../../services/audio.service';
import { ContactForm } from '../../models/resume.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent {
  contactForm: ContactForm = {
    name: '',
    email: '',
    message: '',
  };

  formSubmitted = false;
  currentTheme: any;

  constructor(
    private themeService: ThemeService,
    private audioService: AudioService
  ) {
    this.themeService.currentTheme$.subscribe((theme) => {
      this.currentTheme = this.themeService.getThemeColors(theme);
    });
  }

  onInput(): void {
    this.audioService.playKeySound();
  }

  onSubmit(): void {
    if (
      this.contactForm.name &&
      this.contactForm.email &&
      this.contactForm.message
    ) {
      console.log('Contact form submitted:', this.contactForm);
      // Here you would integrate with your email service

      this.formSubmitted = true;
      setTimeout(() => {
        this.formSubmitted = false;
        this.contactForm = { name: '', email: '', message: '' };
      }, 3000);
    }
  }
}
