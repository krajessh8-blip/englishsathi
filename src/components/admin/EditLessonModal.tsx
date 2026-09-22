import React, { useState } from 'react';
import { Situation, GroupId, SituationStatus } from '../../types';
import { LEVELS, getSituationLevel, mapLevelToGroup } from '../../data/levels';
import { isProtectedSituation } from '../../data/lessonsManager';
import { X, Save, BookOpen, MessageSquare, Layers, ShieldCheck, Lock, User, Sparkles } from 'lucide-react';

interface Props {
  lesson: Situation | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLesson: (updated: Situation) => void;
}

export const EditLessonModal: React.FC<Props> = ({
  lesson,
  isOpen,
  onClose,
  onSaveLesson,
}) => {
  if (!isOpen || !lesson) return null;

  const sitLevel = lesson.level || getSituationLevel(lesson.id);
  const sitNumber =
    lesson.situation_no !== undefined
      ? lesson.situation_no
      : lesson.id <= 50
      ? ((lesson.id - 1) % 5) + 1
      : lesson.id;

  const isProtected = isProtectedSituation({
    id: lesson.id,
    level: sitLevel,
    situation_no: sitNumber,
  });

  const [title, setTitle] = useState(lesson.title || '');
  const [subtitle, setSubtitle] = useState(lesson.subtitle || '');
  const [setting, setSetting] = useState(lesson.setting || '');
  const [level, setLevel] = useState<number>(sitLevel);
  const [status, setStatus] = useState<SituationStatus>(lesson.status || (isProtected ? 'published' : 'draft'));
  const [char1Role, setChar1Role] = useState(lesson.char1_role || 'teacher');
  const [char1Name, setChar1Name] = useState(lesson.char1_name || 'Teacher Anjali');
  const [char2Role, setChar2Role] = useState(lesson.char2_role || 'student');
  const [char2Name, setChar2Name] = useState(lesson.char2_name || 'Riya');
  const [difficulty, setDifficulty] = useState(lesson.difficulty || 'Intermediate');
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'dialogs' | 'characters'>('info');

  // Copy of dialogs or lines for editing (standardize to 20 lines)
  const initialLines =
    Array.isArray(lesson.dialogs) && lesson.dialogs.length > 0
      ? lesson.dialogs.map((d) => ({
          id: d.id,
          speaker: d.who,
          text: d.text,
          marathi: d.marathi,
        }))
      : Array.isArray(lesson.lines) && lesson.lines.length > 0
      ? lesson.lines
      : Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          speaker: i % 2 === 0 ? 'teacher' : 'student',
          text: '',
          marathi: '',
        }));

  const [lines, setLines] = useState(initialLines);

  const handleLineChange = (index: number, field: 'text' | 'marathi' | 'speaker', val: string) => {
    if (isProtected) return;
    const next = [...lines];
    next[index] = { ...(next[index] || {}), [field]: val };
    setLines(next);
  };

  const handleSave = () => {
    if (isProtected) {
      alert('Situations 1–5 are published and permanently protected from modification.');
      return;
    }

    const updatedDialogs = lines
      .filter((l) => l && (l.text || l.marathi))
      .map((l, idx) => ({
        id: idx + 1,
        who: (l.speaker === 'teacher' ? 'teacher' : 'riya') as 'teacher' | 'riya',
        text: l.text || '',
        marathi: l.marathi || '',
      }));

    const updated: Situation = {
      ...lesson,
      title: title.trim(),
      subtitle: subtitle.trim(),
      setting: setting.trim(),
      level,
      situation_no: sitNumber,
      status,
      isActive: status === 'published',
      group: mapLevelToGroup(level),
      difficulty,
      char1_role: char1Role.trim(),
      char1_name: char1Name.trim(),
      char2_role: char2Role.trim(),
      char2_name: char2Name.trim(),
      lines,
      dialogs: updatedDialogs.length > 0 ? updatedDialogs : lesson.dialogs,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSaveLesson(updated);
    onClose();
  };

  return (
    <div
      id="editLessonModalBackdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="editLessonModalContent"
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white ${
                isProtected ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            >
              #{sitNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">
                  {isProtected ? 'View Published Situation' : 'Edit Draft Situation'} #{sitNumber}
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                    status === 'published'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span>{status}</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Level {sitLevel} • Situation #{sitNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protection Warning */}
        {isProtected && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3 flex items-center gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Hard Protection Enforced:</strong> Situations 1–5 for every level are core published curriculum and permanently protected from modification.
            </span>
          </div>
        )}

        {/* Subtabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveSubTab('info')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>General Info</span>
          </button>
          <button
            onClick={() => setActiveSubTab('characters')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'characters'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Characters</span>
          </button>
          <button
            onClick={() => setActiveSubTab('dialogs')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'dialogs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Conversation Lines ({lines.filter((l) => l && (l.text || l.marathi)).length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeSubTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Situation Title
                </label>
                <input
                  type="text"
                  disabled={isProtected}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Asking for Permission to Enter Class"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subtitle / Learning Focus
                </label>
                <input
                  type="text"
                  disabled={isProtected}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Explaining reasons politely with standard classroom etiquette"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Setting Description
                </label>
                <input
                  type="text"
                  disabled={isProtected}
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  placeholder="e.g. Classroom • Morning assembly"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Status
                    </label>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                        status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <select
                    disabled={isProtected}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SituationStatus)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold disabled:bg-slate-100"
                  >
                    <option value="draft">Draft (Invisible to Students)</option>
                    <option value="published">Published (Visible to Students)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Curriculum Level
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`Level ${level} (Class ${LEVELS.find((l) => l.id === level)?.class || level})`}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-600 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'characters' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-900">
                  Primary Speaker (Character 1)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Role (char1_role)
                    </label>
                    <input
                      type="text"
                      disabled={isProtected}
                      value={char1Role}
                      onChange={(e) => setChar1Role(e.target.value)}
                      placeholder="e.g. teacher, doctor, friend"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Name (char1_name)
                    </label>
                    <input
                      type="text"
                      disabled={isProtected}
                      value={char1Name}
                      onChange={(e) => setChar1Name(e.target.value)}
                      placeholder="e.g. Teacher Anjali"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                  Secondary Speaker (Character 2)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Role (char2_role)
                    </label>
                    <input
                      type="text"
                      disabled={isProtected}
                      value={char2Role}
                      onChange={(e) => setChar2Role(e.target.value)}
                      placeholder="e.g. student, patient, peer"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Name (char2_name)
                    </label>
                    <input
                      type="text"
                      disabled={isProtected}
                      value={char2Name}
                      onChange={(e) => setChar2Name(e.target.value)}
                      placeholder="e.g. Riya"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'dialogs' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Dialogue exchange lines (English text and Marathi translation).
              </p>
              {lines.slice(0, 20).map((line, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-700">
                      Line #{idx + 1}
                    </span>
                    <select
                      disabled={isProtected}
                      value={line.speaker || (idx % 2 === 0 ? 'teacher' : 'student')}
                      onChange={(e) => handleLineChange(idx, 'speaker', e.target.value)}
                      className="text-[11px] font-bold px-2 py-1 rounded-md border border-slate-300 bg-white disabled:bg-slate-100"
                    >
                      <option value="teacher">Speaker 1 ({char1Name || 'Teacher'})</option>
                      <option value="student">Speaker 2 ({char2Name || 'Riya'})</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      disabled={isProtected}
                      placeholder={`English speech line #${idx + 1}...`}
                      value={line.text || ''}
                      onChange={(e) => handleLineChange(idx, 'text', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      disabled={isProtected}
                      placeholder={`मराठी भाषांतर (Marathi translation)...`}
                      value={line.marathi || ''}
                      onChange={(e) => handleLineChange(idx, 'marathi', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-amber-50/50 disabled:bg-slate-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            {isProtected ? (
              <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                <Lock className="w-3.5 h-3.5" />
                Situations 1–5 are read-only protected content
              </span>
            ) : (
              <span>Draft Situation #{sitNumber}</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={isProtected}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isProtected ? <Lock className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isProtected ? 'Locked (Protected)' : 'Save Situation Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
