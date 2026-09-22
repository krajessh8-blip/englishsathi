import React from 'react';
import { DailyStreakData } from '../../types';
import { Flame, Check, Sparkles } from 'lucide-react';

interface Props {
  streak: DailyStreakData;
  onClick: () => void;
  className?: string;
}

export const DailyStreakBadge: React.FC<Props> = ({ streak, onClick, className = '' }) => {
  const { currentStreak, practicedToday } = streak;

  return (
    <button
      id="headerDailyStreak"
      onClick={onClick}
      className={`group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer shadow-2xs border ${
        practicedToday
          ? 'bg-linear-to-r from-orange-500 via-amber-500 to-red-500 text-white border-orange-400 shadow-orange-200 hover:brightness-105 ring-2 ring-orange-200/60'
          : currentStreak > 0
          ? 'bg-linear-to-r from-amber-50 to-orange-50 text-amber-950 border-amber-300 hover:border-orange-400 hover:bg-amber-100/80 ring-1 ring-amber-200/50'
          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
      } ${className}`}
      title={
        practicedToday
          ? `Daily Streak: ${currentStreak} days! You practiced today.`
          : currentStreak > 0
          ? `Daily Streak: ${currentStreak} days! Practice a situation today to extend your streak!`
          : 'Daily Streak: 0 days. Practice a situation today to start your streak!'
      }
    >
      {/* Animated Flame Icon */}
      <div className="relative flex items-center justify-center">
        <Flame
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-125 ${
            practicedToday
              ? 'text-yellow-200 fill-yellow-300 animate-pulse'
              : currentStreak > 0
              ? 'text-orange-500 fill-orange-400 animate-bounce'
              : 'text-slate-400'
          }`}
        />
        {practicedToday && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
        )}
      </div>

      {/* Streak Text */}
      <div className="flex items-baseline gap-1 font-black tracking-tight">
        <span className={practicedToday ? 'text-white' : 'text-orange-700'}>
          {currentStreak}
        </span>
        <span className={`text-[11px] sm:text-xs font-bold ${practicedToday ? 'text-amber-100' : 'text-slate-600'}`}>
          <span className="hidden sm:inline">Day</span> Streak
        </span>
      </div>

      {/* Indicator Pill or Mini Status Badge */}
      {practicedToday ? (
        <span className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-white/20 text-[9px] font-black tracking-wider uppercase text-amber-50">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
          <span>Active</span>
        </span>
      ) : currentStreak > 0 ? (
        <span className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-orange-100 text-[9px] font-black text-orange-800">
          <span>Today</span>
        </span>
      ) : null}
    </button>
  );
};
