import React, { useState } from 'react';
import { AchievementBadge } from '../../types';
import { ALL_BADGES, isBadgeUnlocked, getBadgeProgress } from '../../data/badges';
import { calculateStudentGrammarSummary } from '../../data/grammar/grammarManager';
import {
  Trophy,
  Award,
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  Star,
  GraduationCap,
  Volume2,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  completedCount: number;
  totalScore: number;
  completedGrammarLevels?: number[];
  studentId?: string;
  onPreviewCelebration: (badge: AchievementBadge) => void;
}

export const BadgesGalleryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  completedCount,
  totalScore,
  completedGrammarLevels = [],
  studentId = 'std-101',
  onPreviewCelebration,
}) => {
  const [filter, setFilter] = useState<'all' | 'milestone' | 'mastery' | 'grammar'>('all');

  if (!isOpen) return null;

  const unlockedCount = ALL_BADGES.filter((b) =>
    isBadgeUnlocked(b, completedCount, totalScore, completedGrammarLevels)
  ).length;

  const filteredBadges = ALL_BADGES.filter((b) => {
    if (filter === 'all') return true;
    return b.category === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shadow-xs">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Student Achievement Badges &amp; Milestones
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                  {unlockedCount}/{ALL_BADGES.length} Unlocked
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                Smart English Sathi • Spoken Situations &amp; 10-Level Grammar Badges
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Navigation */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({ALL_BADGES.length})
            </button>
            <button
              onClick={() => setFilter('milestone')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'milestone'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Milestones (Situations)
            </button>
            <button
              onClick={() => setFilter('mastery')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'mastery'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mastery &amp; Points
            </button>
            <button
              onClick={() => setFilter('grammar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                filter === 'grammar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 hover:text-indigo-900'
              }`}
            >
              <span>📖 Grammar (10 Levels)</span>
              {completedGrammarLevels.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filter === 'grammar' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-900'
                }`}>
                  {completedGrammarLevels.length}/10
                </span>
              )}
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Earn badges upon completing <strong>100% of topics</strong> in your level!
          </span>
        </div>

        {/* Badges Grid */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-3 w-full box-border">
          <div className="grid grid-cols-2 gap-2.5 w-full box-border">
            {filteredBadges.map((badge) => {
              const isUnlocked = isBadgeUnlocked(badge, completedCount, totalScore, completedGrammarLevels);
              
              let progress = getBadgeProgress(badge, completedCount, totalScore);
              if (badge.category === 'grammar' && badge.targetGrammarLevel !== undefined) {
                const gSum = calculateStudentGrammarSummary(studentId, badge.targetGrammarLevel);
                progress = {
                  current: gSum.completedTopicsCount,
                  max: gSum.totalTopicsCount,
                  percent: gSum.overallProgressPercent,
                };
              }

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? badge.category === 'grammar'
                        ? 'bg-indigo-50/40 border-indigo-300 shadow-xs'
                        : 'bg-amber-50/40 border-amber-300 shadow-xs'
                      : 'bg-white border-slate-200 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl p-2 rounded-2xl bg-white border border-slate-200 shadow-2xs shrink-0">
                          {badge.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900">
                              {badge.title}
                            </h4>
                            {badge.category === 'grammar' && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                Level {badge.targetGrammarLevel}
                              </span>
                            )}
                            {isUnlocked ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Unlocked ✓
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                In Progress
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-bold ${badge.category === 'grammar' ? 'text-indigo-700' : 'text-amber-700'}`}>
                            {badge.marathiTitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-[11px] font-black shrink-0">
                        <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                        <span>+{badge.xpReward} XP</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {badge.description}
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      "{badge.marathiDesc}"
                    </p>
                  </div>

                  {/* Progress or unlock button */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex-1 mr-3">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>
                          {badge.category === 'grammar'
                            ? `Level ${badge.targetGrammarLevel} Topics: ${progress.current}/${progress.max}`
                            : badge.targetSituations
                            ? `Situations: ${progress.current}/${progress.max}`
                            : `Score: ${progress.current}/${progress.max} pts`}
                        </span>
                        <span>{progress.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isUnlocked
                              ? badge.category === 'grammar'
                                ? 'bg-indigo-600'
                                : 'bg-emerald-500'
                              : badge.category === 'grammar'
                              ? 'bg-indigo-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => onPreviewCelebration(badge)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 shrink-0 cursor-pointer ${
                        isUnlocked
                          ? 'bg-amber-200 hover:bg-amber-300 text-amber-950'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{isUnlocked ? 'Celebrate 🎉' : 'Preview Target'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Master Level 4 for <strong>Tense Master</strong> and complete Level 10 to earn <strong>Grammar Guru</strong>!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold transition-colors cursor-pointer"
          >
            Close Gallery
          </button>
        </div>
      </div>
    </div>
  );
};
