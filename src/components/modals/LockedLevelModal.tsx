import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, ChevronRight, CheckCircle2, ArrowRight, X, BookOpen, Mic } from 'lucide-react';
import { Level, Situation } from '../../types';
import { LEVELS, getSituationLevel } from '../../data/levels';

interface LockedLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLevel: Level | null;
  publishedLessons: Situation[];
  completedSituationIds: Set<number>;
  onGoToLevelPractice: (levelId: number, situationId?: number) => void;
}

export const LockedLevelModal: React.FC<LockedLevelModalProps> = ({
  isOpen,
  onClose,
  targetLevel,
  publishedLessons,
  completedSituationIds,
  onGoToLevelPractice,
}) => {
  if (!isOpen || !targetLevel) return null;

  // Identify previous level
  const prevLevelId = Math.max(1, targetLevel.id - 1);
  const prevLevel = LEVELS.find((l) => l.id === prevLevelId) || LEVELS[0];

  // Lessons belonging to previous level
  const prevLevelLessons = publishedLessons.filter(
    (s) => (s.level || getSituationLevel(s.id)) === prevLevelId
  );

  const completedInPrev = prevLevelLessons.filter((s) => completedSituationIds.has(s.id));
  const uncompletedInPrev = prevLevelLessons.filter((s) => !completedSituationIds.has(s.id));

  // Requirement: at least 3 completed situations from previous level (or total available if < 3)
  const requiredCount = Math.max(1, Math.min(3, prevLevelLessons.length || 3));
  const remainingNeeded = Math.max(0, requiredCount - completedInPrev.length);

  const progressPercent = Math.min(
    100,
    Math.round((completedInPrev.length / Math.max(1, requiredCount)) * 100)
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header with Locked Level Badge & Close */}
          <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xl shadow-inner shrink-0">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black tracking-wide uppercase">
                    <span>Locked Tier • स्तर कुलूपबंद</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1 leading-snug">
                    Level {targetLevel.id}: {targetLevel.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    {targetLevel.subtitle} • {targetLevel.class}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                id="btnCloseLockedModal"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body content */}
          <div className="p-6 space-y-5">
            {/* Requirement Highlight Callout */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Unlock Requirement / अनलॉक करण्याची अट</span>
              </div>

              <p className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {remainingNeeded > 0 ? (
                  <>
                    Complete <span className="text-amber-600 underline decoration-amber-400 decoration-2">{remainingNeeded} more situation{remainingNeeded > 1 ? 's' : ''}</span> in Level {prevLevel.id} to unlock!
                  </>
                ) : (
                  <>
                    Requirement completed! Complete one practice session in Level {prevLevel.id} to advance.
                  </>
                )}
              </p>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                पातळी {targetLevel.id} ({targetLevel.subtitle}) अनलॉक करण्यासाठी आधी पातळी {prevLevel.id} ({prevLevel.subtitle}) मधील {remainingNeeded > 0 ? `आणखी ${remainingNeeded} संभाषणे` : 'संभाषणे'} पूर्ण करा.
              </p>
            </div>

            {/* Progress bar towards requirement */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Level {prevLevel.id} Completion Progress:</span>
                <span className="text-amber-700 font-extrabold">
                  {completedInPrev.length} / {requiredCount} Situations
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                />
              </div>
            </div>

            {/* Recommended Situations from previous level to practice */}
            {uncompletedInPrev.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Recommended to practice next in Level {prevLevel.id}:
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {uncompletedInPrev.slice(0, 3).map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        onGoToLevelPractice(prevLevel.id, lesson.id);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50/50 hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase text-amber-700 px-1.5 py-0.5 rounded bg-amber-100">
                          #{lesson.id}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-amber-900 mt-0.5">
                          {lesson.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {lesson.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-700 shrink-0">
                        <span>Practice</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                id="btnGoToPrevLevelPractice"
                onClick={() => {
                  onGoToLevelPractice(prevLevel.id);
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Go to Level {prevLevel.id} Practice</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btnDismissLockedModal"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Got It / समजले
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
