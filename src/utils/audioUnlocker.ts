/**
 * Interactive Flat Panel (IFP) and Android WebView Audio Unlocker & Engine
 * Resolves Chrome desktop vs Android APK / Interactive Smart Board WebView audio blocking.
 */

export interface AudioLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  source: string;
  message: string;
}

let globalAudioContext: AudioContext | null = null;
let audioUnlocked = false;
const audioLogs: AudioLogEntry[] = [];
const listeners: Array<(unlocked: boolean) => void> = [];

export function logAudioEvent(type: AudioLogEntry['type'], source: string, message: string) {
  const entry: AudioLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toLocaleTimeString(),
    type,
    source,
    message,
  };
  audioLogs.unshift(entry);
  if (audioLogs.length > 50) audioLogs.pop();
  console.log(`[Audio ${source}] [${type.toUpperCase()}] ${message}`);
}

export function getAudioLogs(): AudioLogEntry[] {
  return [...audioLogs];
}

/**
 * Detects Interactive Flat Panel (IFP) or Android WebView environment
 */
export function isIFPDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isWebView = /Android.*wv|WebView/i.test(ua);
  const isAndroidLarge = /Android/i.test(ua) && (window.innerWidth > 1000 || (window.screen && window.screen.width > 1000));
  const isLargeTouch = window.innerWidth > 1000 && ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
  return Boolean(isWebView || isAndroidLarge || isLargeTouch);
}

/**
 * Detailed device environment telemetry for IFP boards
 */
export function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      isIFP: false,
      userAgent: 'SSR',
      hasTouch: false,
      resolution: 'unknown',
      audioContextState: 'none',
      speechSynthesisAvailable: false,
    };
  }
  const ua = navigator.userAgent;
  const isIFP = isIFPDevice();
  const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  const resolution = `${window.innerWidth} x ${window.innerHeight} (Screen: ${window.screen?.width || 0} x ${window.screen?.height || 0})`;
  const audioContextState = globalAudioContext ? globalAudioContext.state : 'uninitialized';
  const speechSynthesisAvailable = 'speechSynthesis' in window;

  return {
    isIFP,
    userAgent: ua,
    hasTouch,
    touchPoints: navigator.maxTouchPoints || 0,
    resolution,
    audioContextState,
    speechSynthesisAvailable,
  };
}

/**
 * Checks if audio has been unlocked for the current session.
 * For IFP/WebView devices, requires unlock per session/app start.
 */
export function isAudioUnlocked(): boolean {
  if (audioUnlocked) return true;
  if (typeof window === 'undefined') return false;

  const isIFP = isIFPDevice();
  // IFP requirement: Always show user gesture unlock on every session start, don't rely on localStorage
  if (isIFP) {
    const sessionUnlocked = sessionStorage.getItem('ifp_session_audio_unlocked') === 'true';
    if (sessionUnlocked) {
      audioUnlocked = true;
      return true;
    }
    return false;
  }

  // For standard desktop browsers
  const localUnlocked = localStorage.getItem('ifp_audio_unlocked') === 'true';
  if (localUnlocked) {
    audioUnlocked = true;
    return true;
  }
  return false;
}

export function subscribeAudioUnlocked(callback: (unlocked: boolean) => void) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn(audioUnlocked));
}

/**
 * Gets or creates the global AudioContext
 */
export function getGlobalAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioContext || globalAudioContext.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      globalAudioContext = new AudioCtx();
    }
  }
  return globalAudioContext;
}

/**
 * Critical IFP Unlock function executed on user touch/tap gesture
 */
export async function unlockAudio(): Promise<{ success: boolean; error?: string }> {
  logAudioEvent('info', 'Unlock', 'Initiating gesture unlock for WebView / Interactive Board...');

  try {
    // 1. Unlock Web Audio API AudioContext
    const ctx = getGlobalAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        await ctx.resume();
        logAudioEvent('success', 'WebAudio', `AudioContext resumed successfully (state: ${ctx.state})`);
      } else {
        logAudioEvent('info', 'WebAudio', `AudioContext already in state: ${ctx.state}`);
      }

      // Create and play silent 1-sample buffer
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      logAudioEvent('success', 'WebAudio', 'Silent audio buffer played successfully');
    } else {
      logAudioEvent('warning', 'WebAudio', 'Web Audio API not supported on this device');
    }

    // 2. Unlock HTML5 Audio via silent wav data URI
    try {
      const a = new Audio();
      // 0.1s silent WAV data URI
      a.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      a.volume = 0.01;
      const playPromise = a.play();
      if (playPromise !== undefined) {
        await playPromise.catch((err) => {
          logAudioEvent('warning', 'HTML5Audio', `Silent HTML5 Audio play caught: ${err}`);
        });
      }
      logAudioEvent('success', 'HTML5Audio', 'HTML5 Audio channel unlocked');
    } catch (html5Err) {
      logAudioEvent('warning', 'HTML5Audio', `HTML5 unlock warning: ${html5Err}`);
    }

    // 3. Unlock SpeechSynthesis if present
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        const silentUtterance = new SpeechSynthesisUtterance(' ');
        silentUtterance.volume = 0.01;
        window.speechSynthesis.speak(silentUtterance);
        logAudioEvent('success', 'SpeechSynth', 'SpeechSynthesis engine resumed and primed');
      } catch (synthErr) {
        logAudioEvent('warning', 'SpeechSynth', `SpeechSynthesis priming caught: ${synthErr}`);
      }
    }

    // 4. Update MediaSession action handler for IFP Android Audio Focus
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          logAudioEvent('info', 'MediaSession', 'MediaSession action: play triggered');
        });
        logAudioEvent('success', 'MediaSession', 'Android MediaSession audio focus action registered');
      } catch (mediaErr) {
        logAudioEvent('warning', 'MediaSession', `MediaSession registration error: ${mediaErr}`);
      }
    }

    // 5. Update state flags
    audioUnlocked = true;
    try {
      localStorage.setItem('ifp_audio_unlocked', 'true');
      sessionStorage.setItem('ifp_session_audio_unlocked', 'true');
    } catch {}

    // Hide DOM overlay if present in document
    const overlay = document.getElementById('audio-unlock-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }

    notifyListeners();
    logAudioEvent('success', 'Unlock', 'Audio successfully unlocked for Interactive Board / Android WebView!');
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logAudioEvent('error', 'Unlock', `Unlock failed: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Resets the audio unlock state for testing
 */
export function resetAudioUnlockState() {
  audioUnlocked = false;
  try {
    localStorage.removeItem('ifp_audio_unlocked');
    sessionStorage.removeItem('ifp_session_audio_unlocked');
  } catch {}
  notifyListeners();
  logAudioEvent('info', 'Reset', 'Audio lock state reset to locked');
}
