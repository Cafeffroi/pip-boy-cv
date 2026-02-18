import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { ResumeDataService } from '../../services/resume-data.service';
import { ContactPoint } from '../../models/resume.model';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, OnDestroy {
  contactPoints: ContactPoint[] = [];
  currentTheme: any;
  copiedIndex: number | null = null;

  private subscription: Subscription = new Subscription();
  private copiedTimeout: any;

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
    this.subscription.add(
      this.resumeService.resumeData$
        .pipe(filter((data) => data !== null))
        .subscribe((data) => {
          if (data) {
            this.contactPoints = data.contactPoints || [];
          }
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.copiedTimeout) {
      clearTimeout(this.copiedTimeout);
    }
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      email: '✉',
      linkedin: '⊞',
      phone: '☎',
      github: '⌂',
      website: '◈',
    };
    return icons[type] || '▸';
  }

  copyToClipboard(value: string, index: number): void {
    navigator.clipboard.writeText(value).then(() => {
      this.copiedIndex = index;

      if (this.copiedTimeout) {
        clearTimeout(this.copiedTimeout);
      }

      this.copiedTimeout = setTimeout(() => {
        this.copiedIndex = null;
      }, 2000);
    });
  }
}
