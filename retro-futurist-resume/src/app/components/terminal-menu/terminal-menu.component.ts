import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

interface MenuItem {
  id: string;
  label: string;
  isSubItem: boolean;
}

@Component({
  selector: 'app-terminal-menu',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './terminal-menu.component.html',
  styleUrls: ['./terminal-menu.component.scss'],
})
export class TerminalMenuComponent implements OnInit, OnDestroy {
  @Output() viewChange = new EventEmitter<string>();

  currentTheme: any;
  selectedIndex = 0;
  menuItems: MenuItem[] = [
    { id: 'resume-full', label: 'MENU.FULL_RESUME', isSubItem: false },
    { id: 'experience', label: 'MENU.EXPERIENCE', isSubItem: true },
    { id: 'skills', label: 'MENU.SKILLS', isSubItem: true },
    { id: 'schools', label: 'MENU.EDUCATION', isSubItem: true },
    { id: 'hobbies', label: 'MENU.HOBBIES', isSubItem: true },
    { id: 'contact', label: 'MENU.CONTACT', isSubItem: false },
  ];

  private subscription: Subscription = new Subscription();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.themeService.currentTheme$.subscribe((theme) => {
        this.currentTheme = this.themeService.getThemeColors(theme);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Check if command input has text
    const commandInput = document.querySelector(
      '.command-input'
    ) as HTMLInputElement;

    // If command input has text and Enter is pressed, let the command line handle it
    if (
      event.key === 'Enter' &&
      commandInput &&
      commandInput.value.trim() !== ''
    ) {
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex =
        (this.selectedIndex - 1 + this.menuItems.length) %
        this.menuItems.length;
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.selectItem(this.selectedIndex);
    }
  }

  navigateTo(view: string): void {
    this.viewChange.emit(view);
  }

  selectItem(index: number): void {
    const item = this.menuItems[index];
    this.navigateTo(item.id);
  }

  onMouseEnter(index: number): void {
    this.selectedIndex = index;
  }

  isSelected(index: number): boolean {
    return this.selectedIndex === index;
  }

  getMenuItemId(index: number): string {
    return this.menuItems[index].id;
  }

  getMenuItemLabel(index: number): string {
    return this.menuItems[index].label;
  }

  isSubItem(index: number): boolean {
    return this.menuItems[index].isSubItem;
  }
}
