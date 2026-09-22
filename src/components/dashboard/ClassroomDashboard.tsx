import React, { useState, useMemo, useEffect } from 'react';
import { Situation, Student, AuthUser } from '../../types';
import {
  Play,
  Users,
  Volume2,
  Sparkles,
  CheckCircle2,
  Search,
  School,
  UserCheck,
  Award,
  BookOpen,
  Mic,
  RotateCcw,
  LogOut,
  ChevronRight,
  Filter,
  Building2,
} from 'lucide-react';

interface ClassroomDashboardProps {
  students?: Student[];
  lessons?: Situation[];
  authUser?: AuthUser | null;
  onStartPractice: (situationId?: number) => void;
  onLogout?: () => void;
}

export const ClassroomDashboard: React.FC<ClassroomDashboardProps> = ({
  students = [],
  lessons = [],
  authUser,
  onStartPractice,
  onLogout,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSituationId, setSelectedSituationId] = useState<number>(() => {
    return lessons[0]?.id || 1;
  });
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [spotlightStudent, setSpotlightStudent] = useState<Student | null>(null);
  const [practiceMode, setPracticeMode] = useState<'chorus' | 'turn_by_turn' | 'pairs'>('chorus');

  // School isolation & tenant state
  const [activeUdise, setActiveUdise] = useState<string>(() => {
    return authUser?.udiseCode || (typeof window !== 'undefined' ? localStorage.getItem('mvm_active_udise') || '' : '');
  });
  const [activeSchoolName, setActiveSchoolName] = useState<string>(() => {
    return authUser?.schoolName || (typeof window !== 'undefined' ? localStorage.getItem('mvm_active_school_name') || '' : '');
  });
  const [registeredSchools, setRegisteredSchools] = useState<{ udiseCode: string; schoolName: string }[]>([]);
  const [remoteStudents, setRemoteStudents] = useState<Student[]>([]);

  // Fetch list of registered schools from backend
  useEffect(() => {
    fetch('/api/schools')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.schools)) {
          setRegisteredSchools(data.schools);
          if (!activeUdise && data.schools.length > 0) {
            const first = data.schools[0];
            setActiveUdise(first.udiseCode);
            setActiveSchoolName(first.schoolName);
            if (typeof window !== 'undefined') {
              localStorage.setItem('mvm_active_udise', first.udiseCode);
              localStorage.setItem('mvm_active_school_name', first.schoolName);
            }
          }
        }
      })
      .catch((err) => console.warn('Failed to load schools for classroom:', err));
  }, [activeUdise]);

  // Fetch isolated student roster from server for active UDISE
  useEffect(() => {
    if (activeUdise) {
      fetch(`/api/schools/${activeUdise}/students`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.success && Array.isArray(data.students)) {
            setRemoteStudents(data.students);
          }
        })
        .catch((err) => console.warn('Failed to load students for classroom UDISE:', activeUdise, err));
    }
  }, [activeUdise]);

  const handleSchoolChange = (newUdise: string) => {
    const found = registeredSchools.find((s) => s.udiseCode === newUdise);
    const resolvedName = found ? found.schoolName : `School UDISE ${newUdise}`;
    setActiveUdise(newUdise);
    setActiveSchoolName(resolvedName);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mvm_active_udise', newUdise);
      localStorage.setItem('mvm_active_school_name', resolvedName);
    }
  };

  // Strictly filter students by active school UDISE (isolated tenant)
  const schoolStudents = useMemo(() => {
    if (!activeUdise) return [];
    const matchingLocal = students.filter((s) => s.udiseCode === activeUdise);
    const seenIds = new Set(matchingLocal.map((s) => s.id));
    const combined = [...matchingLocal];
    for (const r of remoteStudents) {
      if (!seenIds.has(r.id)) {
        combined.push(r);
        seenIds.add(r.id);
      }
    }
    return combined;
  }, [students, activeUdise, remoteStudents]);

  const [presentStudentIds, setPresentStudentIds] = useState<Set<string>>(() => {
    return new Set(schoolStudents.map((s) => s.id));
  });

  // Re-sync attendance set whenever schoolStudents changes
  useEffect(() => {
    setPresentStudentIds(new Set(schoolStudents.map((s) => s.id)));
  }, [schoolStudents]);

  // Filter lessons by level
  const publishedLessons = useMemo(() => {
    return lessons.filter((s) => s.status === 'published' || !s.status);
  }, [lessons]);

  const levelLessons = useMemo(() => {
    const list = publishedLessons.filter((s) => (s.level || 1) === selectedLevel);
    return list.length > 0 ? list : publishedLessons.slice(0, 4);
  }, [publishedLessons, selectedLevel]);

  const activeSituation = useMemo(() => {
    return publishedLessons.find((s) => s.id === selectedSituationId) || publishedLessons[0] || lessons[0];
  }, [publishedLessons, selectedSituationId, lessons]);

  // Filter students strictly within the school's isolated student roster
  const filteredStudents = useMemo(() => {
    return schoolStudents.filter((s) => {
      const matchClass = selectedClass === 'all' || s.grade.toLowerCase() === selectedClass.toLowerCase();
      const matchSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [schoolStudents, selectedClass, searchQuery]);

  // Unique grades for filter from isolated roster
  const availableGrades = useMemo(() => {
    const grades = Array.from(new Set(schoolStudents.map((s) => s.grade))).sort();
    return grades.length > 0 ? grades : ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  }, [schoolStudents]);

  const toggleStudentAttendance = (id: string) => {
    setPresentStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const markAllPresent = () => {
    setPresentStudentIds(new Set(schoolStudents.map((s) => s.id)));
  };

  const pickRandomStudent = () => {
    const presentList = filteredStudents.filter((s) => presentStudentIds.has(s.id));
    if (presentList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * presentList.length);
    setSpotlightStudent(presentList[randomIndex]);
  };

  const classroomDisplayName = authUser?.name || 'Classroom Practice';
  const schoolName = activeSchoolName || authUser?.schoolName || (activeUdise ? `School UDISE ${activeUdise}` : 'Classroom Portal');
  const udiseCode = activeUdise || authUser?.udiseCode || 'Not Selected';

  return (
    <div className="w-full space-y-6">
      {/* 1. Classroom Banner / Header Context */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-black/30 border border-white/20 rounded-full text-xs font-black tracking-wider uppercase text-amber-200 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" />
                Classroom Group Practice Mode • वर्ग सामूहिक सराव
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                UDISE: {udiseCode}
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/30 border border-emerald-300/40 rounded-full text-xs font-bold text-emerald-100">
                Isolated Tenant ({schoolStudents.length} Students)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {schoolName}
            </h1>

            <p className="text-sm sm:text-base text-amber-100 font-medium max-w-2xl">
              Welcome, <span className="font-bold text-white">{classroomDisplayName}</span>! Showing student records strictly isolated for UDISE <strong className="font-mono text-white underline">{udiseCode}</strong>.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {registeredSchools.length > 1 && (
              <div className="flex items-center gap-1.5 bg-black/30 border border-white/20 px-3 py-2 rounded-2xl text-xs text-white">
                <Building2 className="w-4 h-4 text-amber-300" />
                <label htmlFor="classroom-school-switch" className="font-bold text-amber-100">
                  School:
                </label>
                <select
                  id="classroom-school-switch"
                  value={activeUdise}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="bg-black/50 border border-white/30 rounded-lg px-2 py-1 font-bold text-white text-xs focus:outline-hidden"
                >
                  {registeredSchools.map((s) => (
                    <option key={s.udiseCode} value={s.udiseCode} className="text-slate-900 bg-white">
                      {s.schoolName} ({s.udiseCode})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="button"
              id="btnClassroomStartTop"
              onClick={() => onStartPractice(activeSituation?.id)}
              className="px-6 py-3.5 bg-white text-orange-700 hover:bg-amber-50 font-black rounded-2xl text-sm sm:text-base shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Practice Now (सराव सुरू करा)</span>
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-3 bg-black/30 hover:bg-black/40 border border-white/20 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
                title="Log out from classroom session"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Classroom Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-xs sm:text-sm">
          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <span className="text-amber-200 block text-[11px] font-semibold">Total Students</span>
            <span className="text-xl sm:text-2xl font-black">{schoolStudents.length}</span>
          </div>
          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <span className="text-emerald-200 block text-[11px] font-semibold">Present Today</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-300">
              {presentStudentIds.size} / {schoolStudents.length}
            </span>
          </div>
          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <span className="text-amber-200 block text-[11px] font-semibold">Curriculum Lessons</span>
            <span className="text-xl sm:text-2xl font-black">{publishedLessons.length}</span>
          </div>
          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <span className="text-amber-200 block text-[11px] font-semibold">Speaking Sessions</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300">Active</span>
          </div>
        </div>
      </div>

      {/* 2. Primary Group Practice Launcher Box (Projector / Smart Board Showcase) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span>Select Spoken English Lesson for Class Practice</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Choose a dialogue situation to practice with the whole class together with audio shadowing and Marathi translation.
            </p>
          </div>

          {/* Level Switcher (1 to 10) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 shrink-0 mr-1">Level:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                  selectedLevel === lvl
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                L{lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levelLessons.map((lesson) => {
            const isSelected = activeSituation?.id === lesson.id;
            return (
              <div
                key={lesson.id}
                onClick={() => setSelectedSituationId(lesson.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/50 shadow-md ring-2 ring-orange-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-orange-100 text-orange-800 uppercase">
                      Situation #{lesson.id} • L{lesson.level || selectedLevel}
                    </span>
                    {isSelected && (
                      <span className="text-[11px] font-bold text-orange-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{lesson.subtitle}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    {lesson.dialogs?.length || 8} Dialogues
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-orange-600">
                    <Mic className="w-3.5 h-3.5" />
                    Role-Play
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Lesson Launch Bar */}
        {activeSituation && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider uppercase text-orange-400 block">
                Active Classroom Selection
              </span>
              <h4 className="text-base sm:text-lg font-black text-white">
                #{activeSituation.id}: {activeSituation.title}
              </h4>
              <p className="text-xs text-slate-300">
                {activeSituation.setting || activeSituation.subtitle} • Includes Listen &amp; Repeat, Vocabulary, and Speaking Roleplay.
              </p>
            </div>

            {/* Group Mode Options & Launch */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-1 flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => setPracticeMode('chorus')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    practiceMode === 'chorus' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👥 Class Chorus
                </button>
                <button
                  type="button"
                  onClick={() => setPracticeMode('pairs')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    practiceMode === 'pairs' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔄 Group A vs B
                </button>
              </div>

              <button
                type="button"
                id="btnClassroomLaunchProjector"
                onClick={() => onStartPractice(activeSituation.id)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black rounded-xl text-sm shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Practice (प्रोजेक्टरवर सुरू करा)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Student List & Roll Call Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <span>Student Classroom Roster (विद्यार्थी यादी)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track attendance for this speaking session or randomly spotlight a student to answer.
            </p>
          </div>

          {/* Quick Actions: Spotlight Student & Mark All */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={pickRandomStudent}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Spotlight Random Student (विद्यार्थी निवडा)</span>
            </button>
            <button
              type="button"
              onClick={markAllPresent}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
          </div>
        </div>

        {/* Spotlight Card if active */}
        {spotlightStudent && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shrink-0">
                🎯
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-black text-amber-200 block">
                  Spotlight Speaker / मुख्य वक्ता
                </span>
                <h4 className="text-base sm:text-lg font-black">{spotlightStudent.name}</h4>
                <p className="text-xs text-amber-100">
                  Roll #{spotlightStudent.rollNo} • {spotlightStudent.grade} ({spotlightStudent.section}) • Group {spotlightStudent.groupId}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSpotlightStudent(null)}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-xl text-xs font-bold text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedClass('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedClass === 'all'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              All Classes ({schoolStudents.length})
            </button>
            {availableGrades.map((g) => {
              const count = schoolStudents.filter((s) => s.grade === g).length;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedClass(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedClass === g
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {g} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or roll no..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class &amp; Section</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4 text-center">Completed</th>
                  <th className="py-3 px-4 text-center">Fluency</th>
                  <th className="py-3 px-4 text-right">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      {schoolStudents.length === 0
                        ? `No students registered yet for ${schoolName} (UDISE: ${udiseCode}). Students will appear here once registered under this school's UDISE code.`
                        : 'No students found matching your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const isPresent = presentStudentIds.has(student.id);
                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isPresent ? 'bg-white' : 'bg-slate-50/40 opacity-70'
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          {isPresent ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-4 ring-emerald-100" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {student.rollNo}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {student.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {student.grade} - {student.section}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-orange-100 text-orange-800">
                            Group {student.groupId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700">
                          {student.completedSituationIds?.length || 0}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600">
                          {student.speechFluencyScore || 85}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => toggleStudentAttendance(student.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isPresent
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                          >
                            {isPresent ? '✓ Present' : 'Mark Present'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClassroomDashboard;
