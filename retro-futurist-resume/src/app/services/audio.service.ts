import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private keyboardAudio: HTMLAudioElement;

  private mutedSubject = new BehaviorSubject<boolean>(false);
  muted$ = this.mutedSubject.asObservable();

  constructor() {
    // Preload the keyboard sound for better performance
    this.keyboardAudio = new Audio('assets/sounds/keyboard-fx-1.mp3');
    this.keyboardAudio.volume = 0.3;

    // Restore mute preference from localStorage
    const savedMuted = localStorage.getItem('soundMuted');
    if (savedMuted === 'true') {
      this.mutedSubject.next(true);
    }
  }

  isMuted(): boolean {
    return this.mutedSubject.value;
  }

  toggleMute(): void {
    const newValue = !this.mutedSubject.value;
    this.mutedSubject.next(newValue);
    localStorage.setItem('soundMuted', String(newValue));
  }

  playKeySound(): void {
    if (this.mutedSubject.value) return;

    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
      // Silently fail if audio context not available
    }
  }

  playKeyboardSound(): void {
    if (this.mutedSubject.value) return;

    try {
      const sound = this.keyboardAudio.cloneNode() as HTMLAudioElement;
      sound.volume = 0.3;
      sound.play().catch((err) => {
        console.debug('Audio play failed:', err);
      });
    } catch (e) {
      console.debug('Audio error:', e);
    }
  }
}
