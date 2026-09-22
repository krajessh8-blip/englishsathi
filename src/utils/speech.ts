import { isAudioUnlocked, unlockAudio, logAudioEvent, getGlobalAudioContext } from './audioUnlocker';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  who?: 'teacher' | 'riya';
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export interface VoicePreference {
  teacherVoiceURI: string;
  riyaVoiceURI: string;
  speed: number;
  pauseDurationSeconds: number;
}

const STORAGE_KEY = 'smart_voice_prefs';
const LEGACY_STORAGE_KEY = 'mvm_voice_prefs';

export function getSavedVoicePrefs(): VoicePreference {
  if (typeof window === 'undefined') {
    return {
      teacherVoiceURI: '',
      riyaVoiceURI: '',
      speed: 0.85,
      pauseDurationSeconds: 4,
    };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return {
    teacherVoiceURI: '',
    riyaVoiceURI: '',
    speed: 0.85,
    pauseDurationSeconds: 4,
  };
}

export function saveVoicePrefs(prefs: Partial<VoicePreference>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedVoicePrefs();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save voice prefs', err);
  }
}

// Find appropriate voices
export let currentUtterance: SpeechSynthesisUtterance | null = null;
export let isConversationActive: boolean = false;

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Filter and prioritize genuine real Indian accent voices
 */
export function getIndianVoices(): SpeechSynthesisVoice[] {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return [];

  // Filter for Indian English or Hindi-English locales
  const indianVoices = voices.filter((v) => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    return (
      lang.includes('en-in') ||
      lang.includes('en_in') ||
      lang.includes('hi-in') ||
      name.includes('india') ||
      name.includes('indian') ||
      name.includes('heera') ||
      name.includes('neerja') ||
      name.includes('veena') ||
      name.includes('kavya') ||
      name.includes('ravi') ||
      name.includes('prabhat') ||
      name.includes('rishi') ||
      name.includes('sangeeta')
    );
  });

  // Sort real/natural/neural voices to top
  return indianVoices.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aIsNatural = aName.includes('natural') || aName.includes('online') || aName.includes('neural') || aName.includes('google');
    const bIsNatural = bName.includes('natural') || bName.includes('online') || bName.includes('neural') || bName.includes('google');
    if (aIsNatural && !bIsNatural) return -1;
    if (!aIsNatural && bIsNatural) return 1;
    return 0;
  });
}

/**
 * Select the most realistic Indian accent voice for Teacher Anjali or Riya
 */
export function selectBestIndianVoice(
  who: 'teacher' | 'riya',
  customVoiceURI?: string
): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Check if user specified a voice URI
  if (customVoiceURI) {
    const custom = voices.find((v) => v.voiceURI === customVoiceURI);
    if (custom) return custom;
  }

  // Check saved preferences
  const prefs = getSavedVoicePrefs();
  const targetURI = who === 'teacher' ? prefs.teacherVoiceURI : prefs.riyaVoiceURI;
  if (targetURI) {
    const savedVoice = voices.find((v) => v.voiceURI === targetURI);
    if (savedVoice) return savedVoice;
  }

  const indianVoices = getIndianVoices();

  if (indianVoices.length > 0) {
    if (who === 'teacher') {
      // Teacher Anjali: prefer mature, natural female Indian voice (Heera, Neerja, Veena, Sangeeta, Google Indian)
      const matureFemale = indianVoices.find((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes('heera') ||
          name.includes('neerja') ||
          name.includes('veena') ||
          name.includes('sangeeta') ||
          name.includes('female') ||
          (name.includes('google') && !name.includes('male'))
        );
      });
      if (matureFemale) return matureFemale;
      return indianVoices[0];
    } else {
      // Riya: student girl voice (Kavya, Veena, Neerja, female voice with lighter timbre)
      const girlVoice = indianVoices.find((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes('kavya') ||
          name.includes('veena') ||
          name.includes('neerja') ||
          name.includes('zira') ||
          name.includes('female')
        );
      });
      if (girlVoice) return girlVoice;
      // If there are multiple Indian voices, pick second for variety if available
      return indianVoices.length > 1 ? indianVoices[1] : indianVoices[0];
    }
  }

  // Fallback to high-quality English voice if Indian voice not installed on OS
  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const naturalEnglish = englishVoices.find((v) => {
    const name = v.name.toLowerCase();
    return name.includes('natural') || name.includes('online') || name.includes('google') || name.includes('samantha');
  });

  return naturalEnglish || englishVoices[0] || voices[0] || null;
}

export function speakText(text: string, options: SpeechOptions = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    options.onEnd?.();
    return;
  }

  // Ensure AudioContext is running
  const ctx = getGlobalAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // Ensure Android MediaSession has focus before speaking
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      });
    } catch {}
  }

  // Cancel any ongoing speech & resume if stuck
  window.speechSynthesis.cancel();
  if (currentUtterance) {
    currentUtterance = null;
  }
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;
  const who = options.who || 'teacher';

  const selectedVoice = selectBestIndianVoice(who, options.voiceURI);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    // Set explicit Indian language tag for authentic cadence
    if (selectedVoice.lang.includes('en-IN') || selectedVoice.name.toLowerCase().includes('india')) {
      utterance.lang = 'en-IN';
    } else {
      utterance.lang = selectedVoice.lang || 'en-IN';
    }
  } else {
    utterance.lang = 'en-IN';
  }

  // Saved default speed
  const prefs = getSavedVoicePrefs();
  const baseRate = options.rate ?? prefs.speed ?? 0.85;

  if (who === 'riya') {
    // Riya (Indian school girl): natural cheerful cadence, not robotic high-pitched
    utterance.pitch = options.pitch ?? 1.08;
    utterance.rate = Math.max(0.5, Math.min(1.5, baseRate * 1.02));
  } else {
    // Teacher Anjali (Indian educator): warm, articulate, grounded Indian cadence
    utterance.pitch = options.pitch ?? 0.98;
    utterance.rate = Math.max(0.5, Math.min(1.5, baseRate * 0.96));
  }

  let hasEnded = false;
  const finish = () => {
    if (!hasEnded) {
      hasEnded = true;
      if (currentUtterance === utterance) {
        currentUtterance = null;
      }
      isConversationActive = false;
      options.onEnd?.();
    }
  };

  utterance.onstart = () => {
    logAudioEvent('info', 'Speech', `Speech began: "${text.slice(0, 30)}..." (${who})`);
    options.onStart?.();
  };

  utterance.onend = () => {
    logAudioEvent('info', 'Speech', `Speech ended: (${who})`);
    finish();
  };

  utterance.onerror = (event) => {
    console.error('SpeechSynthesis error:', event);
    logAudioEvent('warning', 'Speech', `Speech error event: ${event.error || 'unknown'}`);
    options.onError?.(event);
    finish();
  };

  // Android WebView Workaround: SpeechSynthesis keep-alive timer
  // Chrome Android / IFP WebView can pause long utterances after 15 seconds if not resumed
  const keepAliveInterval = setInterval(() => {
    if (!window.speechSynthesis.speaking || hasEnded) {
      clearInterval(keepAliveInterval);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, 3000);

  window.speechSynthesis.speak(utterance);

  // If paused immediately due to Android policy, try to unpause
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentUtterance) {
    currentUtterance = null;
  }
  isConversationActive = false;
}

// Web Speech API Speech Recognition helper
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

export function createSpeechRecognizer(
  onResult: (transcript: string, isFinal: boolean) => void,
  onEnd: () => void,
  onError: (error: string) => void
) {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser. Please type your reply.');
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-IN'; // Indian English accent recognition

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript.trim(), true);
    } else if (interimTranscript) {
      onResult(interimTranscript.trim(), false);
    }
  };

  recognition.onerror = (event: { error: string }) => {
    console.warn('SpeechRecognition error:', event.error);
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
