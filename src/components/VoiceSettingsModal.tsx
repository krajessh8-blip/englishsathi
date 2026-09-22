import React, { useState, useEffect } from 'react';
import {
  getAvailableVoices,
  getIndianVoices,
  getSavedVoicePrefs,
  saveVoicePrefs,
  speakText,
  stopSpeaking,
} from '../utils/speech';
import {
  X,
  Volume2,
  Gauge,
  Hourglass,
  Sliders,
  CheckCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  speed: number;
  onSpeedChange: (newSpeed: number) => void;
  pauseSeconds: number;
  onPauseSecondsChange: (newPause: number) => void;
}

export const VoiceSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  speed,
  onSpeedChange,
  pauseSeconds,
  onPauseSecondsChange,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [indianVoices, setIndianVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [teacherVoiceURI, setTeacherVoiceURI] = useState<string>('');
  const [riyaVoiceURI, setRiyaVoiceURI] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadVoices = () => {
      const all = getAvailableVoices();
      setVoices(all);
      const ind = getIndianVoices();
      setIndianVoices(ind);

      const prefs = getSavedVoicePrefs();
      if (prefs.teacherVoiceURI) setTeacherVoiceURI(prefs.teacherVoiceURI);
      if (prefs.riyaVoiceURI) setRiyaVoiceURI(prefs.riyaVoiceURI);
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpeedChange = (val: number) => {
    onSpeedChange(val);
    saveVoicePrefs({ speed: val });
  };

  const handlePauseChange = (val: number) => {
    onPauseSecondsChange(val);
    saveVoicePrefs({ pauseDurationSeconds: val });
  };

  const handleSaveVoices = () => {
    saveVoicePrefs({
      teacherVoiceURI,
      riyaVoiceURI,
      speed,
      pauseDurationSeconds: pauseSeconds,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestTeacherVoice = () => {
    stopSpeaking();
    speakText(
      'Good morning, class! I am Teacher Anjali. Practice speaking English daily with confidence and clear pronunciation.',
      { who: 'teacher', rate: speed, voiceURI: teacherVoiceURI }
    );
  };

  const handleTestRiyaVoice = () => {
    stopSpeaking();
    speakText(
      'Yes, ma’am! I am Riya. I am practicing our English conversation every day after school.',
      { who: 'riya', rate: speed, voiceURI: riyaVoiceURI }
    );
  };

  const handleResetDefaults = () => {
    onSpeedChange(0.85);
    onPauseSecondsChange(4);
    setTeacherVoiceURI('');
    setRiyaVoiceURI('');
    saveVoicePrefs({
      speed: 0.85,
      pauseDurationSeconds: 4,
      teacherVoiceURI: '',
      riyaVoiceURI: '',
    });
  };

  // Preset speeds
  const speedPresets = [
    { label: '0.6x Slow', val: 0.6 },
    { label: '0.75x Learner', val: 0.75 },
    { label: '0.85x Indian Cadence', val: 0.85 },
    { label: '1.0x Normal', val: 1.0 },
    { label: '1.2x Fluent', val: 1.2 },
  ];

  // Preset pauses
  const pausePresets = [
    { label: '4 Seconds (Recommended)', val: 4 },
    { label: '2 Seconds', val: 2 },
    { label: '6 Seconds', val: 6 },
    { label: 'No Pause (0s)', val: 0 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sliders className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Voice &amp; Playback Controller</span>
                <span className="text-xs bg-amber-400/30 text-amber-200 font-bold px-2 py-0.5 rounded-full border border-amber-300/40">
                  🇮🇳 Indian Accent
                </span>
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Set speech speed, 4-second dialogue pause, and real natural voice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* 1. Voice Speed Controller */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-extrabold text-slate-800">
                  Voice Speed Controller
                </label>
              </div>
              <span className="text-sm font-mono font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-lg border border-blue-200">
                {speed.toFixed(2)}x Speed
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Adjust how fast Teacher Anjali and Riya speak. (0.85x is recommended for clear Indian English pronunciation).
            </p>

            {/* Slider */}
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-3"
            />

            {/* Speed Presets */}
            <div className="flex flex-wrap gap-1.5">
              {speedPresets.map((p) => (
                <button
                  key={p.val}
                  onClick={() => handleSpeedChange(p.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    Math.abs(speed - p.val) < 0.04
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-102'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Four-Second Pause After Each Conversation */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-700" />
                <label className="text-sm font-extrabold text-amber-950">
                  Pause After Each Sentence
                </label>
              </div>
              <span className="text-xs font-extrabold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                {pauseSeconds} Seconds
              </span>
            </div>

            <p className="text-xs text-amber-900/80 mb-3">
              Pauses continuous dialogue playback so students have time to absorb, repeat aloud, and shadow Teacher Anjali and Riya.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {pausePresets.map((p) => (
                <button
                  key={p.val}
                  onClick={() => handlePauseChange(p.val)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center transition-all border ${
                    pauseSeconds === p.val
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs scale-102'
                      : 'bg-white text-amber-950 border-amber-200 hover:border-amber-400 hover:bg-amber-100/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Real Indian Accent Voice Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇮🇳</span>
                <div>
                  <label className="text-sm font-extrabold text-slate-800 block">
                    Real Indian Accent Voice Selection
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Prioritizing authentic human Indian English (en-IN) voices on your device
                  </span>
                </div>
              </div>

              {indianVoices.length > 0 ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ {indianVoices.length} Indian Voice(s) Found
                </span>
              ) : (
                <span className="text-[11px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                  Device default voices
                </span>
              )}
            </div>

            {/* Teacher Voice */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <span>👩‍🏫 Teacher Anjali Voice:</span>
                </span>
                <button
                  onClick={handleTestTeacherVoice}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test Voice</span>
                </button>
              </div>

              <select
                value={teacherVoiceURI}
                onChange={(e) => {
                  setTeacherVoiceURI(e.target.value);
                  saveVoicePrefs({ teacherVoiceURI: e.target.value });
                }}
                className="w-full text-xs font-medium p-2 bg-slate-50 rounded-lg border border-slate-300 outline-hidden"
              >
                <option value="">Auto-Detect Best Real Indian Voice (Recommended)</option>
                {indianVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    🇮🇳 {v.name} ({v.lang})
                  </option>
                ))}
                {voices
                  .filter((v) => !indianVoices.some((iv) => iv.voiceURI === v.voiceURI))
                  .slice(0, 15)
                  .map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
              </select>
            </div>

            {/* Riya Voice */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                  <span>👧 Riya (Student) Voice:</span>
                </span>
                <button
                  onClick={handleTestRiyaVoice}
                  className="flex items-center gap-1 text-xs font-bold text-pink-600 hover:text-pink-800 bg-pink-50 px-2 py-1 rounded-lg border border-pink-200"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test Voice</span>
                </button>
              </div>

              <select
                value={riyaVoiceURI}
                onChange={(e) => {
                  setRiyaVoiceURI(e.target.value);
                  saveVoicePrefs({ riyaVoiceURI: e.target.value });
                }}
                className="w-full text-xs font-medium p-2 bg-slate-50 rounded-lg border border-slate-300 outline-hidden"
              >
                <option value="">Auto-Detect Best Real Indian Voice (Recommended)</option>
                {indianVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    🇮🇳 {v.name} ({v.lang})
                  </option>
                ))}
                {voices
                  .filter((v) => !indianVoices.some((iv) => iv.voiceURI === v.voiceURI))
                  .slice(0, 15)
                  .map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Indian Defaults (0.85x, 4s Pause)</span>
          </button>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Preferences Saved!</span>
              </span>
            )}
            <button
              onClick={() => {
                handleSaveVoices();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
            >
              Done &amp; Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
