import React, { useState, useMemo } from 'react';
import { Student, Situation } from '../../types';
import { ALL_BADGES, isBadgeUnlocked } from '../../data/badges';
import { calculateStudentGrammarSummary, getStudentCompletedGrammarLevels } from '../../data/grammar/grammarManager';
import {
  X,
  Award,
  CheckCircle2,
  Clock,
  Phone,
  User,
  GraduationCap,
  FileText,
  Printer,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Trophy,
  Mic,
} from 'lucide-react';

interface Props {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  allLessons: Situation[];
  onUpdateStudent: (updated: Student) => void;
}

export const StudentDetailModal: React.FC<Props> = ({
  student,
  isOpen,
  onClose,
  allLessons,
  onUpdateStudent,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(student?.teacherNotes || '');
  const [status, setStatus] = useState<Student['status']>(student?.status || 'active');

  if (!isOpen || !student) return null;

  const completedSet = new Set(student.completedSituationIds);
  const completionPercentage = Math.round(
    (student.completedSituationIds.length / allLessons.length) * 100
  );

  const grammarSummary = calculateStudentGrammarSummary(student.id, student.levelId);

  const handleSaveNotes = () => {
    onUpdateStudent({
      ...student,
      teacherNotes: notes,
      status: status,
    });
    setIsEditingNotes(false);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div
      id="studentDetailModalBackdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="studentDetailModalContent"
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white text-blue-700 flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                {student.gender === 'female' ? '👩‍🎓' : '👨‍🎓'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black">{student.name}</h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase inline-flex items-center gap-1.5 ${
                      student.status === 'excellent'
                        ? 'bg-emerald-400 text-emerald-950 font-black'
                        : student.status === 'needs_attention'
                        ? 'bg-amber-300 text-amber-950 font-black'
                        : 'bg-sky-300 text-sky-950 font-black'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        student.status === 'excellent'
                          ? 'bg-emerald-900'
                          : student.status === 'needs_attention'
                          ? 'bg-amber-900'
                          : 'bg-sky-900'
                      }`}
                    />
                    <span>{student.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <p className="text-blue-100 text-xs mt-0.5">
                  Roll No: <span className="font-mono font-bold">{student.rollNo}</span> •{' '}
                  {student.grade} - Section {student.section} • Group {student.groupId}
                </p>
              </div>
            </div>

            {/* Print button */}
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report Card</span>
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-[11px] font-bold uppercase text-blue-700 block">
                Speech Fluency
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-blue-900">
                  {student.speechFluencyScore}%
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">AI Index</span>
              </div>
              <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${student.speechFluencyScore}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[11px] font-bold uppercase text-emerald-700 block">
                Vocab Mastery
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-900">
                  {student.vocabMasteryScore}%
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">Accuracy</span>
              </div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${student.vocabMasteryScore}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
              <span className="text-[11px] font-bold uppercase text-purple-700 block">
                Total Score
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-purple-900">
                  {student.totalScore}
                </span>
                <span className="text-[11px] text-purple-600 font-semibold">Points</span>
              </div>
              <div className="w-full bg-purple-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (student.totalScore / 1000) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[11px] font-bold uppercase text-amber-700 block">
                Curriculum Progress
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-amber-900">
                  {student.completedSituationIds.length}
                </span>
                <span className="text-[11px] text-amber-700 font-semibold">
                  / {allLessons.length} Situations
                </span>
              </div>
              <div className="w-full bg-amber-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Grammar Learning & Accuracy (Section 20 requirement) */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-600 text-white text-xs">📖</span>
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">
                  Grammar Curriculum Performance (10-Level System)
                </h4>
              </div>
              <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                Level {student.levelId || 1}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Topics Completed</span>
                <div className="text-lg font-black text-indigo-900 mt-0.5">
                  {grammarSummary.completedTopicsCount} <span className="text-xs font-normal text-slate-400">/ {grammarSummary.totalTopicsCount}</span>
                </div>
                <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                  {grammarSummary.overallProgressPercent}% Complete
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Speaking Grammar</span>
                <div className="text-lg font-black text-blue-700 mt-0.5">
                  {grammarSummary.speakingGrammarScore > 0 ? `${grammarSummary.speakingGrammarScore}%` : 'Pending'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Voice Evaluation</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Grammar Quiz Average</span>
                <div className="text-lg font-black text-amber-600 mt-0.5">
                  {grammarSummary.grammarQuizScore > 0 ? `${grammarSummary.grammarQuizScore}%` : 'Pending'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Knowledge Checks</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Overall Accuracy</span>
                <div className="text-lg font-black text-emerald-600 mt-0.5">
                  {grammarSummary.accuracy > 0 ? `${grammarSummary.accuracy}%` : '—'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">8-Step Sequence</div>
              </div>
            </div>

            {/* Weak Areas & Strong Areas */}
            <div className="mt-3 pt-2.5 border-t border-indigo-100 flex flex-col sm:flex-row gap-2 text-xs">
              <div className="flex-1">
                <span className="font-bold text-emerald-800 mr-1.5">Strong Topics:</span>
                {grammarSummary.strongTopics.length > 0 ? (
                  grammarSummary.strongTopics.map((top, idx) => (
                    <span key={idx} className="inline-block mr-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-semibold">
                      {top}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None recorded yet</span>
                )}
              </div>

              <div className="flex-1">
                <span className="font-bold text-amber-800 mr-1.5">Weak Grammar Areas:</span>
                {grammarSummary.weakTopics.length > 0 ? (
                  grammarSummary.weakTopics.map((top, idx) => (
                    <span key={idx} className="inline-block mr-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[11px] font-semibold">
                      {top}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">No critical weaknesses identified</span>
                )}
              </div>
            </div>
          </div>

          {/* Student Info & Parent Contact */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <User className="w-4 h-4 text-slate-400" />
                <span>Parent/Guardian: <strong className="text-slate-900">{student.parentName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Contact: <strong className="text-slate-900 font-mono">{student.parentPhone}</strong></span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Last Active: <strong className="text-slate-900">{student.lastActiveDate}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Attendance: <strong className="text-emerald-700">{student.attendanceRate}%</strong></span>
              </div>
            </div>
          </div>

          {/* Earned Milestone & Grammar Badges Strip */}
          {(() => {
            const completedGrammarLevels = getStudentCompletedGrammarLevels(student.id);
            const unlockedList = ALL_BADGES.filter((b) =>
              isBadgeUnlocked(b, student.completedSituationIds.length, student.totalScore, completedGrammarLevels)
            );

            return (
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>Earned Milestone &amp; Grammar Badges</span>
                  </h4>
                  <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    {unlockedList.length} / {ALL_BADGES.length} Badges Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_BADGES.map((badge) => {
                    const isEarned = isBadgeUnlocked(
                      badge,
                      student.completedSituationIds.length,
                      student.totalScore,
                      completedGrammarLevels
                    );
                    return (
                      <div
                        key={badge.id}
                        className={`p-2 rounded-xl border flex items-center gap-2 ${
                          isEarned
                            ? badge.category === 'grammar'
                              ? 'bg-indigo-50 border-indigo-300 shadow-2xs text-slate-900 ring-1 ring-indigo-200'
                              : 'bg-white border-amber-300 shadow-2xs text-slate-900'
                            : 'bg-slate-100/60 border-slate-200 opacity-50 text-slate-400'
                        }`}
                        title={`${badge.title} - ${badge.description}`}
                      >
                        <span className="text-2xl shrink-0">{badge.icon}</span>
                        <div className="overflow-hidden min-w-0">
                          <p className="text-[11px] font-black line-clamp-1 flex items-center gap-1">
                            <span>{badge.title}</span>
                            {isEarned && <span className="text-emerald-600 text-[10px]">✓</span>}
                          </p>
                          <p className="text-[9px] text-slate-500 line-clamp-1">
                            {badge.category === 'grammar' ? `L${badge.targetGrammarLevel} • ${badge.marathiTitle}` : badge.marathiTitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Completed Lessons Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Curriculum Situations Matrix ({student.completedSituationIds.length} / {allLessons.length} Completed)</span>
              </h4>
              <span className="text-xs font-bold text-blue-700">
                {completionPercentage}% Finished
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allLessons.map((lesson) => {
                const isDone = completedSet.has(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50/50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        #{lesson.id}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{lesson.title}</p>
                        <p className="text-[10px] opacity-75">
                          Group {lesson.group} • {lesson.dialogs.length} dialogues
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold shrink-0 ml-2">
                      {isDone ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          ✓ Done
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Feedback & Evaluation Notes */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Teacher &amp; Principal Evaluation Notes</span>
              </h4>
              {!isEditingNotes && (
                <button
                  onClick={() => {
                    setIsEditingNotes(true);
                    setNotes(student.teacherNotes || '');
                    setStatus(student.status);
                  }}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
                >
                  Edit Evaluation
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  placeholder="Enter teacher notes, pronunciation feedback, or intervention recommendations..."
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700">Status:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Student['status'])}
                      className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      <option value="active">Active</option>
                      <option value="excellent">Excellent</option>
                      <option value="needs_attention">Needs Attention</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                    >
                      Save Evaluation
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{student.teacherNotes || 'No notes added yet. Student is currently active in assigned curriculum situations.'}"
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
