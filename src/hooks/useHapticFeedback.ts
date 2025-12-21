import { useEffect, useRef } from 'react';

export interface HapticOptions {
  pattern?: number[];
  intensity?: 'light' | 'medium' | 'heavy';
  duration?: number;
}

export interface AudioOptions {
  frequency?: number;
  duration?: number;
  type?: 'sine' | 'square' | 'sawtooth' | 'triangle';
  volume?: number;
}

class HapticAudioSystem {
  private audioContext: AudioContext | null = null;
  private isOptedOut = false;
  private initialized = false;

  constructor() {
    this.checkOptOut();
    this.initializeAudio();
  }

  private checkOptOut() {
    this.isOptedOut = localStorage.getItem('vauntico-haptic-optout') === 'true';
  }

  private initializeAudio() {
    if (typeof window !== 'undefined' && !this.audioContext && !this.isOptedOut) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.initialized = true;
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }

  public optOut() {
    this.isOptedOut = true;
    localStorage.setItem('vauntico-haptic-optout', 'true');
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  public optIn() {
    this.isOptedOut = false;
    localStorage.removeItem('vauntico-haptic-optout');
    this.initializeAudio();
  }

  public vibrate(options: HapticOptions = {}) {
    if (this.isOptedOut || !navigator.vibrate) return;

    const {
      pattern = [10],
      intensity = 'medium',
      duration = 10
    } = options;

    // Adjust intensity based on device capability
    let adjustedPattern = pattern;
    switch (intensity) {
      case 'light':
        adjustedPattern = pattern.map(d => Math.max(1, d * 0.5));
        break;
      case 'heavy':
        adjustedPattern = pattern.map(d => Math.min(100, d * 1.5));
        break;
    }

    try {
      navigator.vibrate(adjustedPattern);
    } catch (error) {
      console.warn('Vibration failed:', error);
    }
  }

  public playChime(options: AudioOptions = {}) {
    if (this.isOptedOut || !this.audioContext) return;

    const {
      frequency = 528, // Love frequency (528 Hz)
      duration = 200,
      type = 'sine',
      volume = 0.1
    } = options;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  public playSacredChimes() {
    if (this.isOptedOut) return;

    // Play a sequence of sacred frequencies
    const frequencies = [396, 417, 528, 639, 741]; // Solfeggio frequencies
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playChime({
          frequency: freq,
          duration: 300,
          volume: 0.08
        });
      }, index * 150);
    });
  }

  public playTrustUpdate() {
    if (this.isOptedOut) return;

    // Ascending chime for positive trust updates
    this.playChime({ frequency: 432, duration: 150 });
    setTimeout(() => this.playChime({ frequency: 528, duration: 200 }), 100);
    setTimeout(() => this.playChime({ frequency: 639, duration: 250 }), 200);
  }

  public playRitualComplete() {
    if (this.isOptedOut) return;

    // Celebratory sequence for ritual completion
    this.playSacredChimes();
    this.vibrate({ pattern: [50, 30, 50, 30, 100] });
  }

  public isSupported(): boolean {
    return !this.isOptedOut && (
      !!(navigator.vibrate) || 
      !!(this.audioContext)
    );
  }

  public getStatus(): { hapticSupported: boolean; audioSupported: boolean; isOptedOut: boolean } {
    return {
      hapticSupported: !!(navigator.vibrate) && !this.isOptedOut,
      audioSupported: !!(this.audioContext) && !this.isOptedOut,
      isOptedOut: this.isOptedOut
    };
  }
}

// Singleton instance
const hapticSystem = new HapticAudioSystem();

export const useHapticFeedback = () => {
  const triggerHaptic = (options?: HapticOptions) => {
    hapticSystem.vibrate(options);
  };

  const playChime = (options?: AudioOptions) => {
    hapticSystem.playChime(options);
  };

  const playSacredChimes = () => {
    hapticSystem.playSacredChimes();
  };

  const playTrustUpdate = () => {
    hapticSystem.playTrustUpdate();
  };

  const playRitualComplete = () => {
    hapticSystem.playRitualComplete();
  };

  const optOut = () => {
    hapticSystem.optOut();
  };

  const optIn = () => {
    hapticSystem.optIn();
  };

  const getStatus = () => {
    return hapticSystem.getStatus();
  };

  return {
    triggerHaptic,
    playChime,
    playSacredChimes,
    playTrustUpdate,
    playRitualComplete,
    optOut,
    optIn,
    getStatus,
    isSupported: hapticSystem.isSupported()
  };
};

// Hook for hover effects
export const useHapticHover = () => {
  const { triggerHaptic, playChime, isSupported } = useHapticFeedback();
  const lastTriggerRef = useRef<number>(0);

  const handleHover = (options?: HapticOptions & AudioOptions) => {
    if (!isSupported) return;

    const now = Date.now();
    // Debounce rapid hover events
    if (now - lastTriggerRef.current < 100) return;
    lastTriggerRef.current = now;

    triggerHaptic({ pattern: [5], intensity: 'light' });
    playChime({ frequency: 800, duration: 50, volume: 0.03 });
  };

  return { handleHover };
};

// Hook for trust score updates
export const useTrustFeedback = () => {
  const { playTrustUpdate, triggerHaptic, playChime, isSupported } = useHapticFeedback();

  const onTrustIncrease = (amount: number) => {
    if (!isSupported) return;

    if (amount > 10) {
      playTrustUpdate();
      triggerHaptic({ pattern: [20, 10, 20], intensity: 'medium' });
    } else if (amount > 5) {
      playChime({ frequency: 528, duration: 150 });
      triggerHaptic({ pattern: [10], intensity: 'light' });
    }
  };

  const onTrustDecrease = (amount: number) => {
    if (!isSupported) return;

    if (amount > 10) {
      playChime({ frequency: 200, duration: 200, type: 'sawtooth' });
      triggerHaptic({ pattern: [30, 20, 30], intensity: 'heavy' });
    } else {
      playChime({ frequency: 300, duration: 100, type: 'sawtooth' });
      triggerHaptic({ pattern: [15], intensity: 'medium' });
    }
  };

  return { onTrustIncrease, onTrustDecrease };
};

export default hapticSystem;
