import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  HelpCircle,
  PenTool,
  RotateCcw,
  Languages,
  Award,
} from 'lucide-react';
import { GrammarTopic, GrammarProgressRecord, AchievementBadge } from '../../types';
import { speakText, stopSpeaking } from '../../utils/speech';
import { evaluateGrammarSpeech, GrammarEvaluationResult } from '../../utils/grammarEvaluator';
import { recordGrammarTopicProgress, isGrammarLevelFullyCompleted } from '../../data/grammar/grammarManager';

interface GrammarTopicModalProps {
  topic: GrammarTopic;
  studentId: string;
  initialStep?: number; // 1 to 8
  onClose: () => void;
  onCompleted?: (record: GrammarProgressRecord) => void;
  onNextTopic?: () => void;
  onBadgeUnlocked?: (badge: AchievementBadge) => void;
}

export const GrammarTopicModal: React.FC<GrammarTopicModalProps> = ({
  topic,
  studentId,
  initialStep = 1,
  onClose,
  onCompleted,
  onNextTopic,
  onBadgeUnlocked,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [langSupport, setLangSupport] = useState<'mr' | 'hi' | 'none'>('mr');
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<AchievementBadge | null>(null);

  // Step 3: Listen state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);

  // Step 4 & 5: Speaking & AI Correction
  const [spokenText, setSpokenText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [evaluation, setEvaluation] = useState<GrammarEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Step 6: Writing practice state
  const [writingAnswers, setWritingAnswers] = useState<Record<number, string>>({});
  const [writingSubmitted, setWritingSubmitted] = useState(false);
  const [writingScore, setWritingScore] = useState(100);

  // Step 7: Quiz state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Completed record
  const [savedRecord, setSavedRecord] = useState<GrammarProgressRecord | null>(null);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Set up Web Speech API if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenText(transcript);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          setIsListening(false);
        }
      } else {
        // Fallback: populate with suggested template if browser has no mic API
        setSpokenText(topic.speaking_practice.suggestedAnswer);
      }
    }
  };

  // Trigger audio playback for explanation or example
  const handlePlayAudio = (text: string, idx?: number) => {
    stopSpeaking();
    setIsPlayingAudio(true);
    if (typeof idx === 'number') setActiveSentenceIndex(idx);

    speakText(text, {
      who: 'teacher',
      rate: 0.9,
      onEnd: () => {
        setIsPlayingAudio(false);
        setActiveSentenceIndex(null);
      },
      onError: () => {
        setIsPlayingAudio(false);
        setActiveSentenceIndex(null);
      },
    });
  };

  // Submit speaking for AI evaluation
  const handleEvaluateSpeaking = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const result = evaluateGrammarSpeech(spokenText, topic);
      setEvaluation(result);
      setIsEvaluating(false);
      setCurrentStep(5); // Go to Step 5: Correct
    }, 450);
  };

  // Check writing answers
  const handleCheckWriting = () => {
    let correctCount = 0;
    topic.writing_practice.forEach((ex) => {
      if (writingAnswers[ex.id]?.trim().toLowerCase() === ex.correctAnswer.trim().toLowerCase()) {
        correctCount++;
      }
    });
    const calculatedScore = topic.writing_practice.length > 0 ? Math.round((correctCount / topic.writing_practice.length) * 100) : 100;
    setWritingScore(calculatedScore);
    setWritingSubmitted(true);
  };

  // Check quiz answers
  const handleCheckQuiz = () => {
    let correctCount = 0;
    topic.quiz.forEach((q) => {
      if (selectedQuizAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    const calculatedScore = topic.quiz.length > 0 ? Math.round((correctCount / topic.quiz.length) * 100) : 100;
    setQuizScore(calculatedScore);
    setQuizSubmitted(true);
  };

  // Complete lesson on Step 8
  const handleFinishTopic = () => {
    const spScore = evaluation?.score ?? 88;
    const wrScore = writingScore;
    const qzScore = quizScore || 85;
    const overallAcc = Math.round((spScore + wrScore + qzScore + 100) / 4);

    const record = recordGrammarTopicProgress({
      student_id: studentId,
      grammar_topic_id: topic.id,
      completed: true,
      listening_score: 100,
      speaking_score: spScore,
      writing_score: wrScore,
      quiz_score: qzScore,
      accuracy: overallAcc,
    });

    setSavedRecord(record);
    if (onCompleted) onCompleted(record);

    // Check if student has now reached 100% completion for this level
    const levelStatus = isGrammarLevelFullyCompleted(studentId, topic.level_id);
    if (levelStatus.isCompleted && levelStatus.badge) {
      setNewlyUnlockedBadge(levelStatus.badge);
      if (onBadgeUnlocked) {
        onBadgeUnlocked(levelStatus.badge);
      }
    }

    setCurrentStep(8);
  };

  const stepsList = [
    { num: 1, label: 'Learn', icon: '📖' },
    { num: 2, label: 'Understand', icon: '💡' },
    { num: 3, label: 'Listen', icon: '▶' },
    { num: 4, label: 'Speak', icon: '🗣' },
    { num: 5, label: 'Correct', icon: '✨' },
    { num: 6, label: 'Write', icon: '✍️' },
    { num: 7, label: 'Quiz', icon: '❓' },
    { num: 8, label: 'Progress', icon: '🏆' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl font-bold shadow-inner">
              📖
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/40 text-blue-100 border border-blue-400/30">
                  Topic {topic.topic_number} • Level {topic.level_id}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{topic.title_en}</h2>
              <p className="text-xs text-blue-200">
                {langSupport === 'mr' ? topic.title_mr : topic.title_hi || topic.title_mr}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Support Switcher */}
            <div className="flex items-center bg-blue-900/60 rounded-lg p-0.5 border border-blue-500/40 text-xs">
              <button
                type="button"
                onClick={() => setLangSupport('mr')}
                className={`px-2 py-1 rounded font-medium transition ${
                  langSupport === 'mr' ? 'bg-amber-400 text-slate-900 font-bold' : 'text-blue-200 hover:text-white'
                }`}
                title="मराठी सहाय्य"
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setLangSupport('hi')}
                className={`px-2 py-1 rounded font-medium transition ${
                  langSupport === 'hi' ? 'bg-amber-400 text-slate-900 font-bold' : 'text-blue-200 hover:text-white'
                }`}
                title="हिंदी सहायता"
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLangSupport('none')}
                className={`px-2 py-1 rounded font-medium transition ${
                  langSupport === 'none' ? 'bg-white/20 text-white' : 'text-blue-200 hover:text-white'
                }`}
                title="English only"
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-blue-200 hover:bg-white/10 hover:text-white transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar & Step Percentage */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800 flex items-center gap-1">
                <span>Step {currentStep} of 8</span>
                <span className="text-slate-400">•</span>
                <span className="text-blue-700">{stepsList.find((s) => s.num === currentStep)?.label}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                ({stepsList.find((s) => s.num === currentStep)?.icon})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-blue-700">{Math.round((currentStep / 8) * 100)}%</span>
              <span className="text-[11px] text-slate-500 font-medium">Completed</span>
            </div>
          </div>

          {/* Linear Visual Progress Line */}
          <div className="relative w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-300 shadow-2xs"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* 8-Step Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 py-2 overflow-x-auto gap-1.5 scrollbar-thin">
          {stepsList.map((st) => {
            const isActive = currentStep === st.num;
            const isDone = currentStep > st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <span>{st.icon}</span>
                <span>{st.label}</span>
                {isDone && <span className="text-emerald-600 ml-0.5 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* STEP 1: LEARN */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Step 1: Simple Concept
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">What is {topic.title_en}?</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(topic.explanation_en)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>{isPlayingAudio ? 'Listening...' : 'Listen Teacher Anjali'}</span>
                  </button>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-white border border-blue-200/70 shadow-xs">
                  <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
                    {topic.explanation_en}
                  </p>
                </div>

                {langSupport === 'mr' && topic.explanation_mr && (
                  <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-sm">
                    <p className="font-semibold text-amber-900 flex items-center gap-1.5 mb-1">
                      <span>🇮🇳</span>
                      <span>मराठी स्पष्टीकरण (Simple Marathi Help):</span>
                    </p>
                    <p className="leading-relaxed">{topic.explanation_mr}</p>
                  </div>
                )}

                {langSupport === 'hi' && topic.explanation_hi && (
                  <div className="mt-3 p-3.5 rounded-xl bg-orange-50/80 border border-orange-200 text-orange-950 text-sm">
                    <p className="font-semibold text-orange-900 flex items-center gap-1.5 mb-1">
                      <span>🇮🇳</span>
                      <span>हिंदी व्याख्या (Hindi Support):</span>
                    </p>
                    <p className="leading-relaxed">{topic.explanation_hi}</p>
                  </div>
                )}
              </div>

              {/* Quick Teaser Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Key Purpose</div>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    Speak naturally without pausing or hesitating on grammar forms.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Teacher Note</div>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    Listen to Teacher Anjali's Indian English pronunciation and repeat aloud!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: UNDERSTAND */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Step 2: Concrete Examples & Patterns
                </span>
                <h3 className="text-lg font-bold text-slate-900">How to use {topic.title_en} in sentences</h3>
              </div>

              <div className="space-y-3">
                {topic.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-blue-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold uppercase ${
                            ex.type === 'positive'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ex.type === 'negative'
                              ? 'bg-rose-100 text-rose-800'
                              : ex.type === 'question'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ex.type || 'Example'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(ex.sentence, idx)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Listen"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-base font-bold text-slate-900 mt-2">{ex.sentence}</p>

                    {langSupport === 'mr' && ex.marathi && (
                      <p className="text-xs text-slate-600 mt-1 font-medium">मराठी: {ex.marathi}</p>
                    )}
                    {langSupport === 'hi' && ex.hindi && (
                      <p className="text-xs text-slate-600 mt-1 font-medium">हिंदी: {ex.hindi}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Common Mistakes */}
              {topic.common_mistakes && topic.common_mistakes.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Watch Out! Common Grammar Mistake</span>
                  </div>
                  {topic.common_mistakes.map((cm, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <p className="text-rose-800 font-medium">
                        ❌ <span className="line-through">{cm.incorrect}</span>
                      </p>
                      <p className="text-emerald-800 font-bold">
                        ✅ <span>{cm.correct}</span>
                      </p>
                      <p className="text-slate-700 mt-1">Why? {cm.why}</p>
                      {langSupport === 'mr' && cm.marathiWhy && (
                        <p className="text-slate-600">मराठी: {cm.marathiWhy}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: LISTEN */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md mb-3">
                  <Volume2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Listen to Teacher Anjali</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  Listen carefully to the proper pronunciation and rhythm of sentences for {topic.title_en}.
                </p>

                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const allText =
                        topic.listen_sentences?.map((s) => s.en).join('. ') ||
                        topic.examples.map((e) => e.sentence).join('. ');
                      handlePlayAudio(allText);
                    }}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
                  >
                    <Volume2 className="h-5 w-5" />
                    <span>{isPlayingAudio ? 'Playing Lesson Audio...' : '▶ Listen Full Lesson Audio'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Listen & Repeat Sentences:
                </h4>
                {(topic.listen_sentences || topic.examples).map((item: any, idx) => {
                  const enText = item.en || item.sentence;
                  const mrText = item.mr || item.marathi;
                  const isCur = activeSentenceIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                        isCur
                          ? 'border-indigo-500 bg-indigo-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{enText}</p>
                        {langSupport === 'mr' && mrText && (
                          <p className="text-xs text-slate-500 mt-0.5">{mrText}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(enText, idx)}
                        className="flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: SPEAK */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Step 4: Interactive Speaking Practice
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  AI Speaking Prompt for {topic.title_en}
                </h3>
                <p className="text-sm font-semibold text-slate-800 mt-2 p-3 bg-white rounded-lg border border-blue-100 shadow-xs">
                  "{topic.speaking_practice.prompt}"
                </p>
                {langSupport === 'mr' && (
                  <p className="text-xs text-blue-900 font-medium mt-1">
                    मराठी सूचना: {topic.speaking_practice.marathiPrompt}
                  </p>
                )}
                {langSupport === 'hi' && topic.speaking_practice.hindiPrompt && (
                  <p className="text-xs text-blue-900 font-medium mt-1">
                    हिंदी निर्देश: {topic.speaking_practice.hindiPrompt}
                  </p>
                )}
              </div>

              {/* Hints Box */}
              {topic.speaking_practice.hints && topic.speaking_practice.hints.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-semibold text-slate-500">Vocabulary Hints:</span>
                  {topic.speaking_practice.hints.map((hint, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                      {hint}
                    </span>
                  ))}
                </div>
              )}

              {/* Speech Input Container */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Your Spoken English Sentence:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={spokenText}
                    onChange={(e) => setSpokenText(e.target.value)}
                    placeholder="Speak using microphone or type your sentence here..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    <span>{isListening ? 'Listening (Speak now)...' : '🎙 Tap to Speak'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpokenText(topic.speaking_practice.suggestedAnswer)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Use sample sentence
                  </button>

                  <button
                    type="button"
                    disabled={!spokenText.trim() || isEvaluating}
                    onClick={handleEvaluateSpeaking}
                    className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-40"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isEvaluating ? 'Evaluating...' : 'Check with AI Teacher ✨'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CORRECT (AI FEEDBACK) */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Step 5: Instant AI Grammar Correction
                </span>
                <h3 className="text-lg font-bold text-slate-900">Grammar & Speaking Analysis</h3>
              </div>

              {evaluation ? (
                <div className="space-y-4">
                  {/* Sentence Comparison Box */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Your sentence:
                      </span>
                      <p className="text-base font-semibold text-slate-800 mt-0.5">
                        "{evaluation.originalSentence}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        Better sentence:
                      </span>
                      <p className="text-base font-bold text-emerald-800 mt-0.5">
                        "{evaluation.betterSentence}"
                      </p>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(evaluation.betterSentence)}
                        className="mt-1 flex items-center space-x-1 text-xs text-blue-600 hover:underline"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Listen to better sentence</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 p-4 rounded-b-xl">
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Why?</span>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium">
                        {evaluation.whyExplanation}
                      </p>
                      {langSupport === 'mr' && evaluation.whyExplanationMr && (
                        <p className="text-xs text-slate-600 mt-1">मराठी: {evaluation.whyExplanationMr}</p>
                      )}
                    </div>
                  </div>

                  {/* Score breakdown metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                      <div className="text-xs text-slate-500 font-semibold">Overall</div>
                      <div className="text-xl font-black text-blue-600 mt-0.5">{evaluation.score}%</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                      <div className="text-xs text-slate-500 font-semibold">Tense</div>
                      <div className="text-xl font-black text-emerald-600 mt-0.5">{evaluation.tenseScore}%</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                      <div className="text-xs text-slate-500 font-semibold">Agreement</div>
                      <div className="text-xl font-black text-indigo-600 mt-0.5">
                        {evaluation.agreementScore}%
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                      <div className="text-xs text-slate-500 font-semibold">Word Order</div>
                      <div className="text-xl font-black text-amber-600 mt-0.5">{evaluation.wordOrderScore}%</div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                    >
                      <span>Continue to Writing Practice</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600">No speaking evaluation yet.</p>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Go to Step 4 (Speak)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: WRITE */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Step 6: Writing Practice
                </span>
                <h3 className="text-lg font-bold text-slate-900">Complete the sentences</h3>
              </div>

              <div className="space-y-4">
                {topic.writing_practice.map((ex) => {
                  const selectedVal = writingAnswers[ex.id] || '';
                  const isCorrect = selectedVal.trim().toLowerCase() === ex.correctAnswer.trim().toLowerCase();

                  return (
                    <div key={ex.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                      <p className="text-sm font-semibold text-slate-900">{ex.question}</p>

                      {/* Options */}
                      {ex.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ex.options.map((opt, oIdx) => {
                            const isChosen = selectedVal === opt;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => setWritingAnswers((prev) => ({ ...prev, [ex.id]: opt }))}
                                className={`p-2.5 rounded-lg text-xs font-medium text-left border transition ${
                                  isChosen
                                    ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Feedback if submitted */}
                      {writingSubmitted && (
                        <div
                          className={`p-2.5 rounded-lg text-xs font-medium ${
                            isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {isCorrect ? '✅ Correct! ' : `❌ Answer: ${ex.correctAnswer}. `}
                          <span>{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-2">
                  {!writingSubmitted ? (
                    <button
                      type="button"
                      onClick={handleCheckWriting}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                    >
                      Check Writing Answers
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-slate-700">Writing Score: {writingScore}%</span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(7)}
                        className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                      >
                        <span>Go to Quiz</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: QUIZ */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  Step 7: Interactive Quiz
                </span>
                <h3 className="text-lg font-bold text-slate-900">Check Your Knowledge</h3>
              </div>

              <div className="space-y-4">
                {topic.quiz.map((q) => {
                  const chosenIdx = selectedQuizAnswers[q.id];
                  const isCorrect = chosenIdx === q.correctIndex;

                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                      <p className="text-sm font-bold text-slate-900">{q.question}</p>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = chosenIdx === optIdx;
                          let btnStyle = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';

                          if (quizSubmitted) {
                            if (optIdx === q.correctIndex) {
                              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                            }
                          } else if (isSelected) {
                            btnStyle = 'border-blue-500 bg-blue-50 text-blue-900 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                if (!quizSubmitted) {
                                  setSelectedQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                }
                              }}
                              className={`w-full p-3 rounded-xl border text-xs text-left font-medium transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correctIndex && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-2">
                  {!quizSubmitted ? (
                    <button
                      type="button"
                      onClick={handleCheckQuiz}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinishTopic}
                      className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                    >
                      <span>Complete Topic & Save Progress</span>
                      <Award className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: PROGRESS */}
          {currentStep === 8 && (
            <div className="space-y-6 text-center py-4 animate-fadeIn">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                <Award className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Topic Completed! 🎉</h3>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  You successfully finished <span className="text-blue-600 font-bold">{topic.title_en}</span>.
                </p>
              </div>

              {/* Level 100% Milestone Badge Celebration Card */}
              {newlyUnlockedBadge && (
                <div className="max-w-md mx-auto rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 via-purple-50 to-white p-5 shadow-md text-center animate-in zoom-in-95 duration-200">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Level {topic.level_id} 100% Completed! • Badge Unlocked</span>
                  </div>
                  <div className="text-5xl my-2 animate-bounce">{newlyUnlockedBadge.icon}</div>
                  <h4 className="text-xl font-black text-slate-900">{newlyUnlockedBadge.title}</h4>
                  <p className="text-xs font-bold text-indigo-700">{newlyUnlockedBadge.marathiTitle}</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                    {newlyUnlockedBadge.description}
                  </p>
                  {onBadgeUnlocked && (
                    <button
                      type="button"
                      onClick={() => onBadgeUnlocked(newlyUnlockedBadge)}
                      className="mt-3.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Celebrate Badge with Teacher Anjali 🎉</span>
                    </button>
                  )}
                </div>
              )}

              {/* Score card */}
              <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xs grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Speaking</div>
                  <div className="text-lg font-bold text-blue-600 mt-0.5">
                    {evaluation?.score ?? 88}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Writing</div>
                  <div className="text-lg font-bold text-purple-600 mt-0.5">{writingScore}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Quiz</div>
                  <div className="text-lg font-bold text-amber-600 mt-0.5">{quizScore}%</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Back to Topics
                </button>

                {onNextTopic && (
                  <button
                    type="button"
                    onClick={onNextTopic}
                    className="flex items-center space-x-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    <span>Next Topic</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation bar */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="flex items-center space-x-1 font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          <span className="font-semibold text-slate-500">
            Step {currentStep} of 8: {stepsList[currentStep - 1]?.label}
          </span>

          <button
            type="button"
            disabled={currentStep === 8}
            onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
            className="flex items-center space-x-1 font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-30"
          >
            <span>Next</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
