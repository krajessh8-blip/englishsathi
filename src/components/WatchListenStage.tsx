import React, { useState, useEffect, useRef } from 'react';
import { Situation, DialogLine } from '../types';
import { TeacherAvatar, RiyaAvatar } from './CharacterAvatars';
import { speakText, stopSpeaking } from '../utils/speech';
import {
  Volume2,
  Play,
  Pause,
  Square,
  Languages,
  Gauge,
  Sparkles,
  CheckCircle2,
  Hourglass,
  Sliders,
  FastForward,
} from 'lucide-react';

let currentUtterance: SpeechSynthesisUtterance | null = null;
let isConversationActive = false;

interface Props {
  situation: Situation;
  onNextStage: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  pauseSeconds: number;
  onPauseSecondsChange: (pause: number) => void;
  onOpenVoiceSettings: () => void;
  onPracticeSituation?: (situationId: number) => void;
}

export const WatchListenStage: React.FC<Props> = ({
  situation,
  onNextStage,
  playbackSpeed,
  onSpeedChange,
  pauseSeconds,
  onPauseSecondsChange,
  onOpenVoiceSettings,
  onPracticeSituation,
}) => {
  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showMarathi, setShowMarathi] = useState<boolean>(true);
  const [listenedIds, setListenedIds] = useState<Set<number>>(new Set());
  const [convActiveState, setConvActiveState] = useState<boolean>(false);

  // Keep module-level isConversationActive synchronized
  isConversationActive = convActiveState;

  // 4-Second Pause State between continuous conversation lines
  const [pauseCountdown, setPauseCountdown] = useState<number | null>(null);
  const [justCompletedLineText, setJustCompletedLineText] = useState<string>('');

  const isPlayingRef = useRef<boolean>(false);
  const currentIndexRef = useRef<number>(0);
  const dialogListRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pauseTimerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transitionTimeoutRef = useRef<any>(null);

  const clearAllTimers = () => {
    if (pauseTimerRef.current) {
      clearInterval(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setPauseCountdown(null);
  };

  // Stop speaking & clear timers when component unmounts or situation changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentUtterance) currentUtterance = null;
    isPlayingRef.current = false;
    setIsPlaying(false);
    isConversationActive = false;
    setConvActiveState(false);
    stopSpeaking();
    clearAllTimers();
    setActiveLineId(null);
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (currentUtterance) currentUtterance = null;
      isPlayingRef.current = false;
      isConversationActive = false;
      stopSpeaking();
      clearAllTimers();
    };
  }, [situation.id]);

  // Stop conversation immediately and stay at current line (don't scroll to top)
  const stopConversation = (keepPosition = true) => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentUtterance) currentUtterance = null;
    isConversationActive = false;
    setConvActiveState(false);
    setActiveLineId(null);
    clearAllTimers();
    if (!keepPosition) {
      currentIndexRef.current = 0;
    }
  };

  // Stop single dialogue line
  const handleStopLine = (_lineId: number) => {
    stopConversation(true);
  };

  const handlePlayLine = (line: DialogLine) => {
    // 2. When user clicks ANY new conversation / dialogue button, FIRST cancel previous audio:
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stops all TTS immediately
    }
    if (currentUtterance) currentUtterance = null;
    clearAllTimers();

    isPlayingRef.current = false;
    setIsPlaying(false);
    isConversationActive = true;
    setConvActiveState(true);
    setActiveLineId(line.id);
    setListenedIds((prev) => new Set([...prev, line.id]));
    onPracticeSituation?.(situation.id);

    const lineIdx = situation.dialogs.findIndex((d) => d.id === line.id);
    if (lineIdx >= 0) {
      currentIndexRef.current = lineIdx;
    }

    speakText(line.text, {
      who: line.who,
      rate: playbackSpeed,
      onStart: () => {
        setActiveLineId(line.id);
      },
      onEnd: () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (currentUtterance) currentUtterance = null;
        isConversationActive = false;
        setConvActiveState(false);
        setActiveLineId(null);
      },
      onError: () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (currentUtterance) currentUtterance = null;
        isConversationActive = false;
        setConvActiveState(false);
        setActiveLineId(null);
      },
    });
  };

  const playDialogueOneByOne = (index: number) => {
    clearAllTimers();

    if (!isPlayingRef.current) {
      return;
    }

    if (index >= situation.dialogs.length) {
      // Completed full conversation
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (currentUtterance) currentUtterance = null;
      isConversationActive = false;
      setConvActiveState(false);
      isPlayingRef.current = false;
      setIsPlaying(false);
      setActiveLineId(null);
      currentIndexRef.current = 0;
      return;
    }

    const currentLine = situation.dialogs[index];
    currentIndexRef.current = index;
    setActiveLineId(currentLine.id);
    setListenedIds((prev) => new Set([...prev, currentLine.id]));

    // Scroll line into view without jumping to top
    const element = document.getElementById(`dialog-line-${currentLine.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    isConversationActive = true;
    setConvActiveState(true);

    speakText(currentLine.text, {
      who: currentLine.who,
      rate: playbackSpeed,
      onStart: () => {
        if (!isPlayingRef.current) return;
        setActiveLineId(currentLine.id);
      },
      onEnd: () => {
        if (!isPlayingRef.current) {
          return;
        }

        setActiveLineId(null);
        setJustCompletedLineText(currentLine.text);

        const nextIndex = index + 1;
        if (nextIndex >= situation.dialogs.length) {
          stopConversation(false);
          return;
        }

        // Apply requested pause (e.g. 4 seconds) after each conversation line
        const waitTime = pauseSeconds;
        if (waitTime > 0) {
          let countdown = waitTime;
          setPauseCountdown(countdown);

          pauseTimerRef.current = setInterval(() => {
            if (!isPlayingRef.current) {
              clearAllTimers();
              return;
            }
            countdown -= 1;
            if (countdown <= 0) {
              clearAllTimers();
              playDialogueOneByOne(nextIndex);
            } else {
              setPauseCountdown(countdown);
            }
          }, 1000);
        } else {
          transitionTimeoutRef.current = setTimeout(() => {
            if (!isPlayingRef.current) return;
            playDialogueOneByOne(nextIndex);
          }, 300);
        }
      },
      onError: () => {
        if (!isPlayingRef.current) return;
        stopConversation(true);
      },
    });
  };

  const handleSkipPause = () => {
    if (pauseTimerRef.current && isPlayingRef.current) {
      clearAllTimers();
      const nextIndex = currentIndexRef.current + 1;
      playDialogueOneByOne(nextIndex);
    }
  };

  // 1. Change "Play Full Conversation" button to Toggle:
  // - When NOT playing: Show "▶ Play Full Conversation"
  // - When playing: Show "⏹ Stop Conversation" in RED color
  const handleTogglePlayAll = () => {
    if (isPlaying) {
      // On Stop click (same button):
      // isPlaying = false
      // window.speechSynthesis.cancel() IMMEDIATELY
      // Stop at current line where it is playing
      stopConversation(true);
    } else {
      // On Play click:
      // isPlaying = true
      // speechSynthesis.cancel()
      // Play dialogue one by one
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (currentUtterance) currentUtterance = null;
      clearAllTimers();

      isPlayingRef.current = true;
      setIsPlaying(true);
      isConversationActive = true;
      setConvActiveState(true);

      const startIndex =
        currentIndexRef.current >= 0 && currentIndexRef.current < situation.dialogs.length
          ? currentIndexRef.current
          : 0;

      playDialogueOneByOne(startIndex);
    }
  };

  const progressPercent = Math.round(
    (listenedIds.size / situation.dialogs.length) * 100
  );

  return (
    <div className="space-y-4">
      {/* 1. Main Controls Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="playAllBtn"
            onClick={handleTogglePlayAll}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 ring-2 ring-red-300 ring-offset-1'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
            }`}
            title={isPlaying ? 'Stop conversation immediately' : 'Play full conversation one by one'}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>⏹ Stop Conversation</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>▶ Play Full Conversation</span>
              </>
            )}
          </button>

          {/* Voice Speed Controller Quick Bar */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <Gauge className="w-3.5 h-3.5 text-blue-600 ml-1" />
            <span className="text-[11px] font-bold text-slate-600 mr-0.5">Speed:</span>
            {[0.6, 0.85, 1.0, 1.2].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  Math.abs(playbackSpeed - s) < 0.04
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                }`}
                title={`Set speed to ${s}x`}
              >
                {s === 0.85 ? '🇮🇳 0.85x' : `${s}x`}
              </button>
            ))}
          </div>

          {/* Pause Settings Pill */}
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-900">
            <Hourglass className="w-3.5 h-3.5 text-amber-600" />
            <span>Pause: {pauseSeconds}s</span>
          </div>

          {/* Open Detailed Voice & Accent Settings Modal */}
          <button
            onClick={onOpenVoiceSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
            title="Adjust Voice Speed, 4s Pause & Real Indian Accent"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Voice Settings</span>
          </button>
        </div>

        {/* Translation & Progress */}
        <div className="flex items-center gap-3">
          <button
            id="marathiToggleBtn"
            onClick={() => setShowMarathi(!showMarathi)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showMarathi
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle Marathi translations"
          >
            <Languages className="w-3.5 h-3.5 text-amber-600" />
            <span>{showMarathi ? 'मराठी अर्थ: चालू' : 'मराठी अर्थ: बंद'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Listened:</span>
            <span className="font-bold text-blue-600">
              {listenedIds.size}/{situation.dialogs.length}
            </span>
            <div className="w-14 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive 4-Second Shadowing/Repeating Countdown Banner */}
      {pauseCountdown !== null && (
        <div className="bg-linear-to-r from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 p-3.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-xs animate-bounce">
              {pauseCountdown}s
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-1.5">
                <span>⏸️ 4-Second Shadowing Pause: Repeat aloud in English!</span>
              </p>
              <p className="text-xs text-amber-800 line-clamp-1 italic">
                &ldquo;{justCompletedLineText}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="w-24 sm:w-32 bg-amber-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${((pauseSeconds - pauseCountdown + 1) / pauseSeconds) * 100}%` }}
              ></div>
            </div>
            <button
              onClick={handleSkipPause}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 shadow-2xs transition-colors"
            >
              <span>Next Turn</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Dialog thread */}
      <div ref={dialogListRef} className="space-y-3" id="dialogThread">
        {situation.dialogs.map((line, idx) => {
          const isTeacher = line.who === 'teacher';
          const isActive = activeLineId === line.id;
          const isHeard = listenedIds.has(line.id);

          return (
            <div
              key={line.id}
              id={`dialog-line-${line.id}`}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-300 border ${
                isActive
                  ? isTeacher
                    ? 'bg-blue-50/95 border-blue-400 shadow-md ring-2 ring-blue-300/60 scale-[1.01]'
                    : 'bg-pink-50/95 border-pink-400 shadow-md ring-2 ring-pink-300/60 scale-[1.01]'
                  : isTeacher
                  ? 'bg-white border-blue-100 hover:border-blue-200'
                  : 'bg-white border-pink-100 hover:border-pink-200'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Speaker Avatar */}
                {isTeacher ? (
                  <TeacherAvatar size="md" speaking={isActive} />
                ) : (
                  <RiyaAvatar size="md" speaking={isActive} />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold tracking-wide uppercase ${
                          isTeacher ? 'text-blue-700' : 'text-pink-700'
                        }`}
                      >
                        {isTeacher ? '👩‍🏫 Teacher Anjali' : '👧 Riya'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        🇮🇳 Indian Accent
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    <button
                      id={`listen-btn-${line.id}`}
                      onClick={() => {
                        if (isActive) {
                          handleStopLine(line.id);
                        } else {
                          handlePlayLine(line);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs animate-pulse ring-2 ring-red-300'
                          : isHeard
                          ? 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                      title={
                        isActive
                          ? 'Stop playing this line (speechSynthesis.cancel)'
                          : 'Play this dialogue line'
                      }
                    >
                      {isActive ? (
                        <>
                          <Square className="w-3 h-3 fill-current text-white" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* English line bubble */}
                  <p
                    className={`text-sm sm:text-base leading-relaxed font-medium transition-colors ${
                      isActive
                        ? isTeacher
                          ? 'text-blue-950 font-semibold'
                          : 'text-pink-950 font-semibold'
                        : 'text-slate-800'
                    }`}
                  >
                    {line.text}
                  </p>

                  {/* Marathi translation */}
                  {showMarathi && (
                    <div className="mt-2 text-xs sm:text-sm text-slate-600 bg-amber-50/70 py-1.5 px-2.5 rounded-lg border border-amber-200/50 flex items-start gap-1.5">
                      <span className="text-amber-700 font-bold shrink-0">मराठी अर्थ:</span>
                      <span>{line.marathi || line.hindi}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage complete footer action */}
      <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-slate-700 text-sm">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
          <span>
            Listened to the full conversation? Test your vocabulary and spelling in Stage 2!
          </span>
        </div>

        <button
          id="proceedToStage2Btn"
          onClick={onNextStage}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span>2. Write &amp; Vocab</span>
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
