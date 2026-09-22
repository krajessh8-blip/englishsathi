import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Trophy,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Flame,
  Star,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Target,
  Compass,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Level, Situation } from '../../types';
import { LEVELS } from '../../data/levels';
import { ALL_BADGES, getGrammarBadgeForLevel, isBadgeUnlocked } from '../../data/badges';
import {
  getStoredGrammarTopics,
  getStudentGrammarProgress,
  calculateStudentGrammarSummary,
  getStudentCompletedGrammarLevels,
} from '../../data/grammar/grammarManager';

interface VisualProgressRoadmapProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  onSelectLevel: (levelId: number) => void;
  completedSituationIds: Set<number>;
  publishedLessons: Situation[];
  totalScore: number;
  studentId: string;
  streakCount?: number;
  onNavigateToTab?: (tab: 'watch' | 'write' | 'roleplay' | 'grammar') => void;
}

export const VisualProgressRoadmap: React.FC<VisualProgressRoadmapProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onSelectLevel,
  completedSituationIds,
  publishedLessons,
  totalScore,
  studentId,
  streakCount = 1,
  onNavigateToTab,
}) => {
  const [activeView, setActiveView] = useState<'roadmap' | 'grammar' | 'situations'>('roadmap');

  // Completed grammar levels
  const completedGrammarLevels = useMemo(() => {
    return getStudentCompletedGrammarLevels(studentId);
  }, [studentId, isOpen]);

  // Overall grammar summary
  const grammarSummary = useMemo(() => {
    return calculateStudentGrammarSummary(studentId);
  }, [studentId, isOpen]);

  // All published grammar topics
  const allGrammarTopics = useMemo(() => {
    return getStoredGrammarTopics().filter((t) => t.status === 'published');
  }, [isOpen]);

  // Grammar progress records
  const grammarRecords = useMemo(() => {
    return getStudentGrammarProgress(studentId);
  }, [studentId, isOpen]);

  const grammarCompletedMap = useMemo(() => {
    const map = new Map<string, boolean>();
    grammarRecords.forEach((r) => {
      if (r.completed) map.set(r.grammar_topic_id, true);
    });
    return map;
  }, [grammarRecords]);

  // Computations for each of the 10 levels
  const levelStats = useMemo(() => {
    return LEVELS.map((lvl) => {
      // Situations in this level
      const sitsInLvl = publishedLessons.filter((s) => (s.level || 1) === lvl.id);
      const sitsCompletedCount = sitsInLvl.filter((s) => completedSituationIds.has(s.id)).length;
      const sitsTotal = sitsInLvl.length || 5;
      const sitsPercent = sitsTotal > 0 ? Math.round((sitsCompletedCount / sitsTotal) * 100) : 0;
      const isSitsDone = sitsTotal > 0 && sitsCompletedCount >= sitsTotal;

      // Grammar in this level
      const topicsInLvl = allGrammarTopics.filter((t) => t.level_id === lvl.id);
      const topicsCompletedCount = topicsInLvl.filter((t) => grammarCompletedMap.has(t.id)).length;
      const topicsTotal = topicsInLvl.length || 3;
      const topicsPercent = topicsTotal > 0 ? Math.round((topicsCompletedCount / topicsTotal) * 100) : 0;
      const isGrammarDone = topicsTotal > 0 && topicsCompletedCount >= topicsTotal;

      // Combined level percent
      const combinedPercent = Math.round((sitsPercent * 0.5) + (topicsPercent * 0.5));
      const isFullyMastered = isSitsDone && isGrammarDone;

      // Level badge
      const badge = getGrammarBadgeForLevel(lvl.id);
      const isBadgeEarned = completedGrammarLevels.includes(lvl.id);

      return {
        level: lvl,
        sitsCompletedCount,
        sitsTotal,
        sitsPercent,
        isSitsDone,
        topicsCompletedCount,
        topicsTotal,
        topicsPercent,
        isGrammarDone,
        combinedPercent,
        isFullyMastered,
        badge,
        isBadgeEarned,
      };
    });
  }, [publishedLessons, completedSituationIds, allGrammarTopics, grammarCompletedMap, completedGrammarLevels]);

  // Overall aggregates
  const totalSituationsCount = publishedLessons.length || 50;
  const completedSituationsCount = completedSituationIds.size;
  const situationsProgressPercent = Math.round((completedSituationsCount / totalSituationsCount) * 100);

  const totalGrammarCount = allGrammarTopics.length || 30;
  const completedGrammarCount = grammarSummary.completedTopicsCount;
  const grammarProgressPercent = grammarSummary.overallProgressPercent;

  const totalCurriculumMastery = Math.round(
    (situationsProgressPercent * 0.5) + (grammarProgressPercent * 0.5)
  );

  const unlockedBadgesCount = useMemo(() => {
    return ALL_BADGES.filter((b) =>
      isBadgeUnlocked(b, completedSituationsCount, totalScore, completedGrammarLevels)
    ).length;
  }, [completedSituationsCount, totalScore, completedGrammarLevels]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Top Header with Visual Metrics */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-5 sm:p-6 text-white shrink-0">
          {/* Subtle Decorative Background circles */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 font-bold text-xs">
                  <Compass className="w-3.5 h-3.5 mr-1" />
                  Visual Learning Journey • दृश्य प्रगती नकाशा
                </span>
                <span className="text-xs text-blue-200">Class 1 to 10 Mastery</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight mt-1.5 flex items-center gap-2">
                <span>Curriculum Mastery Pathway</span>
                <span className="text-2xl">🗺️</span>
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl mt-1 leading-relaxed">
                Track your visual progress across all 10 levels of spoken situations and grammar rules. Master every level to earn the title of <strong className="text-amber-300">Grammar Guru</strong>!
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Interactive Visual Progress Stat Rings/Cards */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {/* 1. Overall Mastery */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/15 flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#FBBF24"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * totalCurriculumMastery) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">{totalCurriculumMastery}%</span>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider">Total Mastery</div>
                <div className="text-sm font-black text-white truncate">Overall Progress</div>
              </div>
            </div>

            {/* 2. Conversational Situations */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/15 flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#34D399"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * situationsProgressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">{situationsProgressPercent}%</span>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider">Situations</div>
                <div className="text-sm font-black text-white truncate">{completedSituationsCount} / {totalSituationsCount}</div>
              </div>
            </div>

            {/* 3. Grammar Curriculum */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/15 flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#A78BFA"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * grammarProgressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">{grammarProgressPercent}%</span>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider">Grammar Topics</div>
                <div className="text-sm font-black text-white truncate">{completedGrammarCount} / {totalGrammarCount}</div>
              </div>
            </div>

            {/* 4. Badges & Streak */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/15 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black shadow-md shrink-0">
                🏆
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider">Milestones</div>
                <div className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{unlockedBadgesCount} / {ALL_BADGES.length}</span>
                  <span className="text-xs px-1.5 py-0.2 bg-amber-400/30 rounded text-amber-300 flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {streakCount}d
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6 py-2.5 gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveView('roadmap')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'roadmap'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>10-Level Visual Roadmap</span>
            </button>

            <button
              onClick={() => setActiveView('grammar')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'grammar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grammar Pathway ({completedGrammarCount}/{totalGrammarCount})</span>
            </button>

            <button
              onClick={() => setActiveView('situations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'situations'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Situations Pathway ({completedSituationsCount}/{totalSituationsCount})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-xs text-slate-500 font-medium">
            <span>Click any level node to practice immediately</span>
          </div>
        </div>

        {/* Scrollable Visual Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* VIEW 1: THE 10-LEVEL INTERACTIVE VISUAL ROADMAP */}
          {activeView === 'roadmap' && (
            <div className="space-y-6">
              {/* Visual Roadmap Stepper */}
              <div className="relative">
                {/* Connecting Background Line (Highway) */}
                <div className="hidden md:block absolute left-8 top-12 bottom-12 w-1.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-600 rounded-full" />

                <div className="space-y-4 relative">
                  {levelStats.map((stat, index) => {
                    const isSelected = stat.level.id === currentLevel;
                    const isCompleted = stat.combinedPercent === 100;
                    const hasStarted = stat.combinedPercent > 0;

                    return (
                      <motion.div
                        key={stat.level.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => {
                          onSelectLevel(stat.level.id);
                          onClose();
                        }}
                        className={`group relative rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-50 via-white to-blue-50/60 border-blue-600 shadow-md ring-2 ring-blue-400/30'
                            : isCompleted
                            ? 'bg-white border-emerald-300 hover:border-emerald-500 shadow-xs hover:shadow-md'
                            : hasStarted
                            ? 'bg-white border-indigo-200 hover:border-indigo-400 shadow-xs hover:shadow-md'
                            : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white opacity-85'
                        }`}
                      >
                        {/* Left: Node circle + Details */}
                        <div className="flex items-center gap-3.5">
                          {/* Circular Level Avatar / Progress Ring */}
                          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                            {/* SVG Ring */}
                            <svg className="w-14 h-14 transform -rotate-90">
                              <circle
                                cx="28"
                                cy="28"
                                r="23"
                                stroke="#E2E8F0"
                                strokeWidth="4.5"
                                fill="none"
                              />
                              <circle
                                cx="28"
                                cy="28"
                                r="23"
                                stroke={isCompleted ? '#10B981' : isSelected ? '#2563EB' : '#6366F1'}
                                strokeWidth="4.5"
                                fill="none"
                                strokeDasharray={144.5}
                                strokeDashoffset={144.5 - (144.5 * stat.combinedPercent) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-700"
                              />
                            </svg>

                            {/* Center Level Badge or Icon */}
                            <div
                              className={`absolute w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110 shadow-2xs ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white'
                                  : isSelected
                                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isCompleted ? '✓' : stat.level.id}
                            </div>
                          </div>

                          {/* Level Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isSelected
                                    ? 'bg-blue-100 text-blue-800 animate-pulse'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {isCompleted
                                  ? 'Level Mastered 🏆'
                                  : isSelected
                                  ? 'Current Level ⚡'
                                  : `Level ${stat.level.id}`}
                              </span>

                              <span className="text-[11px] font-bold text-slate-500">
                                {stat.level.class}
                              </span>

                              {stat.badge && (
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                                    stat.isBadgeEarned
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <span>{stat.badge.icon}</span>
                                  <span>{stat.badge.title}</span>
                                  {stat.isBadgeEarned && <span className="text-emerald-600">✓</span>}
                                </span>
                              )}
                            </div>

                            <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-1.5 group-hover:text-blue-600 transition">
                              <span>{stat.level.name}: {stat.level.subtitle}</span>
                            </h3>

                            <p className="text-xs text-slate-500 font-medium line-clamp-1">
                              {stat.level.description}
                            </p>
                          </div>
                        </div>

                        {/* Right: Dual Progress Bars (Situations + Grammar) */}
                        <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                          {/* Mini stats */}
                          <div className="flex items-center gap-4 text-xs">
                            {/* Situations */}
                            <div className="text-right">
                              <div className="text-[10px] uppercase font-bold text-slate-400">Situations</div>
                              <div className="font-black text-slate-800">
                                {stat.sitsCompletedCount}/{stat.sitsTotal}
                                <span className="text-[10px] text-slate-500 font-normal ml-1">({stat.sitsPercent}%)</span>
                              </div>
                              <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${stat.sitsPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Grammar Topics */}
                            <div className="text-right">
                              <div className="text-[10px] uppercase font-bold text-slate-400">Grammar</div>
                              <div className="font-black text-slate-800">
                                {stat.topicsCompletedCount}/{stat.topicsTotal}
                                <span className="text-[10px] text-slate-500 font-normal ml-1">({stat.topicsPercent}%)</span>
                              </div>
                              <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${stat.topicsPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Jump Action Button */}
                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white'
                            }`}
                          >
                            <span>Open</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: DETAILED GRAMMAR TOPICS PATHWAY */}
          {activeView === 'grammar' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-xs">
                    📖
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Grammar Curriculum Stepper</h3>
                    <p className="text-xs text-slate-600">
                      Total {totalGrammarCount} topics across 10 academic levels. Click to open any grammar topic.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-indigo-700">{grammarProgressPercent}%</span>
                  <div className="text-[11px] text-slate-500 font-bold">{completedGrammarCount} of {totalGrammarCount} Topics</div>
                </div>
              </div>

              {/* Grouped by Level */}
              <div className="space-y-4">
                {LEVELS.map((lvl) => {
                  const topicsInLvl = allGrammarTopics.filter((t) => t.level_id === lvl.id);
                  if (topicsInLvl.length === 0) return null;

                  const completedInLvl = topicsInLvl.filter((t) => grammarCompletedMap.has(t.id)).length;
                  const isLvlDone = completedInLvl === topicsInLvl.length;

                  return (
                    <div
                      key={lvl.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                              isLvlDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isLvlDone ? '✓' : lvl.id}
                          </span>
                          <h4 className="text-sm font-black text-slate-900">
                            Level {lvl.id}: {lvl.subtitle}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">({lvl.class})</span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isLvlDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {completedInLvl} / {topicsInLvl.length} Completed
                        </span>
                      </div>

                      {/* Topics Stepper Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {topicsInLvl.map((topic) => {
                          const record = grammarRecords.find((r) => r.grammar_topic_id === topic.id);
                          const isDone = record?.completed;

                          return (
                            <div
                              key={topic.id}
                              onClick={() => {
                                onSelectLevel(lvl.id);
                                if (onNavigateToTab) onNavigateToTab('grammar');
                                onClose();
                              }}
                              className={`p-3 rounded-xl border flex flex-col justify-between transition cursor-pointer hover:shadow-xs ${
                                isDone
                                  ? 'bg-emerald-50/50 border-emerald-300 text-slate-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-[10px] font-black uppercase text-indigo-700">
                                  #{topic.topic_number}
                                </span>
                                {isDone ? (
                                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{record?.accuracy || 100}%</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium">Pending</span>
                                )}
                              </div>

                              <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                                {topic.title_en}
                              </h5>
                              <p className="text-[10px] text-slate-500 line-clamp-1">
                                {topic.title_mr}
                              </p>

                              {/* Mini 8-step indicator */}
                              <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-slate-100">
                                {Array.from({ length: 8 }).map((_, stepIdx) => (
                                  <div
                                    key={stepIdx}
                                    className={`h-1 flex-1 rounded-full ${
                                      isDone ? 'bg-emerald-500' : 'bg-slate-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: CONVERSATIONAL SITUATIONS PATHWAY */}
          {activeView === 'situations' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-black shadow-xs">
                    💬
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Conversational Situations Stepper</h3>
                    <p className="text-xs text-slate-600">
                      50 interactive real-life dialogues across 10 levels. Click any situation to practice.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-700">{situationsProgressPercent}%</span>
                  <div className="text-[11px] text-slate-500 font-bold">{completedSituationsCount} of {totalSituationsCount} Situations</div>
                </div>
              </div>

              {/* Grouped by Level */}
              <div className="space-y-4">
                {LEVELS.map((lvl) => {
                  const sitsInLvl = publishedLessons.filter((s) => (s.level || 1) === lvl.id);
                  if (sitsInLvl.length === 0) return null;

                  const completedInLvl = sitsInLvl.filter((s) => completedSituationIds.has(s.id)).length;
                  const isLvlDone = completedInLvl === sitsInLvl.length;

                  return (
                    <div
                      key={lvl.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                              isLvlDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isLvlDone ? '✓' : lvl.id}
                          </span>
                          <h4 className="text-sm font-black text-slate-900">
                            Level {lvl.id}: {lvl.subtitle}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">({lvl.class})</span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isLvlDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {completedInLvl} / {sitsInLvl.length} Practiced
                        </span>
                      </div>

                      {/* Situations Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {sitsInLvl.map((sit) => {
                          const isDone = completedSituationIds.has(sit.id);

                          return (
                            <div
                              key={sit.id}
                              onClick={() => {
                                onSelectLevel(lvl.id);
                                if (onNavigateToTab) onNavigateToTab('watch');
                                onClose();
                              }}
                              className={`p-3 rounded-xl border flex flex-col justify-between transition cursor-pointer hover:shadow-xs ${
                                isDone
                                  ? 'bg-emerald-50/50 border-emerald-300 text-slate-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-[10px] font-black uppercase text-emerald-700">
                                  #{sit.id}
                                </span>
                                {isDone ? (
                                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Done</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium">Ready</span>
                                )}
                              </div>

                              <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                                {sit.title}
                              </h5>
                              <p className="text-[10px] text-slate-500 line-clamp-1">
                                {sit.marathi_title}
                              </p>

                              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
                                <span>{sit.char1_name} &amp; {sit.char2_name}</span>
                                <span className="text-emerald-600 font-bold">Practice →</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Current Focus:</span>
            <span className="font-bold text-slate-800">
              Level {currentLevel} • {LEVELS.find((l) => l.id === currentLevel)?.subtitle}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            Continue Learning
          </button>
        </div>
      </motion.div>
    </div>
  );
};
