import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { ResumeDataService } from '../../services/resume-data.service';
import { ContactForm } from '../../models/resume.model';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent implements OnInit, OnDestroy {
  contactForm: ContactForm = {
    name: '',
    email: '',
    message: '',
  };

  formSubmitted = false;
  isSubmitting = false;
  errorMessage = '';
  currentTheme: any;
  targetEmail = '';

  private subscription: Subscription = new Subscription();

  constructor(
    private themeService: ThemeService,
    private resumeService: ResumeDataService,
  ) {
    this.subscription.add(
      this.themeService.currentTheme$.subscribe((theme) => {
        this.currentTheme = this.themeService.getThemeColors(theme);
      }),
    );
  }

  ngOnInit(): void {
    // Get email from loaded resume data
    this.subscription.add(
      this.resumeService.resumeData$
        .pipe(filter((data) => data !== null))
        .subscribe((data) => {
          if (data) {
            this.targetEmail = data.email;
          }
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async onSubmit(): Promise<void> {
    if (
      !this.contactForm.name ||
      !this.contactForm.email ||
      !this.contactForm.message
    ) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (!this.targetEmail) {
      this.errorMessage = 'Target email not loaded. Please try again.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const serviceId = 'YOUR_SERVICE_ID';
      const templateId = 'YOUR_TEMPLATE_ID';
      const publicKey = 'YOUR_PUBLIC_KEY';

      const templateParams = {
        from_name: this.contactForm.name,
        from_email: this.contactForm.email,
        message: this.contactForm.message,
        to_email: this.targetEmail,
      };

      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey,
      );

      this.formSubmitted = true;

      setTimeout(() => {
        this.formSubmitted = false;
        this.contactForm = { name: '', email: '', message: '' };
      }, 3000);
    } catch (error) {
      this.errorMessage = 'Failed to send message. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
