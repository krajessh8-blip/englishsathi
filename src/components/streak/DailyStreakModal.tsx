import React from 'react';
import { DailyStreakData } from '../../types';
import { getPast7DaysStatus } from '../../utils/streak';
import {
  Flame,
  X,
  Sparkles,
  Trophy,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  streak: DailyStreakData;
  totalScore: number;
  completedSituationsCount: number;
  onPracticeTodayNow?: () => void;
  onResetStreak?: () => void;
}

export const DailyStreakModal: React.FC<Props> = ({
  isOpen,
  onClose,
  streak,
  totalScore,
  completedSituationsCount,
  onPracticeTodayNow,
  onResetStreak,
}) => {
  if (!isOpen) return null;

  const { currentStreak, longestStreak, practicedToday, practiceHistory, totalDaysPracticed } =
    streak;
  const past7Days = getPast7DaysStatus(practiceHistory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header Banner with Flame Theme */}
        <div className="p-5 sm:p-6 bg-linear-to-br from-orange-500 via-amber-500 to-red-500 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner animate-pulse">
              🔥
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-[10px] font-black tracking-wider uppercase">
                Student Learning Discipline
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                Daily Practice Streak
              </h3>
              <p className="text-xs text-orange-100 font-medium">
                दैनिक इंग्रजी सराव • Consistency in Spoken English
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Big Flame Stat Box */}
          <div className="p-4 rounded-2xl bg-linear-to-b from-orange-50/80 via-amber-50/40 to-white border border-orange-200/80 shadow-xs text-center relative overflow-hidden">
            <div className="absolute top-2 right-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold text-amber-800">
                Record: {longestStreak} Days
              </span>
            </div>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-linear-to-tr from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-300/50 my-1">
              <Flame className="w-9 h-9 fill-yellow-200 text-white" />
            </div>

            <div className="mt-2">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Current Consecutive Practice Streak
              </p>
            </div>

            {/* Today's Status Banner */}
            <div className="mt-3.5 pt-3 border-t border-orange-200/60 flex items-center justify-center gap-2">
              {practicedToday ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Streak safe! You practiced a situation today.</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Practice any situation today to keep your streak alive!</span>
                </div>
              )}
            </div>
          </div>

          {/* 7-Day Activity Calendar Visualizer */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Past 7 Days Activity
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {totalDaysPracticed} Total Days Practiced
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {past7Days.map((day, idx) => {
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-between transition-all ${
                      day.isToday
                        ? day.practiced
                          ? 'bg-orange-100/80 border-orange-300 shadow-2xs ring-2 ring-orange-300'
                          : 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                        : day.practiced
                        ? 'bg-orange-50/70 border-orange-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-500">{day.dayName}</span>
                    <div className="my-1 text-base">
                      {day.practiced ? (
                        <span title="Practiced!" className="inline-block animate-bounce">
                          🔥
                        </span>
                      ) : (
                        <span className="inline-block text-slate-300 text-xs font-mono">•</span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-bold ${
                        day.isToday ? 'text-orange-700 underline font-black' : 'text-slate-400'
                      }`}
                    >
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contextual Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>Total Score</span>
              </div>
              <p className="text-lg font-black text-amber-950 mt-1">{totalScore} Points</p>
              <p className="text-[10px] text-amber-700/80 mt-0.5">Earned from vocab &amp; role-play</p>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80">
              <div className="text-[11px] font-bold text-blue-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Completed Lessons</span>
              </div>
              <p className="text-lg font-black text-blue-950 mt-1">
                {completedSituationsCount} / 20 Situations
              </p>
              <p className="text-[10px] text-blue-700/80 mt-0.5">Across Groups A to D</p>
            </div>
          </div>

          {/* Pedagogy Note in Marathi */}
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>💡</span>
              <span>सातत्याचे महत्त्व (Power of Daily Spoken Practice):</span>
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              दररोज फक्त एक इंग्रजी प्रसंग ऐकून (Watch &amp; Listen), सराव करून किंवा शिक्षिका अंजली यांच्यासोबत
              बोलून (Role Play) तुमचा दैनिक स्ट्रीक वाढवा. सराव सोडल्यास स्ट्रीक खंडित होतो!
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          {onResetStreak && (
            <button
              onClick={onResetStreak}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
              title="Reset streak baseline for testing"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Baseline</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>

            {onPracticeTodayNow && !practicedToday && (
              <button
                onClick={() => {
                  onPracticeTodayNow();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-orange-600 hover:bg-orange-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
              >
                <span>Practice a Situation Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
