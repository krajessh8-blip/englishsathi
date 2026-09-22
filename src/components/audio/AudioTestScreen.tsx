import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  Terminal,
  Tablet,
  FileCode,
  ArrowLeft,
  Copy,
  Check,
  Headphones,
} from 'lucide-react';
import {
  getDeviceInfo,
  isAudioUnlocked,
  unlockAudio,
  resetAudioUnlockState,
  getAudioLogs,
  logAudioEvent,
  AudioLogEntry,
  getGlobalAudioContext,
} from '../../utils/audioUnlocker';
import { playHowlerAudio, SAMPLE_AUDIO_BEEP_WAV } from '../../utils/howlerAudio';
import { speakText, stopSpeaking, getAvailableVoices } from '../../utils/speech';

interface Props {
  onBackToApp: () => void;
}

export const AudioTestScreen: React.FC<Props> = ({ onBackToApp }) => {
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const [unlocked, setUnlocked] = useState(isAudioUnlocked());
  const [logs, setLogs] = useState<AudioLogEntry[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refresh logs and state periodically
  useEffect(() => {
    const update = () => {
      setDeviceInfo(getDeviceInfo());
      setUnlocked(isAudioUnlocked());
      setLogs(getAudioLogs());
      setVoices(getAvailableVoices());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Test Web Audio API
  const handleTestWebAudio = async () => {
    setActiveTest('webaudio');
    logAudioEvent('info', 'Test:WebAudio', 'Testing Web Audio API tone generator (440Hz / 880Hz)...');
    try {
      const ctx = getGlobalAudioContext();
      if (!ctx) {
        throw new Error('Web Audio API not supported on this browser');
      }
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.45); // C6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);

      logAudioEvent('success', 'Test:WebAudio', 'Web Audio 4-note musical chord emitted successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logAudioEvent('error', 'Test:WebAudio', `Web Audio test failed: ${msg}`);
    } finally {
      setTimeout(() => setActiveTest(null), 800);
    }
  };

  // 2. Test HTML5 Audio
  const handleTestHtml5Audio = async () => {
    setActiveTest('html5');
    logAudioEvent('info', 'Test:HTML5', 'Testing standard HTML5 Audio element playback...');
    try {
      const audio = new Audio();
      audio.src = SAMPLE_AUDIO_BEEP_WAV;
      audio.volume = 0.8;

      audio.onplay = () => {
        logAudioEvent('success', 'Test:HTML5', 'HTML5 Audio event "onplay" fired');
      };
      audio.onended = () => {
        logAudioEvent('info', 'Test:HTML5', 'HTML5 Audio event "onended" fired');
      };
      audio.onerror = (e) => {
        logAudioEvent('error', 'Test:HTML5', `HTML5 Audio error: ${e}`);
      };

      await audio.play();
      logAudioEvent('success', 'Test:HTML5', 'HTML5 Audio play promise resolved!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logAudioEvent('error', 'Test:HTML5', `HTML5 Audio test error: ${msg}`);
    } finally {
      setTimeout(() => setActiveTest(null), 800);
    }
  };

  // 3. Test Howler.js
  const handleTestHowler = () => {
    setActiveTest('howler');
    logAudioEvent('info', 'Test:Howler', 'Testing Howler.js engine with html5: true & mediaSession...');
    try {
      playHowlerAudio(SAMPLE_AUDIO_BEEP_WAV, {
        volume: 0.85,
        onPlay: () => {
          logAudioEvent('success', 'Test:Howler', 'Howler.js sound started playing cleanly!');
        },
        onEnd: () => {
          logAudioEvent('info', 'Test:Howler', 'Howler.js sound finished playing.');
        },
        onError: (err) => {
          logAudioEvent('error', 'Test:Howler', `Howler.js error: ${err}`);
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logAudioEvent('error', 'Test:Howler', `Howler execution error: ${msg}`);
    } finally {
      setTimeout(() => setActiveTest(null), 800);
    }
  };

  // Extra: Test Indian English Speech Synthesis
  const handleTestSpeech = (who: 'teacher' | 'riya') => {
    setActiveTest(`speech-${who}`);
    const phrase =
      who === 'teacher'
        ? 'Namaste students! This is Teacher Anjali testing the Interactive Smart Board audio speakers.'
        : 'Hello Teacher! This is Riya. I can hear you clearly through the board audio!';

    logAudioEvent('info', 'Test:Speech', `Testing ${who} speech synthesis...`);

    speakText(phrase, {
      who,
      onStart: () => {
        logAudioEvent('success', 'Test:Speech', `${who} speech started speaking.`);
      },
      onEnd: () => {
        logAudioEvent('info', 'Test:Speech', `${who} speech finished speaking.`);
        setActiveTest(null);
      },
      onError: (err) => {
        logAudioEvent('error', 'Test:Speech', `Speech error: ${err}`);
        setActiveTest(null);
      },
    });
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const manifestSnippet = `<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />`;
  const javaSnippet = `webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
webView.getSettings().setJavaScriptEnabled(true);
webView.setWebChromeClient(new WebChromeClient());`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Return to App Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>🔊 Interactive Board Audio Test &amp; Diagnostic</span>
              </h1>
              <p className="text-xs text-slate-400">
                Live verification for Interactive Flat Panels (IFP), Android APK WebView, and Chrome desktop.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                await unlockAudio();
                setUnlocked(isAudioUnlocked());
                setDeviceInfo(getDeviceInfo());
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Force Unlock Audio</span>
            </button>
            <button
              onClick={() => {
                resetAudioUnlockState();
                setUnlocked(false);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* 3 Core Audio Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Test Web Audio API */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                  Engine 1
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/50 text-blue-300 border border-blue-700/50">
                  {deviceInfo.audioContextState}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Test Web Audio API</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Directly triggers low-latency oscillator nodes through AudioContext to verify synthesized audio output.
              </p>
            </div>

            <button
              onClick={handleTestWebAudio}
              disabled={activeTest === 'webaudio'}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{activeTest === 'webaudio' ? 'Playing Chord...' : 'Play Web Audio Tone'}</span>
            </button>
          </div>

          {/* 2. Test HTML5 Audio */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Engine 2
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">
                  HTML5 Audio
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Test HTML5 Audio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tests standard browser <code className="text-emerald-300">new Audio()</code> element playback with auto-play gesture permission.
              </p>
            </div>

            <button
              onClick={handleTestHtml5Audio}
              disabled={activeTest === 'html5'}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{activeTest === 'html5' ? 'Playing Audio...' : 'Play HTML5 Sound'}</span>
            </button>
          </div>

          {/* 3. Test Howler.js */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  Engine 3 (IFP Recommended)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/50 text-amber-300 border border-amber-700/50">
                  Howler v2.2
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Test Howler.js</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plays using Howler.js configured with <code className="text-amber-300">html5: true</code>, media session audio focus, and error fallback.
              </p>
            </div>

            <button
              onClick={handleTestHowler}
              disabled={activeTest === 'howler'}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{activeTest === 'howler' ? 'Playing Howl...' : 'Play Howler Sound'}</span>
            </button>
          </div>
        </div>

        {/* Extra Speech Synthesis Test Bar */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl shrink-0">
              🗣️
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Spoken English Speech Synthesis (Indian Voices)</h4>
              <p className="text-xs text-slate-400">
                {voices.length} system voice engines available • Teacher Anjali &amp; Student Riya speech test
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleTestSpeech('teacher')}
              disabled={activeTest?.startsWith('speech')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Test Teacher Anjali</span>
            </button>
            <button
              onClick={() => handleTestSpeech('riya')}
              disabled={activeTest?.startsWith('speech')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Test Riya</span>
            </button>
            <button
              onClick={stopSpeaking}
              className="px-2.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold"
            >
              Stop
            </button>
          </div>
        </div>

        {/* System & Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Telemetry Status Card */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Tablet className="w-4 h-4 text-blue-400" />
              <span>Interactive Board Telemetry</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                <span className="text-slate-400">Audio Unlocked Status:</span>
                <span
                  className={`font-black px-2.5 py-0.5 rounded-full ${
                    unlocked
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600'
                      : 'bg-red-900/60 text-red-300 border border-red-600'
                  }`}
                >
                  {unlocked ? 'YES (UNLOCKED)' : 'NO (BLOCKED / WAITING GESTURE)'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                <span className="text-slate-400">Interactive Flat Panel (IFP) Detected:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    deviceInfo.isIFP ? 'bg-blue-900/50 text-blue-300' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {deviceInfo.isIFP ? 'YES (IFP / Android Smart Board)' : 'Desktop / Standard Browser'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                <span className="text-slate-400">Web Audio Context State:</span>
                <span className="font-mono text-emerald-400 font-bold">{deviceInfo.audioContextState}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                <span className="text-slate-400">Touch Points Available:</span>
                <span className="font-mono text-slate-200">{deviceInfo.touchPoints} multi-touch points</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                <span className="text-slate-400">Display Resolution:</span>
                <span className="font-mono text-slate-200">{deviceInfo.resolution}</span>
              </div>

              <div className="flex justify-between items-start py-1.5">
                <span className="text-slate-400 shrink-0">User Agent:</span>
                <span className="font-mono text-[10px] text-slate-300 text-right max-w-[280px] break-all">
                  {deviceInfo.userAgent}
                </span>
              </div>
            </div>
          </div>

          {/* Android APK & WebView Configuration Guide */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Android APK / WebView Fix Guide</span>
            </h3>

            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                If building an APK or running within a custom Android WebView wrapper on the Interactive Board:
              </p>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] text-slate-300">1. AndroidManifest.xml</span>
                  <button
                    onClick={() => handleCopy(manifestSnippet, 'manifest')}
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === 'manifest' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'manifest' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {manifestSnippet}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] text-slate-300">2. MainActivity.java / Kotlin</span>
                  <button
                    onClick={() => handleCopy(javaSnippet, 'java')}
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === 'java' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'java' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-950 text-sky-400 font-mono text-[11px] overflow-x-auto border border-slate-800 whitespace-pre-wrap">
                  {javaSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Live Audio Event Logs Terminal */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-300">Real-Time Audio Event Logs</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{logs.length} logged events</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 font-mono text-xs pr-2">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic py-4 text-center">No audio events logged yet. Tap one of the test buttons above.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 py-0.5">
                  <span className="text-slate-600 text-[10px] shrink-0">{log.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                      log.type === 'success'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : log.type === 'error'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : log.type === 'warning'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}
                  >
                    {log.source}
                  </span>
                  <span
                    className={`break-all ${
                      log.type === 'success'
                        ? 'text-emerald-300'
                        : log.type === 'error'
                        ? 'text-red-300'
                        : log.type === 'warning'
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
