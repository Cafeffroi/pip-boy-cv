import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-terminal-menu',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './terminal-menu.component.html',
  styleUrls: ['./terminal-menu.component.scss'],
})
export class TerminalMenuComponent {
  @Output() viewChange = new EventEmitter<string>();

  currentTheme: any;

  constructor(private themeService: ThemeService) {
    this.themeService.currentTheme$.subscribe((theme) => {
      this.currentTheme = this.themeService.getThemeColors(theme);
    });
  }

  navigateTo(view: string): void {
    this.viewChange.emit(view);
  }
}
