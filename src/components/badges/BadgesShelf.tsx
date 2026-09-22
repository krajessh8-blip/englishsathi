import React, { useState } from 'react';
import { AchievementBadge, DailyStreakData } from '../../types';
import { ALL_BADGES, isBadgeUnlocked, getBadgeProgress, getNextMilestone } from '../../data/badges';
import {
  Award,
  Trophy,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  Info,
  Flame,
  Star,
  BookOpen,
} from 'lucide-react';

interface Props {
  completedCount: number;
  totalScore: number;
  completedGrammarLevels?: number[];
  onOpenGallery: () => void;
  onSelectBadge: (badge: AchievementBadge) => void;
  streak?: DailyStreakData;
  onOpenStreakModal?: () => void;
}

export const BadgesShelf: React.FC<Props> = ({
  completedCount,
  totalScore,
  completedGrammarLevels = [],
  onOpenGallery,
  onSelectBadge,
  streak,
  onOpenStreakModal,
}) => {
  const [shelfTab, setShelfTab] = useState<'all' | 'situations' | 'grammar'>('all');
  const nextMilestone = getNextMilestone(completedCount);
  const unlockedBadges = ALL_BADGES.filter((b) =>
    isBadgeUnlocked(b, completedCount, totalScore, completedGrammarLevels)
  );

  const displayedBadges = ALL_BADGES.filter((b) => {
    if (shelfTab === 'all') return true;
    if (shelfTab === 'situations') return b.category === 'milestone' || b.category === 'mastery';
    if (shelfTab === 'grammar') return b.category === 'grammar';
    return true;
  });

  const getBadgeStyle = (badge: AchievementBadge, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return 'bg-slate-100/80 border-slate-200 text-slate-400 opacity-75';
    }

    switch (badge.colorScheme) {
      case 'gold':
        return 'bg-linear-to-b from-amber-100 via-yellow-50 to-amber-200 border-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-300';
      case 'silver':
        return 'bg-linear-to-b from-slate-100 via-white to-slate-200 border-slate-300 text-slate-900 shadow-xs ring-1 ring-slate-200';
      case 'emerald':
        return 'bg-linear-to-b from-emerald-100 via-emerald-50 to-teal-100 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-300';
      case 'purple':
        return 'bg-linear-to-b from-purple-100 via-indigo-50 to-purple-200 border-purple-400 text-purple-950 shadow-xs ring-1 ring-purple-300';
      case 'indigo':
        return 'bg-linear-to-b from-indigo-100 via-indigo-50 to-purple-100 border-indigo-400 text-indigo-950 shadow-xs ring-1 ring-indigo-300';
      case 'blue':
        return 'bg-linear-to-b from-blue-100 via-sky-50 to-blue-200 border-blue-400 text-blue-950 shadow-xs ring-1 ring-blue-300';
      case 'bronze':
      default:
        return 'bg-linear-to-b from-orange-100 via-amber-50 to-orange-200 border-orange-300 text-orange-950 shadow-xs ring-1 ring-orange-200';
    }
  };

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200">
      {/* Header section with next milestone prompt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
            🏅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Milestones &amp; Grammar Badges
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                {unlockedBadges.length} / {ALL_BADGES.length} Unlocked
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Earn badges for completing spoken situations and 100% of topics in each grammar level!
            </p>
          </div>
        </div>

        {/* Milestone Next Target Pill, Streak, Score & View All Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {streak && (
            <button
              onClick={onOpenStreakModal}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                streak.practicedToday
                  ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-2xs hover:brightness-105'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200'
              }`}
              title={
                streak.practicedToday
                  ? `Daily Streak: ${streak.currentStreak} days! You practiced today.`
                  : `Daily Streak: ${streak.currentStreak} days! Practice today to keep it burning.`
              }
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  streak.practicedToday
                    ? 'text-yellow-200 fill-yellow-200 animate-pulse'
                    : 'text-orange-500 fill-orange-400'
                }`}
              />
              <span>{streak.currentStreak} Days Streak</span>
            </button>
          )}

          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-black"
            title="Total Student Score Points"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>{totalScore} pts</span>
          </div>

          {nextMilestone.remaining > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                Next Goal: {nextMilestone.remaining} more for{' '}
                <strong className="text-blue-700">{nextMilestone.badge?.title}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-black">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              <span>All Situations Completed! 🎓</span>
            </div>
          )}

          <button
            onClick={onOpenGallery}
            className="text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>All Badges ({ALL_BADGES.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Toggle Tabs */}
      <div className="flex items-center justify-between gap-2 mb-3 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setShelfTab('all')}
            className={`px-3 py-1 rounded-lg transition ${
              shelfTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Badges ({ALL_BADGES.length})
          </button>
          <button
            type="button"
            onClick={() => setShelfTab('situations')}
            className={`px-3 py-1 rounded-lg transition ${
              shelfTab === 'situations'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Spoken Situations (8)
          </button>
          <button
            type="button"
            onClick={() => setShelfTab('grammar')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
              shelfTab === 'grammar'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-indigo-700 hover:text-indigo-900'
            }`}
          >
            <span>📖 Grammar Levels (10)</span>
            {completedGrammarLevels.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                shelfTab === 'grammar' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-900'
              }`}>
                {completedGrammarLevels.length}/10
              </span>
            )}
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
          {shelfTab === 'grammar'
            ? 'Complete 100% of topics in a level to earn its badge (e.g. Tense Master, Grammar Guru)'
            : 'Click any badge to view criteria and details'}
        </span>
      </div>

      {/* Progress Bar towards Next Milestone (if on all or situations) */}
      {shelfTab !== 'grammar' && nextMilestone.badge && nextMilestone.remaining > 0 && (
        <div className="mb-3.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
            <span>
              Milestone Progress: <strong>{completedCount}</strong> of{' '}
              <strong>{nextMilestone.target}</strong> situations
            </span>
            <span className="font-bold text-blue-600">
              {Math.round((completedCount / nextMilestone.target) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-linear-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((completedCount / nextMilestone.target) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Badge Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {displayedBadges.map((badge) => {
          const isUnlocked = isBadgeUnlocked(badge, completedCount, totalScore, completedGrammarLevels);
          const progress = getBadgeProgress(badge, completedCount, totalScore);

          return (
            <div
              key={badge.id}
              onClick={() => onSelectBadge(badge)}
              className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-between text-center relative group ${getBadgeStyle(
                badge,
                isUnlocked
              )}`}
              title={`${badge.title} - ${badge.description}`}
            >
              {/* Unlocked / Locked status indicator */}
              <div className="absolute top-1.5 right-1.5">
                {isUnlocked ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-400" />
                )}
              </div>

              {/* Badge Icon */}
              <div className="text-2xl sm:text-3xl my-1 transition-transform group-hover:scale-110">
                {badge.icon}
              </div>

              {/* Title */}
              <div className="w-full">
                <h4 className="text-[11px] font-bold line-clamp-1 text-slate-900">
                  {badge.title}
                </h4>
                <p className="text-[9px] text-slate-500 line-clamp-1 font-medium">
                  {badge.category === 'grammar' ? `Level ${badge.targetGrammarLevel}` : badge.marathiTitle}
                </p>
              </div>

              {/* Footnote / status */}
              <div className="mt-1.5 pt-1 w-full border-t border-black/5 text-[9px] font-bold">
                {isUnlocked ? (
                  <span className="text-emerald-700 font-extrabold uppercase tracking-wide">
                    Unlocked!
                  </span>
                ) : badge.category === 'grammar' ? (
                  <span className="text-indigo-600 font-semibold">
                    100% of L{badge.targetGrammarLevel}
                  </span>
                ) : (
                  <span className="text-slate-500 font-mono">
                    {progress.current}/{progress.max}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
