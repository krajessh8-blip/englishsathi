import React, { useState, useEffect, useRef } from 'react';
import { Situation, RolePlayScriptStep } from '../types';
import { TeacherAvatar, RiyaAvatar } from './CharacterAvatars';
import { speakText, isSpeechRecognitionSupported, createSpeechRecognizer } from '../utils/speech';
import { Mic, MicOff, Send, Sparkles, RotateCcw, Volume2, Lightbulb, Bot, Check, VolumeX } from 'lucide-react';

let currentUtterance: SpeechSynthesisUtterance | null = null;
let isConversationActive = false;

interface ChatMessage {
  id: string;
  sender: 'teacher' | 'riya';
  text: string;
  marathi?: string;
  hindi?: string;
  tip?: string;
}

interface Props {
  situation: Situation;
  onScoreEarned: (points: number) => void;
  totalScore: number;
  playbackSpeed?: number;
}

export const RolePlayStage: React.FC<Props> = ({
  situation,
  onScoreEarned,
  playbackSpeed = 0.85,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState<boolean>(false);
  const [autoSpeakTeacher, setAutoSpeakTeacher] = useState<boolean>(true);
  const [recentBonus, setRecentBonus] = useState<number | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);

  const currentStep: RolePlayScriptStep | undefined =
    situation.roleplaySteps[currentStepIndex] || situation.roleplaySteps[0];

  // Initialize roleplay conversation when situation changes
  useEffect(() => {
    resetRolePlay();
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (currentUtterance) currentUtterance = null;
      isConversationActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [situation.id]);

  // 3. Also in your startConversation() function first line: window.speechSynthesis.cancel();
  const startConversation = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentUtterance) currentUtterance = null;
    isConversationActive = true;
    resetRolePlay();
  };

  const resetRolePlay = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentUtterance) currentUtterance = null;
    isConversationActive = false;

    const firstStep = situation.roleplaySteps[0];
    const initialMsg: ChatMessage = {
      id: 'init-teacher',
      sender: 'teacher',
      text: firstStep?.teacherPrompt || situation.dialogs[0]?.text || 'Hello Riya! Let us begin our conversation.',
      marathi: firstStep?.teacherMarathi || situation.dialogs[0]?.marathi || firstStep?.teacherHindi || situation.dialogs[0]?.hindi,
    };
    setMessages([initialMsg]);
    setCurrentStepIndex(0);
    setInputText('');
    setIsCompleted(false);
    setRecentBonus(null);

    if (autoSpeakTeacher) {
      speakTeacherLine(initialMsg.text);
    }
  };

  const speakTeacherLine = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentUtterance) currentUtterance = null;
    isConversationActive = true;
    setIsTeacherSpeaking(true);

    speakText(text, {
      who: 'teacher',
      rate: playbackSpeed,
      onStart: () => {
        isConversationActive = true;
        setIsTeacherSpeaking(true);
      },
      onEnd: () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (currentUtterance) currentUtterance = null;
        isConversationActive = false;
        setIsTeacherSpeaking(false);
      },
      onError: () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (currentUtterance) currentUtterance = null;
        isConversationActive = false;
        setIsTeacherSpeaking(false);
      },
    });
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoadingAi]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // Add Riya's reply to chat
    const riyaMsg: ChatMessage = {
      id: `riya-${Date.now()}`,
      sender: 'riya',
      text: text,
    };

    const updatedMessages = [...messages, riyaMsg];
    setMessages(updatedMessages);
    setInputText('');
    setSpeechError(null);

    // Award roleplay points
    const points = 10;
    onScoreEarned(points);
    setRecentBonus(points);
    setTimeout(() => setRecentBonus(null), 3000);

    const nextStepIdx = currentStepIndex + 1;
    const hasNextScriptStep = nextStepIdx < situation.roleplaySteps.length;

    // Try AI response or fallback to situation roleplay script
    setIsLoadingAi(true);

    try {
      const response = await fetch('/api/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situationTitle: situation.title,
          level: situation.group,
          messages: updatedMessages.map((m) => ({ role: m.sender, text: m.text })),
          studentInput: text,
        }),
      });

      const data = await response.json();

      if (data && data.success && data.teacherReply && !data.fallback) {
        // AI Teacher response
        const teacherMsg: ChatMessage = {
          id: `teacher-${Date.now()}`,
          sender: 'teacher',
          text: data.teacherReply,
          marathi: data.teacherMarathi,
          tip: data.tip,
        };
        setMessages((prev) => [...prev, teacherMsg]);
        if (autoSpeakTeacher) speakTeacherLine(teacherMsg.text);

        if (hasNextScriptStep) {
          setCurrentStepIndex(nextStepIdx);
        } else {
          setIsCompleted(true);
        }
      } else {
        // Fallback to curriculum scripted role-play
        deliverCurriculumStep(nextStepIdx, updatedMessages);
      }
    } catch {
      // Fallback
      deliverCurriculumStep(nextStepIdx, updatedMessages);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const deliverCurriculumStep = (nextIdx: number, _currMessages: ChatMessage[]) => {
    setTimeout(() => {
      if (nextIdx < situation.roleplaySteps.length) {
        const nextStep = situation.roleplaySteps[nextIdx];
        const teacherMsg: ChatMessage = {
          id: `teacher-${Date.now()}`,
          sender: 'teacher',
          text: nextStep.teacherPrompt,
          marathi: nextStep.teacherMarathi || nextStep.teacherHindi,
          tip: currentStep?.encouragement || 'Very well spoken, Riya!',
        };
        setMessages((prev) => [...prev, teacherMsg]);
        setCurrentStepIndex(nextIdx);
        if (autoSpeakTeacher) speakTeacherLine(teacherMsg.text);
      } else {
        // Wrap up
        const finalMsg: ChatMessage = {
          id: `teacher-${Date.now()}`,
          sender: 'teacher',
          text: 'Splendid work, Riya! You completed this conversation with high confidence and politeness.',
          marathi: 'उत्कृष्ट काम, रिया! तू हे संभाषण पूर्ण आत्मविश्वास आणि नम्रतेने पूर्ण केलेस.',
          tip: 'Congratulations! You mastered this situation’s dialogue practice.',
        };
        setMessages((prev) => [...prev, finalMsg]);
        setIsCompleted(true);
        if (autoSpeakTeacher) speakTeacherLine(finalMsg.text);
      }
    }, 600);
  };

  // Voice recording toggle using Web Speech API
  const handleToggleVoice = () => {
    if (isRecording) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Microphone speech recognition is not supported in this browser. Please type your reply.');
      return;
    }

    setSpeechError(null);
    setIsRecording(true);

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      () => {
        setIsRecording(false);
      },
      (error) => {
        setIsRecording(false);
        if (error !== 'no-speech') {
          setSpeechError(`Voice input: ${error}. Try speaking clearly or typing.`);
        }
      }
    );

    recognizerRef.current = recognizer;
    if (recognizer) {
      try {
        recognizer.start();
      } catch (err) {
        console.error(err);
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Roleplay Container Card */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-blue-400 p-4 sm:p-6 shadow-sm">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎭</span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Role Play — You are Riya
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Teacher Anjali will ask or prompt, you reply as Riya in English.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto speak teacher toggle */}
            <button
              onClick={() => setAutoSpeakTeacher(!autoSpeakTeacher)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                autoSpeakTeacher
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Toggle automatic teacher audio speech"
            >
              {autoSpeakTeacher ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{autoSpeakTeacher ? 'Teacher Voice On' : 'Muted'}</span>
            </button>

            {/* Restart button */}
            <button
              onClick={resetRolePlay}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Restart Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Star Score Celebration popup */}
        {recentBonus && (
          <div className="my-2 p-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-center font-extrabold text-sm sm:text-base animate-bounce flex items-center justify-center gap-2 shadow-xs">
            <span>⭐</span>
            <span>+{recentBonus} points for speaking English! Keep it up!</span>
          </div>
        )}

        {/* Chat Conversation Thread */}
        <div
          ref={chatContainerRef}
          id="roleChat"
          className="my-4 h-80 sm:h-96 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar p-2 bg-slate-50/50 rounded-xl border border-slate-100"
        >
          {messages.map((m) => {
            const isTeacher = m.sender === 'teacher';

            return (
              <div
                key={m.id}
                className={`flex gap-3 items-start ${
                  isTeacher ? 'justify-start' : 'justify-end flex-row-reverse'
                }`}
              >
                {/* Character avatar */}
                {isTeacher ? (
                  <TeacherAvatar size="md" speaking={isTeacherSpeaking} />
                ) : (
                  <RiyaAvatar size="md" />
                )}

                <div className={`max-w-[85%] sm:max-w-[75%]`}>
                  <div
                    className={`text-[11px] font-bold mb-1 flex items-center gap-1.5 ${
                      isTeacher ? 'text-blue-700' : 'text-pink-700 justify-end'
                    }`}
                  >
                    <span>{isTeacher ? '👩‍🏫 Teacher Anjali' : '👧 Riya (You)'}</span>
                    {isTeacher && (
                      <button
                        disabled={isConversationActive}
                        onClick={() => speakTeacherLine(m.text)}
                        className="text-blue-500 hover:text-blue-700 p-0.5 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Listen to Teacher"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Speech bubble */}
                  <div
                    className={`p-3 sm:p-3.5 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                      isTeacher
                        ? 'bg-blue-50/90 text-slate-800 border border-blue-200 rounded-tl-xs'
                        : 'bg-blue-600 text-white border border-blue-600 rounded-tr-xs'
                    }`}
                  >
                    <p className="font-medium">{m.text}</p>

                    {/* Marathi translation on teacher prompt */}
                    {isTeacher && (m.marathi || m.hindi) && (
                      <p className="mt-1 text-xs text-blue-900/80 pt-1 border-t border-blue-200/50">
                        <span className="font-bold text-amber-800">मराठी अर्थ: </span>
                        {m.marathi || m.hindi}
                      </p>
                    )}

                    {/* English tip/feedback */}
                    {m.tip && (
                      <div className="mt-2 p-1.5 bg-emerald-100/90 text-emerald-950 rounded-lg text-xs flex items-center gap-1 border border-emerald-300/60 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{m.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading AI feedback indicator */}
          {isLoadingAi && (
            <div className="flex gap-2.5 items-center text-xs text-blue-600 italic pl-12">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Teacher Anjali is listening and formulating feedback...</span>
            </div>
          )}
        </div>

        {/* Suggested Riya replies (scaffolding help for learners) */}
        {!isCompleted && currentStep?.suggestedRiyaReplies && currentStep.suggestedRiyaReplies.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Suggested reply hints (Click to fill):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentStep.suggestedRiyaReplies.map((hint, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(hint)}
                  className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-900 rounded-xl text-xs border border-pink-200 text-left transition-all line-clamp-1"
                  title="Click to use this reply"
                >
                  &ldquo;{hint}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mb-2 p-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs">
            {speechError}
          </div>
        )}

        {/* Input and Action Controls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="roleInput"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                isRecording
                  ? '🎙️ Listening... speak in English now'
                  : 'Type your reply as Riya...'
              }
              className={`flex-1 px-4 py-2.5 rounded-xl border-2 text-sm sm:text-base outline-hidden transition-all ${
                isRecording
                  ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-300'
                  : 'border-slate-200 focus:border-blue-500 bg-white'
              }`}
            />

            {/* Send Button */}
            <button
              id="sendReplyBtn"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Voice Input Button (Speak Instead) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              id="voiceReplyBtn"
              onClick={handleToggleVoice}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-300 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Listening... Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>🎤 Speak Instead (Voice Input)</span>
                </>
              )}
            </button>

            {isCompleted && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Conversation Complete! ⭐ +30 bonus points earned</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
