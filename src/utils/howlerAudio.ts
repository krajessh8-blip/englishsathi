import { Howl, Howler } from 'howler';
import { logAudioEvent, unlockAudio, isAudioUnlocked } from './audioUnlocker';

/**
 * Standard test sound: clean 440Hz A4 tone audio generated as base64 WAV
 */
export const SAMPLE_AUDIO_BEEP_WAV = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/DCkF4uFz2m5fDFoWckDC+h4/DJpG4sEjWh4vHNq3UtEjOf3/DLqXczETWd3vDMrHg2EzWd3vHPr3k3EzWd3vHPr3k3EzWd3vHPr3k3EzWd';

export interface HowlerPlayOptions {
  volume?: number;
  rate?: number;
  loop?: boolean;
  onEnd?: () => void;
  onPlay?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Robust Howler.js player with IFP Android WebView compatibility
 */
export function playHowlerAudio(src: string | string[], options: HowlerPlayOptions = {}): Howl {
  const sources = Array.isArray(src) ? src : [src];
  logAudioEvent('info', 'Howler', `Initializing Howl playback: ${sources[0].slice(0, 40)}...`);

  // Ensure IFP audio session unlocked
  if (!isAudioUnlocked()) {
    unlockAudio();
  }

  // Create Howl instance with IFP specific options
  const sound = new Howl({
    src: sources,
    html5: true, // Force HTML5 Audio for large files and Android WebView stability
    preload: true,
    autoplay: false,
    volume: options.volume ?? 1.0,
    rate: options.rate ?? 1.0,
    loop: options.loop ?? false,
    onload: () => {
      logAudioEvent('success', 'Howler', 'Audio asset loaded successfully');
    },
    onplay: () => {
      logAudioEvent('success', 'Howler', 'Audio started playing on Interactive Board / Device');
      options.onPlay?.();
    },
    onend: () => {
      logAudioEvent('info', 'Howler', 'Audio playback completed');
      options.onEnd?.();
    },
    onloaderror: (_id, err) => {
      logAudioEvent('error', 'Howler', `Load error: ${err}`);
      options.onError?.(err);
    },
    onplayerror: (_id, err) => {
      logAudioEvent('warning', 'Howler', `Play error encountered: ${err}. Waiting for unlock event...`);
      // User gesture unlock fallback
      sound.once('unlock', function () {
        logAudioEvent('info', 'Howler', 'Audio unlocked! Retrying play...');
        sound.play();
      });
      options.onError?.(err);
    },
  });

  // Fix IFP Android Audio Focus before triggering play
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', () => sound.play());
      navigator.mediaSession.setActionHandler('pause', () => sound.pause());
    } catch (e) {
      console.warn('MediaSession handler setup:', e);
    }
  }

  sound.play();
  return sound;
}

/**
 * Plays a pleasant classroom chime sound effect for correct answers / button clicks
 */
export function playChimeSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
      logAudioEvent('success', 'Chime', 'Synthesized classroom chime played');
      return;
    }
  } catch (e) {
    console.warn('Audio chime fallback error:', e);
  }

  // Howler fallback
  playHowlerAudio(SAMPLE_AUDIO_BEEP_WAV, { volume: 0.5 });
}

export { Howl, Howler };
