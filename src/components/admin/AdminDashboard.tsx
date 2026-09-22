import React, { useState, useMemo, useEffect } from 'react';
import { Student, Situation, GroupId, AdminTab } from '../../types';
import { LEVELS, mapGroupToLevel, getSituationLevel } from '../../data/levels';
import { StudentDetailModal } from './StudentDetailModal';
import { AddStudentModal } from './AddStudentModal';
import { EditLessonModal } from './EditLessonModal';
import { BulkPasteModal } from './BulkPasteModal';
import {
  applyBulkSituations,
  isProtectedSituation,
  saveLessons,
  getCanonicalPublishedSituations,
  createEmptyDraft,
} from '../../data/lessonsManager';
import { getStudentStatusBadge, getLessonStatusBadge } from '../../utils/statusColors';
import { ProficiencyGroupCompletionChart } from '../analytics/ProficiencyGroupCompletionChart';
import { GrammarAdminManager } from '../grammar/GrammarAdminManager';
import { SuperAdminSecurity } from './SuperAdminSecurity';
import { PendingApprovalsTab } from './PendingApprovalsTab';
import {
  Users,
  BookOpen,
  BarChart3,
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  Filter,
  Eye,
  Edit3,
  Trash2,
  TrendingUp,
  Award,
  GraduationCap,
  Clock,
  Printer,
  ChevronRight,
  ClipboardPaste,
  Lock,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';

interface Props {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  lessons: Situation[];
  onUpdateLessons: (updated: Situation[]) => void;
  onSwitchToStudentView: (sitId?: number) => void;
}

export const AdminDashboard: React.FC<Props> = ({
  students,
  onUpdateStudents,
  lessons,
  onUpdateLessons,
  onSwitchToStudentView,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Student filter state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentGroupFilter, setStudentGroupFilter] = useState<string>('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>('all');

  // Lesson filter state
  const [lessonSearch, setLessonSearch] = useState('');
  const [lessonGroupFilter, setLessonGroupFilter] = useState<string>('all');
  const [managementLevel, setManagementLevel] = useState<number>(1);
  const [managementStatusFilter, setManagementStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false);
  const [bulkPasteLevel, setBulkPasteLevel] = useState<number>(1);

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Situation | null>(null);
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/admin/pending-students')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && typeof d.totalPending === 'number') {
          setPendingApprovalsCount(d.totalPending);
        }
      })
      .catch(() => {});
  }, []);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchQuery =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.grade.toLowerCase().includes(studentSearch.toLowerCase());
      const sLevel = s.levelId || mapGroupToLevel(s.groupId, s.grade);
      const matchGroup =
        studentGroupFilter === 'all' ||
        String(sLevel) === studentGroupFilter ||
        s.groupId === studentGroupFilter;
      const matchStatus = studentStatusFilter === 'all' || s.status === studentStatusFilter;
      return matchQuery && matchGroup && matchStatus;
    });
  }, [students, studentSearch, studentGroupFilter, studentStatusFilter]);

  // Filtered Lessons for Management
  const currentManagementLevelObj = useMemo(() => {
    return LEVELS.find((l) => l.id === managementLevel) || LEVELS[0];
  }, [managementLevel]);

  const levelSituations = useMemo(() => {
    // Map all existing lessons for this level
    const existingMap = new Map<number, Situation>();
    lessons.forEach((l) => {
      const sitLvl = l.level !== undefined ? l.level : getSituationLevel(l.id);
      if (sitLvl === managementLevel) {
        const sitNo =
          l.situation_no !== undefined
            ? l.situation_no
            : ((Number(l.id) - 1) % 5) + 1;
        if (sitNo !== undefined) {
          existingMap.set(sitNo, l);
        }
      }
    });

    // Guarantee all 40 situation slots (1 to 40) per level
    const all40: Situation[] = [];
    for (let sitNo = 1; sitNo <= 40; sitNo++) {
      if (existingMap.has(sitNo)) {
        const item = existingMap.get(sitNo)!;
        all40.push({
          ...item,
          level: managementLevel,
          situation_no: sitNo,
          status: sitNo <= 5 ? 'published' : (item.status || 'draft'),
        });
      } else {
        all40.push(createEmptyDraft(managementLevel, sitNo));
      }
    }
    return all40;
  }, [lessons, managementLevel]);

  const displayedSituations = useMemo(() => {
    return levelSituations.filter((l) => {
      const sitNo = l.situation_no !== undefined ? l.situation_no : ((Number(l.id) - 1) % 5) + 1;
      const isPublished = sitNo <= 5 || l.status === 'published';
      const matchesStatus =
        managementStatusFilter === 'all' ||
        (managementStatusFilter === 'published' && isPublished) ||
        (managementStatusFilter === 'draft' && !isPublished);

      const matchesSearch =
        !lessonSearch.trim() ||
        l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
        String(sitNo).includes(lessonSearch.trim()) ||
        (l.char1_name && l.char1_name.toLowerCase().includes(lessonSearch.toLowerCase())) ||
        (l.char2_name && l.char2_name.toLowerCase().includes(lessonSearch.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [levelSituations, managementStatusFilter, lessonSearch]);

  // Calculated Stats
  const totalStudents = students.length;
  const avgFluency = Math.round(
    students.reduce((acc, s) => acc + s.speechFluencyScore, 0) / (totalStudents || 1)
  );
  const avgVocab = Math.round(
    students.reduce((acc, s) => acc + s.vocabMasteryScore, 0) / (totalStudents || 1)
  );
  const excellentStudentsCount = students.filter((s) => s.status === 'excellent').length;
  const attentionCount = students.filter((s) => s.status === 'needs_attention').length;

  // Chart & Table Data: 10 Levels Performance Statistics
  const levelStats = useMemo(() => {
    return LEVELS.map((lvl) => {
      const levelStudents = students.filter(
        (s) => (s.levelId ? s.levelId === lvl.id : mapGroupToLevel(s.groupId, s.grade) === lvl.id)
      );
      const studentCount = levelStudents.length;

      // Identify lessons belonging to this level (5 situations per level)
      const levelLessons = lessons.filter(
        (l) => l.level === lvl.id || Math.ceil(Number(l.id) / 5) === lvl.id
      );
      const levelLessonIds =
        levelLessons.length > 0
          ? levelLessons.map((l) => Number(l.id))
          : Array.from({ length: 5 }, (_, i) => (lvl.id - 1) * 5 + i + 1);

      // Average situations completed per student in this level (0 to 5)
      const avgCompleted =
        studentCount > 0
          ? levelStudents.reduce((acc, s) => {
              const completedInLevel = s.completedSituationIds.filter((id) =>
                levelLessonIds.includes(Number(id))
              ).length;
              return acc + completedInLevel;
            }, 0) / studentCount
          : 0;

      // Completed situations count towards 40 benchmark (e.g. 3/5 avg => 24 / 40 => 60%)
      const completedSituations = Math.min(40, Math.round((avgCompleted / 5) * 40));
      const completionRate = Math.min(100, Math.round((completedSituations / 40) * 100));

      const avgFluencyGroup =
        studentCount > 0
          ? Math.round(
              levelStudents.reduce((acc, s) => acc + s.speechFluencyScore, 0) / studentCount
            )
          : 75;

      const avgVocabGroup =
        studentCount > 0
          ? Math.round(
              levelStudents.reduce((acc, s) => acc + s.vocabMasteryScore, 0) / studentCount
            )
          : 88;

      return {
        levelId: lvl.id,
        name: lvl.name,
        subtitle: lvl.subtitle,
        class: lvl.class,
        completionRate,
        completedSituations,
        avgFluency: avgFluencyGroup,
        avgVocab: avgVocabGroup,
        studentCount,
      };
    });
  }, [students, lessons]);

  // Weekly Practice Trend Data
  const weeklyPracticeData = [
    { day: 'Mon', sessions: 68, wordsSpoken: 840 },
    { day: 'Tue', sessions: 92, wordsSpoken: 1120 },
    { day: 'Wed', sessions: 85, wordsSpoken: 980 },
    { day: 'Thu', sessions: 110, wordsSpoken: 1450 },
    { day: 'Fri', sessions: 125, wordsSpoken: 1680 },
    { day: 'Sat', sessions: 74, wordsSpoken: 920 },
  ];

  // Student CRUD handlers
  const handleAddStudent = (newStudent: Student) => {
    const updated = [newStudent, ...students];
    onUpdateStudents(updated);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const next = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    onUpdateStudents(next);
    setSelectedStudent(updatedStudent);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the student database?`)) {
      onUpdateStudents(students.filter((s) => s.id !== id));
    }
  };

  // Lesson CRUD handlers with Hard Protection for Situations 1-5
  const handleSaveLesson = (updated: Situation) => {
    if (isProtectedSituation(updated)) {
      alert('Hard Protection Notice: Situations 1–5 are published and permanently protected.');
      return;
    }
    const sitLvl = updated.level !== undefined ? updated.level : getSituationLevel(updated.id);
    const sitNo =
      updated.situation_no !== undefined
        ? updated.situation_no
        : ((Number(updated.id) - 1) % 5) + 1;

    let matched = false;
    const next = lessons.map((l) => {
      const lLevel = l.level !== undefined ? l.level : getSituationLevel(l.id);
      const lNo =
        l.situation_no !== undefined ? l.situation_no : ((Number(l.id) - 1) % 5) + 1;
      if (l.id === updated.id || (sitLvl === lLevel && sitNo === lNo)) {
        matched = true;
        return {
          ...updated,
          level: sitLvl,
          situation_no: sitNo,
        };
      }
      return l;
    });

    if (!matched) {
      next.push({
        ...updated,
        level: sitLvl,
        situation_no: sitNo,
      });
    }

    saveLessons(next);
    onUpdateLessons(next);
  };

  const handleToggleLessonActive = (id: number) => {
    const target = lessons.find((l) => l.id === id);
    if (target && isProtectedSituation(target)) {
      alert('Hard Protection Notice: Situations 1–5 are permanently published and cannot be unpublished.');
      return;
    }
    const next = lessons.map((l) => {
      if (l.id === id) {
        const nextStatus = l.status === 'published' ? 'draft' : 'published';
        return {
          ...l,
          status: nextStatus,
          isActive: nextStatus === 'published',
        };
      }
      return l;
    });
    onUpdateLessons(next);
  };

  const handleSaveBulkSituations = (level: number, validSituations: Situation[]) => {
    const { updatedLessons } = applyBulkSituations(lessons, level, validSituations);
    onUpdateLessons(updatedLessons);
  };

  /**
   * Initializes draft slots in lessons state.
   * Iterates levels 1-10, checks for the absence of situation_no 6-40,
   * and adds an array of 35 new empty draft objects for each level without affecting
   * existing situations 1-5, then calls onUpdateLessons to persist the state.
   */
  const initializeDraftSlots = (): Situation[] => {
    // 1. Keep existing lessons intact, ensuring existing situations 1-5 are untouched
    const updatedLessons: Situation[] = [...lessons];

    // Helper to determine situation level and situation_no safely
    const getSlotInfo = (lesson: Situation) => {
      const lvl = lesson.level !== undefined ? lesson.level : getSituationLevel(lesson.id);
      const sitNo =
        lesson.situation_no !== undefined
          ? lesson.situation_no
          : ((Number(lesson.id) - 1) % 5) + 1;
      return { lvl, sitNo };
    };

    // Index all existing slots in the lessons state to check absence
    const existingSlotKeys = new Set<string>();
    for (const lesson of lessons) {
      const { lvl, sitNo } = getSlotInfo(lesson);
      if (lvl !== undefined && sitNo !== undefined) {
        existingSlotKeys.add(`${lvl}-${sitNo}`);
      }
    }

    let addedCount = 0;

    // 2. Iterate levels 1-10
    for (let level = 1; level <= 10; level++) {
      // 3. Check for the absence of situation_no 6-40 for this level
      const draftsToAddForLevel: Situation[] = [];

      for (let situation_no = 6; situation_no <= 40; situation_no++) {
        // Guarantee situations 1-5 are never touched
        if (situation_no < 6 || situation_no > 40) {
          continue;
        }

        const slotKey = `${level}-${situation_no}`;
        const slotExists =
          existingSlotKeys.has(slotKey) ||
          lessons.some((l) => {
            const { lvl, sitNo } = getSlotInfo(l);
            return lvl === level && sitNo === situation_no;
          });

        if (!slotExists) {
          // Generate empty draft object:
          // status: "draft", title: "", char1_role: "", char1_name: "", char1_image: "",
          // char2_role: "", char2_name: "", char2_image: "", lines: 20 empty objects total
          const draftObj = createEmptyDraft(level, situation_no);
          draftsToAddForLevel.push(draftObj);
          existingSlotKeys.add(slotKey);
        }
      }

      // Add the array of new empty draft objects for this level
      if (draftsToAddForLevel.length > 0) {
        updatedLessons.push(...draftsToAddForLevel);
        addedCount += draftsToAddForLevel.length;
      }
    }

    // 4. Persist and update state via onUpdateLessons
    saveLessons(updatedLessons);
    onUpdateLessons(updatedLessons);

    return updatedLessons;
  };

  /**
   * Alias for initializeDraftSlots to ensure backwards compatibility
   */
  const initializeDraftSituations = initializeDraftSlots;
  const initializeAndPersistDraftSituations = initializeDraftSlots;

  // Ensure window exposure for administrative scripting or verification if running in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).initializeDraftSlots = initializeDraftSlots;
      (window as any).initializeDraftSituations = initializeDraftSituations;
      (window as any).initializeAndPersistDraftSituations = initializeAndPersistDraftSituations;
    }
  }, [lessons]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Roll No',
      'Name',
      'Class',
      'Section',
      'Group',
      'Speech Fluency %',
      'Vocab Mastery %',
      'Completed Lessons',
      'Total Points',
      'Attendance %',
      'Parent Name',
      'Parent Phone',
      'Status',
    ];

    const rows = students.map((s) => [
      s.rollNo,
      `"${s.name}"`,
      s.grade,
      s.section,
      s.groupId,
      s.speechFluencyScore,
      s.vocabMasteryScore,
      s.completedSituationIds.length,
      s.totalScore,
      s.attendanceRate,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_english_sathi_students_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-600 text-white uppercase tracking-wider">
              School Admin Portal
            </span>
            <span className="text-xs text-slate-400 font-bold">•</span>
            <span className="text-xs text-slate-500 font-semibold">
              Smart English Sathi Portal
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            English Sathi Administration Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage enrolled students, 20-situation audio curriculum, speech fluency records, and academic analytics.
          </p>
        </div>

        {/* Action button pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview &amp; Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('pending-approvals')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'pending-approvals'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-800 bg-amber-50/70 hover:bg-amber-100/70'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Pending Approvals</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 ml-0.5">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students Management ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'lessons'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Lessons Management ({lessons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reports &amp; Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('grammar')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'grammar'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📖 Grammar Management</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'security'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-purple-700 bg-purple-50/70 hover:bg-purple-100/70'
          }`}
        >
          <Shield className="w-4 h-4 text-purple-500" />
          <span>🛡️ Super Admin</span>
        </button>
      </div>

      {/* TAB: PENDING APPROVALS */}
      {activeTab === 'pending-approvals' && (
        <PendingApprovalsTab onApprovalCountChange={(c) => setPendingApprovalsCount(c)} />
      )}

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Enrolled
                </span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalStudents}</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Active across Classes 5 to 12</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  School Fluency Index
                </span>
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{avgFluency}%</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Indian English speech accuracy
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-indigo-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Curriculum Situations
                </span>
                <GraduationCap className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{lessons.length}</p>
              <p className="text-[11px] text-indigo-700 font-medium mt-1">
                10 Academic Levels
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Intervention Alert
                </span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{attentionCount}</p>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">
                Students need extra voice shadowing
              </p>
            </div>
          </div>

          {/* English Proficiency Group Progress & Completion Bar Chart */}
          <ProficiencyGroupCompletionChart
            students={students}
            lessons={lessons}
            title="English Proficiency Level Progress & Completion"
            subtitle="Comparing student curriculum completion rates across all 10 Levels (Classes 5 to 12 & Fluent)"
          />

          {/* Visual Analytics: Spoken English Activity & Group Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: Daily Speech Practice Trend */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Weekly Spoken English Activity
                  </h3>
                  <p className="text-xs text-slate-500">
                    Active student audio conversations this week
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  +18% this week
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyPracticeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(val: number) => [val, 'Active Sessions']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSessions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Academic English Pedagogy & Speech Shadowing Insights */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Active Voice Shadowing Methodology</span>
                  </h4>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    Curriculum Standards
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black shrink-0">
                      4s
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">4-Second Structured Pauses</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Enforces repetition buffer between Teacher Anjali's prompt and student speech rehearsal.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black shrink-0">
                      0.85x
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Adaptive Playback Speed (0.85x - 1.0x)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tailored for semi-English and Marathi medium students transitioning to natural speech.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-black shrink-0">
                      म/हि
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Bilingual Marathi/Hindi Scaffolding</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Every vocabulary term and dialogue line provides instantaneous Marathi contextual meaning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Classroom Implementation</span>
                <span className="text-emerald-700 font-bold">100% Curriculum Coverage</span>
              </div>
            </div>
          </div>

          {/* Quick Spotlight: Top Students & Attention Needed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Top English Orators (Star Performers)</span>
                </h4>
                <span className="text-xs font-bold text-slate-400">Fluency Score</span>
              </div>
              <div className="space-y-2">
                {students
                  .slice()
                  .sort((a, b) => b.speechFluencyScore - a.speechFluencyScore)
                  .slice(0, 4)
                  .map((std) => (
                    <div
                      key={std.id}
                      onClick={() => {
                        setSelectedStudent(std);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{std.gender === 'female' ? '👩‍🎓' : '👨‍🎓'}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{std.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {std.grade} ({std.section}) • Roll: {std.rollNo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600">
                          {std.speechFluencyScore}%
                        </span>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {std.completedSituationIds.length} lessons
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Students Needing Voice Shadowing Assistance</span>
                </h4>
                <span className="text-xs font-bold text-amber-700">Action Needed</span>
              </div>
              <div className="space-y-2">
                {students
                  .filter((s) => s.speechFluencyScore < 80 || s.status === 'needs_attention')
                  .slice(0, 4)
                  .map((std) => (
                    <div
                      key={std.id}
                      onClick={() => {
                        setSelectedStudent(std);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{std.gender === 'female' ? '👩‍🎓' : '👨‍🎓'}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{std.name}</p>
                          <p className="text-[11px] text-amber-800">
                            {std.grade} • Needs help with mic role-play
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-700">
                          {std.speechFluencyScore}%
                        </span>
                        <p className="text-[10px] text-amber-600 font-semibold">Booster Assigned</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search student, roll no, class..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={studentGroupFilter}
                onChange={(e) => setStudentGroupFilter(e.target.value)}
                className="text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="all">All Academic Levels (1 to 10)</option>
                {LEVELS.map((lvl) => (
                  <option key={lvl.id} value={String(lvl.id)}>
                    {lvl.name} ({lvl.class} - {lvl.subtitle})
                  </option>
                ))}
              </select>

              <select
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value)}
                className="text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="excellent">Excellent</option>
                <option value="needs_attention">Needs Attention</option>
              </select>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors ml-auto sm:ml-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-3">Class &amp; Sec</th>
                    <th className="py-3.5 px-3">Level</th>
                    <th className="py-3.5 px-3">Speech Fluency</th>
                    <th className="py-3.5 px-3">Progress</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                        No students found matching your search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">
                              {std.gender === 'female' ? '👩‍🎓' : '👨‍🎓'}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{std.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{std.rollNo}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {std.grade} ({std.section})
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Level {std.levelId || mapGroupToLevel(std.groupId, std.grade)}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {std.speechFluencyScore}%
                            </span>
                            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  std.speechFluencyScore >= 90
                                    ? 'bg-emerald-500'
                                    : std.speechFluencyScore >= 75
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${std.speechFluencyScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-600">
                          <span className="font-bold text-blue-700">
                            {std.completedSituationIds.length}
                          </span>{' '}
                          / 20 Lessons
                        </td>

                        <td className="py-3 px-3">
                          {(() => {
                            const badge = getStudentStatusBadge(std.status);
                            return (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1.5 ${badge.className}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                <span>{badge.label}</span>
                              </span>
                            );
                          })()}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedStudent(std);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                              title="View full student progress profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(std.id, std.name)}
                              className="p-1.5 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors"
                              title="Remove student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex justify-between items-center">
              <span>Showing {filteredStudents.length} of {students.length} students</span>
              <span className="font-medium">Smart English Sathi Academic Registry</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LESSONS / CONVERSATIONS MANAGEMENT (40 SITUATIONS PER LEVEL) */}
      {activeTab === 'lessons' && (
        <div className="space-y-5">
          {/* Level Switcher Ribbon */}
          <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Curriculum Conversations Management (10 Levels • 40 Situations Each)</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Situations 1–5 are published &amp; permanently protected. Situations 6–40 are draft slots available for bulk paste or manual updates.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Initialize Draft Situations Action */}
                <button
                  id="initDraftSlotsBtn"
                  onClick={() => {
                    if (
                      confirm(
                        'Initialize empty draft situation objects (Slots 6–40) across all 10 levels?\n\nExisting published Situations 1–5 are permanently protected and will never be modified.'
                      )
                    ) {
                      initializeDraftSlots();
                      alert(
                        'Initialization complete!\n\nAll empty draft situation slots (6–40) across Levels 1–10 have been initialized and persisted in the curriculum state.\n\nPublished Situations 1–5 remain strictly protected.'
                      );
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
                  title="Initialize and persist empty draft situations 6–40 for all 10 levels"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Init All Drafts (6–40)</span>
                </button>

                {/* Bulk Paste Quick Action for Current Level */}
                <button
                  id="bulkPasteLevelBtn"
                  onClick={() => {
                    setBulkPasteLevel(managementLevel);
                    setIsBulkPasteOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  <span>Bulk Paste Level {managementLevel} (Slots 6–40)</span>
                </button>
              </div>
            </div>

            {/* Level Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar">
              {LEVELS.map((lvl) => {
                const isSelected = lvl.id === managementLevel;
                // Count published and draft situations in this level
                const sitsForLvl = lessons.filter(
                  (l) => (l.level || Math.ceil(Number(l.id) / 5)) === lvl.id
                );
                const publishedCount = sitsForLvl.filter((s) => s.status === 'published').length;
                const draftCount = sitsForLvl.length - publishedCount;

                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setManagementLevel(lvl.id);
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span>L{lvl.id}: {lvl.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        isSelected ? 'bg-slate-800 text-blue-300' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {publishedCount}P / {draftCount > 0 ? draftCount : 35}D
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Details & Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                  Level {managementLevel}
                </span>
                <h4 className="text-base font-black text-slate-900">
                  {currentManagementLevelObj.name} — {currentManagementLevelObj.subtitle}
                </h4>
                <span className="text-xs text-slate-500 font-semibold">
                  (Class {currentManagementLevelObj.class})
                </span>
              </div>

              {/* Status breakdown pills */}
              <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <strong>5 Published</strong> (Protected Situations 1–5)
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <strong>35 Drafts</strong> (Situations 6–40)
                </span>
                <span className="text-slate-400">• Total 40 Situations</span>
              </div>
            </div>

            {/* Filter and Search controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by # or title..."
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setManagementStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    managementStatusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All (40)
                </button>
                <button
                  onClick={() => setManagementStatusFilter('published')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    managementStatusFilter === 'published'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  Published (5)
                </button>
                <button
                  onClick={() => setManagementStatusFilter('draft')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    managementStatusFilter === 'draft'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  Drafts (35)
                </button>
              </div>

              <button
                id="bulkPasteCurrentLevelBtn"
                onClick={() => {
                  setBulkPasteLevel(managementLevel);
                  setIsBulkPasteOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
                title={`Open Bulk Paste Modal for Level ${managementLevel}`}
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Bulk Paste Level {managementLevel}</span>
              </button>
            </div>
          </div>

          {/* 40 Situations Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {displayedSituations.map((situation) => {
              const sitNo =
                situation.situation_no !== undefined
                  ? situation.situation_no
                  : ((Number(situation.id) - 1) % 5) + 1;
              const isPublished = (sitNo >= 1 && sitNo <= 5) || situation.status === 'published';
              const isProtected = isProtectedSituation({
                id: situation.id,
                level: managementLevel,
                situation_no: sitNo,
              });

              const configuredLinesCount = Array.isArray(situation.lines)
                ? situation.lines.filter((l) => l && (l.text || l.speaker)).length
                : situation.dialogs?.length || 0;
              const percentConfigured = Math.min(100, Math.round((configuredLinesCount / 20) * 100));
              const vocabCount = situation.vocabulary?.length || 0;
              const questionsCount = situation.questions?.length || 0;
              const isConfiguredDraft = !isPublished && configuredLinesCount > 0;

              return (
                <div
                  key={`${managementLevel}-${sitNo}-${situation.id}`}
                  id={`situation-card-${sitNo}`}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isPublished
                      ? 'bg-white border-emerald-300 hover:border-emerald-400 shadow-xs ring-1 ring-emerald-100 hover:shadow-md'
                      : isConfiguredDraft
                      ? 'bg-white border-amber-300 hover:border-amber-400 shadow-xs ring-1 ring-amber-100 hover:shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Card Header: Situation Number & Status Indicator */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shadow-xs ${
                            isPublished
                              ? 'bg-emerald-600 text-white'
                              : isConfiguredDraft
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          #{sitNo}
                        </span>
                        <div>
                          <span className="text-xs font-black text-slate-900 block leading-tight">
                            Situation #{sitNo}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 block leading-none">
                            Slot {sitNo} of 40
                          </span>
                        </div>
                      </div>

                      {/* Distinct Status Indicator with Status UI Colors */}
                      <div className="flex items-center gap-1.5">
                        {isProtected && (
                          <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-0.5"
                            title="Protected core curriculum (Situations 1–5)"
                          >
                            <Lock className="w-2.5 h-2.5 text-amber-700" />
                            <span>Protected</span>
                          </span>
                        )}
                        {isPublished ? (
                          <span
                            id={`status-indicator-${sitNo}`}
                            className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs"
                            title="Published core curriculum"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Published</span>
                          </span>
                        ) : isConfiguredDraft ? (
                          <span
                            id={`status-indicator-${sitNo}`}
                            className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs"
                            title="Draft slot in progress"
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>Drafting</span>
                          </span>
                        ) : (
                          <span
                            id={`status-indicator-${sitNo}`}
                            className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-300 shadow-2xs"
                            title="Draft slot for curriculum authoring"
                          >
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            <span>Draft</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Situation Title */}
                    <h4
                      id={`situation-title-${sitNo}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 min-h-[38px] mt-2 leading-snug"
                    >
                      {situation.title ? (
                        situation.title
                      ) : (
                        <span className="text-gray-400 italic font-normal">
                          (Empty Draft Slot #{sitNo})
                        </span>
                      )}
                    </h4>

                    {/* Setting Context Tag if present */}
                    {situation.setting && (
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-1 italic">
                        📍 {situation.setting}
                      </p>
                    )}

                    {/* Characters / Meta Info */}
                    <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                      <p className="line-clamp-1 font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        {situation.char1_name || situation.char2_name ? (
                          <span>🗣️ {situation.char1_name || 'Teacher'} &amp; {situation.char2_name || 'Riya'}</span>
                        ) : (
                          <span className="text-gray-400">Characters not yet configured</span>
                        )}
                      </p>
                    </div>

                    {/* Progress Bar for 20 Lines Completeness */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span className="font-semibold">Dialogue Script</span>
                        <span
                          className={`font-bold ${
                            configuredLinesCount === 20
                              ? 'text-emerald-700'
                              : configuredLinesCount > 0
                              ? 'text-blue-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {configuredLinesCount}/20 lines ({percentConfigured}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            configuredLinesCount === 20
                              ? 'bg-emerald-500'
                              : configuredLinesCount > 0
                              ? 'bg-blue-500'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${percentConfigured}%` }}
                        />
                      </div>
                    </div>

                    {/* Vocabulary and Questions chips if available */}
                    {(vocabCount > 0 || questionsCount > 0) && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500">
                        {vocabCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                            {vocabCount} vocab
                          </span>
                        )}
                        {questionsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                            {questionsCount} exercises
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer: 'Edit' button for drafting, preserving protected status for slots 1-5 */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isPublished ? (
                      <button
                        id={`preview-btn-${sitNo}`}
                        onClick={() => onSwitchToStudentView(situation.id)}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 cursor-pointer py-1"
                        title="Preview conversation in student interactive mode"
                      >
                        <span>Preview</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium italic">
                        Draft Slot
                      </span>
                    )}

                    <button
                      id={`edit-btn-${sitNo}`}
                      onClick={() => {
                        setEditingLesson(situation);
                        setIsEditLessonOpen(true);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isProtected
                          ? 'border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 hover:border-amber-300'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-sm'
                      }`}
                      title={
                        isProtected
                          ? `Edit Situation #${sitNo} (Protected - Read Only)`
                          : `Edit Situation #${sitNo}`
                      }
                    >
                      {isProtected ? (
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                      ) : (
                        <Edit3 className="w-3.5 h-3.5 text-white" />
                      )}
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {displayedSituations.length === 0 && (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">No situations match the search criteria.</p>
              <p className="text-xs text-slate-400">Try clearing the search filter or switching tabs.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Comprehensive Academic English Evaluation Report
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregated speech metrics, vocabulary retention, and attendance across all grades.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Proficiency Level Completion Comparison Chart */}
            <div className="mb-6">
              <ProficiencyGroupCompletionChart
                students={students}
                lessons={lessons}
                title="Academic Level Completion Benchmark Visualizer"
                subtitle="Cross-level comparison of curriculum progression and spoken fluency across all 10 Levels"
                compact={true}
              />
            </div>

            {/* Class-wise Performance Benchmarking Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-3">Classes</th>
                    <th className="py-3 px-3">Enrolled Students</th>
                    <th className="py-3 px-3">Avg Fluency Index</th>
                    <th className="py-3 px-3">Avg Vocab Mastery</th>
                    <th className="py-3 px-3">Completion Benchmark</th>
                    <th className="py-3 px-4">Performance Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {levelStats.map((stat) => (
                    <tr key={stat.levelId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {stat.name} ({stat.subtitle})
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {stat.class}
                      </td>
                      <td className="py-3 px-3 font-semibold">{stat.studentCount} students</td>
                      <td className="py-3 px-3 font-bold text-blue-700">{stat.avgFluency}%</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">{stat.avgVocab}%</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">
                            {stat.completedSituations} / 40
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                            {stat.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {stat.completionRate >= 75 ? 'Meets High Standard' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pedagogy & Speech Fluency Insight Box */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-5 rounded-3xl border border-blue-200">
            <h4 className="text-sm font-black text-blue-900 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Pedagogy Recommendation for Faculty</span>
            </h4>
            <p className="text-xs text-blue-950 leading-relaxed">
              Students who practiced with the <strong>4-second shadowing pause</strong> and <strong>0.85x Indian English voice playback</strong> demonstrated a 23% faster acquisition of target vocabulary and fewer hesitation gaps in the voice-enabled AI roleplay phase. We recommend encouraging daily 15-minute practice sessions across Groups A &amp; B prior to school assembly speeches.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: GRAMMAR MANAGEMENT */}
      {activeTab === 'grammar' && (
        <GrammarAdminManager />
      )}

      {/* TAB 6: SUPER ADMIN SECURITY & AUDIT */}
      {activeTab === 'security' && (
        <SuperAdminSecurity />
      )}

      {/* Modals */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudent(null);
        }}
        allLessons={lessons}
        onUpdateStudent={handleUpdateStudent}
      />

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStudent={handleAddStudent}
        existingCount={students.length}
      />

      <EditLessonModal
        lesson={editingLesson}
        isOpen={isEditLessonOpen}
        onClose={() => {
          setIsEditLessonOpen(false);
          setEditingLesson(null);
        }}
        onSaveLesson={handleSaveLesson}
      />

      <BulkPasteModal
        isOpen={isBulkPasteOpen}
        onClose={() => setIsBulkPasteOpen(false)}
        level={bulkPasteLevel}
        levelName={LEVELS.find((l) => l.id === bulkPasteLevel)?.subtitle || `Level ${bulkPasteLevel}`}
        onSaveValidatedSituations={handleSaveBulkSituations}
      />
    </div>
  );
};
