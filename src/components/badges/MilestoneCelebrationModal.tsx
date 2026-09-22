import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AchievementBadge } from '../../types';
import { Award, Sparkles, X, CheckCircle2, Share2, Star } from 'lucide-react';

interface Props {
  badge: AchievementBadge | null;
  isOpen: boolean;
  onClose: () => void;
  completedCount: number;
}

export const MilestoneCelebrationModal: React.FC<Props> = ({
  badge,
  isOpen,
  onClose,
  completedCount,
}) => {
  useEffect(() => {
    if (isOpen && badge) {
      // Fire festive fireworks confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isOpen, badge]);

  if (!isOpen || !badge) return null;

  const isGrand20 = badge.targetSituations === 20;
  const isMilestone10 = badge.targetSituations === 10;
  const isMilestone5 = badge.targetSituations === 5;
  const isGrammar = badge.category === 'grammar';
  const isTenseMaster = badge.id === 'badge-grammar-lvl-4' || badge.title === 'Tense Master';
  const isGrammarGuru = badge.id === 'badge-grammar-lvl-10' || badge.title === 'Grammar Guru';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden text-center p-6 sm:p-8 animate-scale-up ${
        isGrammar ? 'border-4 border-indigo-400' : 'border-4 border-amber-300'
      }`}>
        {/* Decorative Top Accent Banner */}
        <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl opacity-60 pointer-events-none ${
          isGrammar ? 'bg-linear-to-br from-indigo-500 to-purple-300' : 'bg-linear-to-br from-amber-400 to-yellow-200'
        }`} />
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-linear-to-br from-blue-400 to-indigo-200 rounded-full blur-2xl opacity-60 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tag */}
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 ${
          isGrammar
            ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
            : 'bg-amber-100 text-amber-900 border border-amber-300'
        }`}>
          <Sparkles className={`w-3.5 h-3.5 ${isGrammar ? 'text-indigo-600 fill-indigo-500' : 'text-amber-600 fill-amber-500'}`} />
          <span>{isGrammar ? '📖 Grammar Mastery Badge Unlocked!' : 'Milestone Badge Unlocked!'}</span>
        </div>

        {/* Animated Badge Icon Container */}
        <div className="relative mx-auto my-3 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full animate-spin-slow opacity-80 blur-xs ${
            isGrammar ? 'bg-linear-to-tr from-indigo-500 via-purple-300 to-blue-500' : 'bg-linear-to-tr from-amber-400 via-yellow-200 to-amber-500'
          }`} />
          <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-xl flex items-center justify-center text-5xl sm:text-6xl ${
            isGrammar
              ? 'bg-linear-to-b from-indigo-50 to-indigo-200 border-4 border-indigo-400'
              : 'bg-linear-to-b from-amber-50 to-amber-200 border-4 border-amber-400'
          }`}>
            {badge.icon}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Badge Title & Marathi Subtitle */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
          {badge.title}
        </h3>
        <p className={`text-sm font-bold mt-0.5 ${isGrammar ? 'text-indigo-700' : 'text-amber-700'}`}>
          {badge.marathiTitle}
        </p>

        {/* Specific Milestone Callout */}
        <div className={`my-3 py-2 px-4 rounded-2xl border text-xs text-slate-700 ${
          isGrammar ? 'bg-indigo-50/80 border-indigo-200' : 'bg-amber-50/80 border-amber-200'
        }`}>
          <p className="font-semibold text-slate-800">{badge.description}</p>
          <p className="text-slate-500 text-[11px] mt-0.5 italic">{badge.marathiDesc}</p>
        </div>

        {/* XP Reward & Completion Tag */}
        <div className="flex items-center justify-center gap-3 my-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
            isGrammar
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            <Award className={`w-4 h-4 ${isGrammar ? 'text-indigo-600' : 'text-blue-600'}`} />
            <span>
              {isGrammar
                ? `Level ${badge.targetGrammarLevel || 1} • 100% Topics Mastered`
                : `${completedCount}/20 Situations Done`}
            </span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
            <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>+{badge.xpReward} XP Earned</span>
          </div>
        </div>

        {/* Teacher Anjali Encouragement Message */}
        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 text-left sm:text-center">
          🗣️ <span className="font-bold text-slate-800">Teacher Anjali:</span> "
          {isTenseMaster
            ? 'Outstanding achievement! You have mastered 100% of Level 4 topics and conquered English Tenses! Now your speech will have perfect timeline precision in past, present, and future!'
            : isGrammarGuru
            ? 'Magnificent milestone! You have attained the supreme title of Grammar Guru! Your mastery of high-level English grammar is an inspiration to our entire school!'
            : isGrammar
            ? `Sensational work! You completed 100% of the topics in Level ${badge.targetGrammarLevel || 1}! Every sentence you construct is becoming clearer and more confident!`
            : isGrand20
            ? 'Extraordinary! You have mastered all 20 situations in Smart English Sathi! Your spoken English confidence is magnificent!'
            : isMilestone10
            ? 'Halfway mark achieved! You can now express yourself in libraries, playgrounds, and science labs with ease!'
            : isMilestone5
            ? 'Fantastic start! You have successfully mastered your first 5 classroom conversations!'
            : 'Keep practicing every day with Riya to unlock the next milestone!'}
          "
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full mt-5 py-3 px-6 rounded-2xl text-white font-black text-sm tracking-wide shadow-md transition-all active:scale-98 ${
            isGrammar
              ? 'bg-linear-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
              : 'bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700'
          }`}
        >
          Collect Badge &amp; Continue Learning • पुढे चला
        </button>
      </div>
    </div>
  );
};
