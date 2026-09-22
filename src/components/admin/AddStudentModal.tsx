import React, { useState } from 'react';
import { Student, GroupId } from '../../types';
import { X, UserPlus, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: Student) => void;
  existingCount: number;
}

export const AddStudentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddStudent,
  existingCount,
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [grade, setGrade] = useState('Class 7');
  const [section, setSection] = useState('A');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+91 ');
  const [teacherNotes, setTeacherNotes] = useState('');

  if (!isOpen) return null;

  // Determine Group from grade
  const getGroupId = (gr: string): GroupId => {
    if (gr.includes('5') || gr.includes('6')) return 'A';
    if (gr.includes('7') || gr.includes('8')) return 'B';
    if (gr.includes('9') || gr.includes('10')) return 'C';
    return 'D';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `std-${Date.now()}`;
    const rollNo = `SES-2026-${String(existingCount + 1).padStart(3, '0')}`;
    const grp = getGroupId(grade);

    const newStudent: Student = {
      id: newId,
      rollNo,
      name: name.trim(),
      gender,
      grade,
      section,
      groupId: grp,
      parentName: parentName.trim() || 'Parent/Guardian',
      parentPhone: parentPhone.trim() || '+91 98000 00000',
      completedSituationIds: [],
      totalScore: 0,
      speechFluencyScore: 75,
      vocabMasteryScore: 78,
      roleplayAccuracy: 72,
      attendanceRate: 100,
      lastActiveDate: new Date().toISOString().split('T')[0],
      status: 'active',
      teacherNotes: teacherNotes.trim() || 'Newly enrolled in Smart English Sathi.',
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div
      id="addStudentModalBackdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="addStudentModalContent"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <h3 className="text-base font-black">Enroll New Student</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Student Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Ishaan Deshmukh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'female' | 'male' | 'other')}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white"
              >
                <option value="female">Female (👩‍🎓)</option>
                <option value="male">Male (👨‍🎓)</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Class / Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Class 5">Class 5 (Group A)</option>
                <option value="Class 6">Class 6 (Group A)</option>
                <option value="Class 7">Class 7 (Group B)</option>
                <option value="Class 8">Class 8 (Group B)</option>
                <option value="Class 9">Class 9 (Group C)</option>
                <option value="Class 10">Class 10 (Group C)</option>
                <option value="Class 11">Class 11 (Group D)</option>
                <option value="Class 12">Class 12 (Group D)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="Sci">Science</option>
                <option value="Com">Commerce</option>
                <option value="Arts">Arts</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Parent Contact Number
              </label>
              <input
                type="text"
                placeholder="+91 98XXX XXXXX"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Parent / Guardian Name
            </label>
            <input
              type="text"
              placeholder="e.g., Mrs. Archana Deshmukh"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Initial Observation / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Enthusiastic learner, focus on English listening and shadowing pauses..."
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
