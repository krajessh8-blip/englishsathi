import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  MessageSquare,
  BookOpen,
  MapPin,
  Users,
  Play,
  Volume2,
  Sparkles,
  CircleDot,
} from 'lucide-react';
import { Situation } from '../types';
import { getDifficultyBadge } from '../utils/statusColors';

let currentUtterance: SpeechSynthesisUtterance | null = null;
let isConversationActive = false;

interface SituationCardProps {
  situation: Situation;
  isCurrent: boolean;
  isCompleted: boolean;
  levelSubtitle?: string;
  isConversationActive?: boolean;
  onSelect: (id: number) => void;
}

export const SituationCard: React.FC<SituationCardProps> = ({
  situation,
  isCurrent,
  isCompleted,
  levelSubtitle,
  isConversationActive: isConvActiveProp,
  onSelect,
}) => {
  if (isConvActiveProp !== undefined) {
    isConversationActive = isConvActiveProp;
  }

  const handleCardClick = () => {
    // 2. When user clicks ANY new conversation / scenario button, FIRST do:
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stops all TTS immediately
    }
    if (currentUtterance) currentUtterance = null;
    isConversationActive = false;
    onSelect(situation.id);
  };

  const dialogCount =
    situation.dialogs?.length ||
    situation.lines?.filter((l) => l && (l.text || l.speaker)).length ||
    0;
  const vocabCount = situation.vocabulary?.length || 0;

  const char1 = situation.char1_name || 'Teacher';
  const char2 = situation.char2_name || 'Riya';

  const difficulty = situation.difficulty || 'Beginner';
  const diffBadge = getDifficultyBadge(difficulty);

  return (
    <motion.div
      id={`situation-card-${situation.id}`}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`group relative p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between text-left select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isCurrent
          ? 'border-blue-600 bg-linear-to-b from-blue-50/90 via-white to-blue-50/40 shadow-md ring-2 ring-blue-500/30'
          : isCompleted
          ? 'border-emerald-300 hover:border-emerald-400 bg-white hover:bg-emerald-50/20 shadow-xs hover:shadow-md'
          : 'border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50/60 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2">
          {/* Situation Number Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-lg text-xs font-black tracking-wide flex items-center gap-1 shadow-2xs ${
                isCurrent
                  ? 'bg-blue-600 text-white'
                  : isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'
              }`}
            >
              #{situation.id}
            </span>

            {/* Difficulty Badge with Status UI Color */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${diffBadge.className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${diffBadge.dot}`} />
              {diffBadge.label}
            </span>
          </div>

          {/* Status Flag: Completed (Emerald), Active (Blue), or Practice Ready (Sky/Slate) */}
          <div>
            {isCurrent ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Active
              </span>
            ) : isCompleted ? (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs"
                title="Completed and Mastered"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-300 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-sky-500" />
                Ready
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h4
          className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug min-h-[36px] transition-colors ${
            isCurrent
              ? 'text-blue-950 font-extrabold'
              : 'text-slate-800 group-hover:text-blue-700'
          }`}
        >
          {situation.title}
        </h4>

        {/* Setting / Context subtitle if available */}
        {situation.setting && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 line-clamp-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{situation.setting}</span>
          </div>
        )}

        {/* Characters Badge */}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 group-hover:bg-slate-100/80 px-2 py-1 rounded-lg border border-slate-100 transition-colors">
          <Users className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">
            {char1} &amp; {char2}
          </span>
        </div>
      </div>

      {/* Bottom Stats & Quick Action Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-2.5">
          <span
            className="flex items-center gap-1 text-slate-600"
            title={`${dialogCount} Dialogue Lines`}
          >
            <MessageSquare className="w-3 h-3 text-blue-500" />
            <span className="font-semibold">{dialogCount}</span>
            <span className="text-[10px] text-slate-400">lines</span>
          </span>

          {vocabCount > 0 && (
            <span
              className="flex items-center gap-1 text-slate-600"
              title={`${vocabCount} Vocabulary Words`}
            >
              <BookOpen className="w-3 h-3 text-emerald-500" />
              <span className="font-semibold">{vocabCount}</span>
              <span className="text-[10px] text-slate-400">vocab</span>
            </span>
          )}
        </div>

        {/* Interactive CTA indicator */}
        <div className="flex items-center gap-1 font-bold text-[11px]">
          {isCurrent ? (
            <span className="text-blue-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Playing
            </span>
          ) : (
            <button
              type="button"
              disabled={isConversationActive}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="text-slate-400 group-hover:text-blue-600 flex items-center gap-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Start</span>
              <Play className="w-2.5 h-2.5 fill-current" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
