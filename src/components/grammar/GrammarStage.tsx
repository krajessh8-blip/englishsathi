import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Volume2,
  Mic,
  PenTool,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Award,
  ChevronRight,
  Play,
  Check,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Level, GrammarTopic, GrammarProgressRecord, StudentGrammarSummary, AchievementBadge } from '../../types';
import { LEVELS } from '../../data/levels';
import { getGrammarBadgeForLevel } from '../../data/badges';
import {
  getTopicsForLevel,
  getStudentGrammarProgress,
  calculateStudentGrammarSummary,
} from '../../data/grammar/grammarManager';
import { GrammarTopicModal } from './GrammarTopicModal';
import { speakText, stopSpeaking } from '../../utils/speech';

interface GrammarStageProps {
  currentLevel: number;
  onSelectLevel: (levelId: number) => void;
  studentId: string;
  onBadgeUnlocked?: (badge: AchievementBadge) => void;
  onGrammarProgressUpdated?: () => void;
}

export const GrammarStage: React.FC<GrammarStageProps> = ({
  currentLevel,
  onSelectLevel,
  studentId,
  onBadgeUnlocked,
  onGrammarProgressUpdated,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [initialModalStep, setInitialModalStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'completed' | 'pending'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Active level metadata
  const activeLevel = useMemo(() => {
    return LEVELS.find((l) => l.id === currentLevel) || LEVELS[0];
  }, [currentLevel]);

  // Load topics for this level
  const topics = useMemo(() => {
    return getTopicsForLevel(currentLevel, true);
  }, [currentLevel, refreshTrigger]);

  // Load student progress for this student
  const progressRecords = useMemo(() => {
    return getStudentGrammarProgress(studentId);
  }, [studentId, refreshTrigger]);

  const completedMap = useMemo(() => {
    const map = new Map<string, GrammarProgressRecord>();
    progressRecords.forEach((r) => {
      map.set(r.grammar_topic_id, r);
    });
    return map;
  }, [progressRecords]);

  // Summary stats
  const summary: StudentGrammarSummary = useMemo(() => {
    return calculateStudentGrammarSummary(studentId, currentLevel);
  }, [studentId, currentLevel, refreshTrigger]);

  // Current level grammar badge
  const currentLevelBadge = useMemo(() => {
    return getGrammarBadgeForLevel(currentLevel);
  }, [currentLevel]);

  const isLevelBadgeEarned = useMemo(() => {
    return summary.totalTopicsCount > 0 && summary.completedTopicsCount >= summary.totalTopicsCount;
  }, [summary.totalTopicsCount, summary.completedTopicsCount]);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const isDone = completedMap.has(t.id) && completedMap.get(t.id)?.completed;
      if (filterMode === 'completed' && !isDone) return false;
      if (filterMode === 'pending' && isDone) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title_en.toLowerCase().includes(q);
        const matchMr = t.title_mr?.toLowerCase().includes(q);
        const matchHi = t.title_hi?.toLowerCase().includes(q);
        return matchTitle || matchMr || matchHi;
      }
      return true;
    });
  }, [topics, filterMode, searchQuery, completedMap]);

  const openTopicAtStep = (topic: GrammarTopic, step: number) => {
    setSelectedTopic(topic);
    setInitialModalStep(step);
  };

  const handleTopicCompleted = () => {
    setRefreshTrigger((prev) => prev + 1);
    if (onGrammarProgressUpdated) onGrammarProgressUpdated();
  };

  const handleNextTopic = () => {
    if (!selectedTopic) return;
    const curIdx = topics.findIndex((t) => t.id === selectedTopic.id);
    if (curIdx >= 0 && curIdx < topics.length - 1) {
      setSelectedTopic(topics[curIdx + 1]);
      setInitialModalStep(1);
    } else {
      setSelectedTopic(null);
    }
  };

  const playQuickAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    stopSpeaking();
    speakText(text, { who: 'teacher', rate: 0.9 });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Level Selection Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">
                📖
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Grammar Curriculum (10-Level Structure)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Level {activeLevel.id} — {activeLevel.subtitle}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Academic Standard: <span className="font-bold text-slate-700">{activeLevel.class}</span> • Category: <span className="font-bold text-slate-700">{activeLevel.subtitle}</span> • {topics.length} Interactive Topics
            </p>
          </div>

          {/* Quick Level Selector Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
            {LEVELS.map((lvl) => {
              const isSelected = lvl.id === currentLevel;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectLevel(lvl.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={`${lvl.name}: ${lvl.subtitle} (${lvl.class})`}
                >
                  L{lvl.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grammar Progress Metric Card (Section 19) */}
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-slate-500 font-semibold">Grammar Progress</div>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-2xl font-black text-blue-700">{summary.overallProgressPercent}%</span>
                <span className="text-xs text-slate-500">({summary.completedTopicsCount}/{summary.totalTopicsCount})</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${summary.overallProgressPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-semibold">Speaking Grammar</div>
              <div className="text-2xl font-black text-indigo-700 mt-0.5">
                {summary.speakingGrammarScore > 0 ? `${summary.speakingGrammarScore}%` : '—'}
              </div>
              <div className="text-xs text-slate-400 mt-1">AI voice evaluation</div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-semibold">Grammar Quiz</div>
              <div className="text-2xl font-black text-amber-600 mt-0.5">
                {summary.grammarQuizScore > 0 ? `${summary.grammarQuizScore}%` : '—'}
              </div>
              <div className="text-xs text-slate-400 mt-1">Knowledge checks</div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-semibold">Overall Accuracy</div>
              <div className="text-2xl font-black text-emerald-600 mt-0.5">
                {summary.accuracy > 0 ? `${summary.accuracy}%` : '—'}
              </div>
              <div className="text-xs text-slate-400 mt-1">Across 8 learning steps</div>
            </div>
          </div>

          {/* Strong vs Needs Practice Pills */}
          {(summary.strongTopics.length > 0 || summary.weakTopics.length > 0) && (
            <div className="mt-4 pt-3 border-t border-blue-200/60 flex flex-wrap items-center gap-4 text-xs">
              {summary.strongTopics.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-emerald-800">Strong:</span>
                  {summary.strongTopics.map((top, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 font-semibold">
                      {top}
                    </span>
                  ))}
                </div>
              )}
              {summary.weakTopics.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-amber-800">Needs Practice:</span>
                  {summary.weakTopics.map((top, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-800 font-semibold">
                      {top}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Grammar-Themed Level Milestone Badge Banner */}
          {currentLevelBadge && (
            <div
              className={`mt-4 pt-3.5 border-t border-blue-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all rounded-xl p-3 ${
                isLevelBadgeEarned
                  ? 'bg-gradient-to-r from-indigo-100/90 via-purple-100/70 to-amber-100/60 border border-indigo-300 shadow-xs'
                  : 'bg-white/80 border border-blue-100'
              }`}
            >
              <div className="flex items-center space-x-3.5 w-full sm:w-auto">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 transition-transform ${
                    isLevelBadgeEarned
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 scale-105 animate-pulse'
                      : 'bg-slate-100 text-slate-400 grayscale'
                  }`}
                >
                  {currentLevelBadge.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isLevelBadgeEarned
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isLevelBadgeEarned ? '✓ 100% Mastered • Badge Unlocked' : `Level ${currentLevel} Badge`}
                    </span>
                    <span className="text-xs font-bold text-slate-600">{currentLevelBadge.marathiTitle}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    {currentLevelBadge.title}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {isLevelBadgeEarned
                      ? `Congratulations! You mastered 100% of Level ${currentLevel} (${summary.completedTopicsCount}/${summary.totalTopicsCount} topics)!`
                      : `Complete all ${summary.totalTopicsCount} topics in this level to unlock this badge (${summary.completedTopicsCount}/${summary.totalTopicsCount} completed).`}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
                {isLevelBadgeEarned ? (
                  <button
                    type="button"
                    onClick={() => onBadgeUnlocked && onBadgeUnlocked(currentLevelBadge)}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Celebrate Badge</span>
                  </button>
                ) : (
                  <div className="text-right w-full sm:w-auto">
                    <div className="text-xs font-bold text-slate-600">
                      {summary.completedTopicsCount} / {summary.totalTopicsCount} Topics
                    </div>
                    <div className="w-full sm:w-32 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${summary.overallProgressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search grammar topic or concept..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterMode === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({topics.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('completed')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterMode === 'completed' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({summary.completedTopicsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('pending')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterMode === 'pending' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({topics.length - summary.completedTopicsCount})
            </button>
          </div>
        </div>
      </div>

      {/* Visual Topic Stepper / Pathway (Section 19 Visual Progress) */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
              ⚡
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Level {activeLevel.id} Topic Progression Pathway
            </h4>
          </div>
          <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-full">
            {summary.completedTopicsCount} of {topics.length} Mastered ({summary.overallProgressPercent}%)
          </span>
        </div>

        {/* Pathway Stepper Nodes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {topics.map((t, idx) => {
            const prog = completedMap.get(t.id);
            const isDone = prog?.completed;
            const isFirstIncomplete =
              !isDone && topics.slice(0, idx).every((prev) => completedMap.get(prev.id)?.completed);

            return (
              <React.Fragment key={t.id}>
                <button
                  type="button"
                  onClick={() => openTopicAtStep(t, 1)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 border cursor-pointer ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs hover:bg-emerald-100'
                      : isFirstIncomplete
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs animate-pulse hover:bg-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                  title={`${t.title_en} (${isDone ? 'Completed' : isFirstIncomplete ? 'Next to Learn' : 'Pending'})`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isFirstIncomplete
                        ? 'bg-white text-blue-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </span>
                  <span className="truncate max-w-[130px]">{t.title_en}</span>
                  {isDone && (
                    <span className="text-[10px] font-black bg-emerald-200/80 text-emerald-900 px-1.5 rounded">
                      {prog?.accuracy || 100}%
                    </span>
                  )}
                  {isFirstIncomplete && (
                    <span className="text-[9px] font-black uppercase bg-white/20 text-white px-1.5 rounded">
                      Next Up
                    </span>
                  )}
                </button>
                {idx < topics.length - 1 && (
                  <div
                    className={`w-3.5 h-0.5 shrink-0 rounded-full ${
                      isDone ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Grammar Topic Cards Grid (Section 15) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => {
          const progress = completedMap.get(topic.id);
          const isDone = progress?.completed;

          return (
            <div
              key={topic.id}
              onClick={() => openTopicAtStep(topic, 1)}
              className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 transition cursor-pointer ${
                isDone
                  ? 'border-emerald-300 hover:border-emerald-500 shadow-xs hover:shadow-md bg-gradient-to-b from-emerald-50/20 via-white to-white'
                  : 'border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                      #{topic.topic_number}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Level {topic.level_id}
                    </span>
                  </div>

                  {isDone ? (
                    <div className="flex items-center space-x-1.5">
                      {/* 3-Star Rating */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <Star
                          className={`w-3 h-3 ${
                            (progress?.accuracy || 0) >= 70
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                        <Star
                          className={`w-3 h-3 ${
                            (progress?.accuracy || 0) >= 85
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </div>
                      <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{progress?.accuracy || 100}%</span>
                      </span>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      Ready
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-blue-600 transition">
                  {topic.title_en}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  मराठी: {topic.title_mr}
                </p>

                <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                  {topic.explanation_en}
                </p>

                {/* Visual 8-Step Mini Progress Dots */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                    <span>8-Step Cycle</span>
                    <span className={isDone ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                      {isDone ? '8/8 Steps Complete' : 'Ready to Start'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {['Concept', 'Rules', 'Listen', 'Speak', 'Examples', 'Write', 'Quiz', 'Done'].map(
                      (stepName, stepIdx) => (
                        <div
                          key={stepIdx}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            isDone ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                          title={`Step ${stepIdx + 1}: ${stepName}`}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Speaking & Quiz Visual Score Meters for Completed Topics */}
                {isDone && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          <Mic className="w-3 h-3 text-indigo-600" />
                          <span>Voice Accuracy</span>
                        </span>
                        <span className="font-black text-indigo-700">{progress?.speaking_score || 85}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress?.speaking_score || 85}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                          <span>Quiz Score</span>
                        </span>
                        <span className="font-black text-amber-700">{progress?.quiz_score || 80}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress?.quiz_score || 80}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Toolbar (Section 15 Specification) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
                <div className="flex items-center space-x-1">
                  {/* ▶ Listen */}
                  <button
                    type="button"
                    onClick={(e) => playQuickAudio(e, topic.explanation_en)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="▶ Listen Teacher Anjali"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>

                  {/* 📖 Learn */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTopicAtStep(topic, 1);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="📖 Learn Concept"
                  >
                    <BookOpen className="h-4 w-4" />
                  </button>

                  {/* 🗣 Speak */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTopicAtStep(topic, 4);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="🗣 Speaking Practice"
                  >
                    <Mic className="h-4 w-4" />
                  </button>

                  {/* ✍️ Practice */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTopicAtStep(topic, 6);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition"
                    title="✍️ Writing Practice"
                  >
                    <PenTool className="h-4 w-4" />
                  </button>

                  {/* ❓ Quiz */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTopicAtStep(topic, 7);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                    title="❓ Quiz"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </div>

                <span className="flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition">
                  <span>Start</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTopics.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-800">No topics found</h4>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or filter.</p>
        </div>
      )}

      {/* Grammar Topic Interactive 8-step Modal */}
      {selectedTopic && (
        <GrammarTopicModal
          topic={selectedTopic}
          studentId={studentId}
          initialStep={initialModalStep}
          onClose={() => setSelectedTopic(null)}
          onCompleted={handleTopicCompleted}
          onNextTopic={handleNextTopic}
          onBadgeUnlocked={onBadgeUnlocked}
        />
      )}
    </div>
  );
};
