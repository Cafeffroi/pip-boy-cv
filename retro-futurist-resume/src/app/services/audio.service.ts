import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private keyboardAudio: HTMLAudioElement;

  constructor() {
    // Preload the keyboard sound for better performance
    this.keyboardAudio = new Audio('assets/sounds/keyboard-fx-1.mp3');
    this.keyboardAudio.volume = 0.3; // Adjust volume (0.0 to 1.0)
  }

  playKeySound(): void {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
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
    try {
      // Clone the audio to allow overlapping sounds
      const sound = this.keyboardAudio.cloneNode() as HTMLAudioElement;
      sound.volume = 0.3; // Adjust volume as needed
      sound.play().catch((err) => {
        // Silently fail if autoplay is blocked
        console.debug('Audio play failed:', err);
      });
    } catch (e) {
      console.debug('Audio error:', e);
    }
  }
}
