import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, CheckCircle2, MonitorCheck, Wrench } from 'lucide-react';
import { unlockAudio, isAudioUnlocked, isIFPDevice, getDeviceInfo } from '../../utils/audioUnlocker';
import { playChimeSound } from '../../utils/howlerAudio';

interface Props {
  onUnlocked: () => void;
  onOpenAudioTest?: () => void;
  forceShow?: boolean;
}

export const AudioUnlockOverlay: React.FC<Props> = ({
  onUnlocked,
  onOpenAudioTest,
  forceShow = false,
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [unlocking, setUnlocking] = useState<boolean>(false);
  const [justUnlocked, setJustUnlocked] = useState<boolean>(false);
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof getDeviceInfo> | null>(null);

  useEffect(() => {
    const isIFP = isIFPDevice();
    const alreadyUnlocked = isAudioUnlocked();
    setDeviceInfo(getDeviceInfo());

    // If IFP, always show on app/session start unless forceShow is false and already unlocked in current session
    if (forceShow || (!alreadyUnlocked || isIFP)) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [forceShow]);

  const handleTapToUnlock = async () => {
    if (unlocking || justUnlocked) return;
    setUnlocking(true);

    try {
      // 1. Critical IFP WebView audio unlock
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }

      // 2. HTML5 Audio unlock
      const a = new Audio();
      a.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      a.volume = 0.01;
      a.play().catch(() => {});

      // 3. Complete system unlock through unified helper
      await unlockAudio();

      // Play soft feedback chime
      try {
        playChimeSound();
      } catch {}

      setJustUnlocked(true);

      // Smooth exit transition
      setTimeout(() => {
        setVisible(false);
        onUnlocked();
      }, 450);
    } catch (err) {
      console.error('Tap to unlock error:', err);
      // Still proceed
      setVisible(false);
      onUnlocked();
    } finally {
      setUnlocking(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      id="audio-unlock-overlay"
      onClick={handleTapToUnlock}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl text-white select-none cursor-pointer transition-opacity duration-300 animate-fadeIn"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
      </div>

      <div className="relative max-w-2xl w-full flex flex-col items-center text-center space-y-8 z-10">
        {/* Device Detection Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 shadow-inner">
          <MonitorCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {deviceInfo?.isIFP ? 'Smart Interactive Board (IFP) Detected' : 'Interactive Classroom Audio Ready'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Big Animated Speaker Icon */}
        <div className="relative group">
          <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full bg-linear-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-1.5 shadow-2xl shadow-blue-500/30 flex items-center justify-center transform transition-transform group-hover:scale-105 active:scale-95">
            <div className="w-full h-full rounded-full bg-slate-900/90 flex flex-col items-center justify-center border-2 border-white/20">
              {justUnlocked ? (
                <CheckCircle2 className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-400 animate-bounce" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <Volume2 className="w-20 h-20 sm:w-24 sm:h-24 text-blue-400 animate-pulse" />
                  <span className="absolute -top-1 -right-1 text-3xl animate-bounce">✨</span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute -inset-2 rounded-full bg-blue-500/20 animate-ping pointer-events-none" />
        </div>

        {/* Primary Call to Action */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-white to-emerald-300 drop-shadow-md">
            🔊 TAP ANYWHERE TO ENABLE SOUND
          </h2>
          <p className="text-base sm:text-xl font-bold text-amber-300">
            आवाज सुरू करण्यासाठी स्क्रीनवर कुठेही स्पर्श करा
          </p>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Android APK WebView and Interactive Smart Boards require a single initial touch to activate spoken English pronunciation, Teacher Anjali&apos;s voice, and lesson sounds.
          </p>
        </div>

        {/* Tap Action Button */}
        <div className="w-full max-w-md pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTapToUnlock();
            }}
            disabled={unlocking}
            className="w-full py-4 px-8 rounded-2xl bg-linear-to-r from-blue-500 via-indigo-600 to-emerald-600 text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-500/25 border border-white/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {unlocking ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Activating Sound Engine...</span>
              </span>
            ) : justUnlocked ? (
              <span className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                <span>Audio Activated! Loading...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-300" />
                <span>TAP TO START AUDIO</span>
              </span>
            )}
          </button>
        </div>

        {/* Bottom utility links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-4 border-t border-slate-800 w-full">
          <span>Board Resolution: {deviceInfo?.resolution || '1920x1080'}</span>
          <span>•</span>
          {onOpenAudioTest && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTapToUnlock();
                onOpenAudioTest();
              }}
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Open Audio Test &amp; Diagnostic Screen (/audio-test)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
