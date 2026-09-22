import React from 'react';
import { DailyStreakData } from '../../types';
import { getPast7DaysStatus } from '../../utils/streak';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Star,
  Zap,
} from 'lucide-react';

interface Props {
  streak: DailyStreakData;
  totalScore: number;
  onOpenDetails: () => void;
  onQuickPractice?: () => void;
}

export const DailyStreakCard: React.FC<Props> = ({
  streak,
  totalScore,
  onOpenDetails,
  onQuickPractice,
}) => {
  const { currentStreak, practicedToday, practiceHistory, longestStreak } = streak;
  const past7Days = getPast7DaysStatus(practiceHistory);

  return (
    <div
      id="studentDailyStreakCard"
      className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between transition-all hover:border-orange-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        {/* Left: Streak Flame & Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenDetails}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl cursor-pointer transition-transform hover:scale-105 shadow-2xs ${
              practicedToday
                ? 'bg-linear-to-tr from-orange-500 to-amber-400 text-white ring-2 ring-orange-200'
                : 'bg-amber-100 text-amber-700 border border-amber-300'
            }`}
          >
            <Flame
              className={`w-6 h-6 ${
                practicedToday
                  ? 'fill-yellow-200 text-white animate-pulse'
                  : 'text-orange-500 fill-orange-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Daily Practice Streak
              </h3>
              {practicedToday ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Practiced Today</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-orange-600" />
                  <span>Pending Today</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Consecutive days speaking English with Smart English Sathi
            </p>
          </div>
        </div>

        {/* Right: Streak Count + Score Combo */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Total Score Linkage */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black shadow-2xs"
            title="Total Score Points Earned"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>{totalScore} pts</span>
          </div>

          {/* Streak Counter Pill */}
          <button
            onClick={onOpenDetails}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
              practicedToday
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-2xs'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>{currentStreak} Days</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7-Day Quick Visual Strip */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            This Week:
          </span>
          {past7Days.map((day, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                day.isToday
                  ? day.practiced
                    ? 'bg-orange-100 text-orange-900 border border-orange-300 ring-1 ring-orange-300'
                    : 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse'
                  : day.practiced
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-slate-50 text-slate-400'
              }`}
              title={`${day.fullDateFormatted} (${day.dayName}): ${
                day.practiced ? 'Practiced!' : 'No practice recorded'
              }`}
            >
              <span>{day.dayLabel}</span>
              <span>{day.practiced ? '🔥' : '○'}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] text-slate-500 font-medium">
          <span className="text-slate-400">
            Record: <strong className="text-slate-700">{longestStreak} days</strong>
          </span>
          <button
            onClick={onOpenDetails}
            className="text-orange-700 hover:text-orange-800 font-bold hover:underline"
          >
            Streak Insights →
          </button>
        </div>
      </div>
    </div>
  );
};
