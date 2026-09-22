import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GROUPS } from './data/situations';
import { LEVELS, getSituationLevel } from './data/levels';
import { GroupId, Situation, AppRole, Student, AchievementBadge, DailyStreakData, AuthUser, Level } from './types';
import { SceneIllustrationCard } from './components/CharacterAvatars';
import { AvatarShowcaseModal } from './components/AvatarShowcaseModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { WatchListenStage } from './components/WatchListenStage';
import { WriteVocabStage } from './components/WriteVocabStage';
import { RolePlayStage } from './components/RolePlayStage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { PrincipalDashboard } from './components/principal/PrincipalDashboard';
import { ClassroomDashboard } from './components/dashboard/ClassroomDashboard';
import { BadgesShelf } from './components/badges/BadgesShelf';
import { MilestoneCelebrationModal } from './components/badges/MilestoneCelebrationModal';
import { BadgesGalleryModal } from './components/badges/BadgesGalleryModal';
import { DailyStreakCard } from './components/streak/DailyStreakCard';
import { DailyStreakModal } from './components/streak/DailyStreakModal';
import { DailyStreakBadge } from './components/streak/DailyStreakBadge';
import { LoginScreen } from './components/auth/LoginScreen';
import { AdminLoginScreen } from './components/auth/AdminLoginScreen';
import { SchoolRegister } from './components/auth/SchoolRegister';
import { SwitchRoleModal } from './components/auth/SwitchRoleModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { LockedLevelModal } from './components/modals/LockedLevelModal';
import { getStoredAuthUser, clearAuthUser } from './data/authConfig';
import { loadDailyStreak, recordDailySituationPractice, resetDailyStreak } from './utils/streak';
import { ALL_BADGES, isBadgeUnlocked } from './data/badges';
import { getStudentCompletedGrammarLevels, calculateStudentGrammarSummary } from './data/grammar/grammarManager';
import { getStoredStudents, saveStudents } from './data/mockStudents';
import { getStoredLessons, saveLessons, filterPublishedLessons } from './data/lessonsManager';
import { getSavedVoicePrefs, saveVoicePrefs } from './utils/speech';
import { AudioUnlockOverlay } from './components/audio/AudioUnlockOverlay';
import { AudioTestScreen } from './components/audio/AudioTestScreen';
import { isAudioUnlocked, subscribeAudioUnlocked } from './utils/audioUnlocker';
import { SituationCard } from './components/SituationCard';
import { GrammarStage } from './components/grammar/GrammarStage';
import { VisualProgressRoadmap } from './components/progress/VisualProgressRoadmap';
import {
  ChevronRight,
  ChevronLeft,
  Headphones,
  PenTool,
  MessageSquareText,
  Lock,
  BookOpen,
  Compass,
  Star,
  Award,
  Users,
  Sliders,
  ShieldCheck,
  Briefcase,
  School,
  LogOut,
  KeyRound,
  Volume2,
  VolumeX,
  Menu,
  X,
} from 'lucide-react';
import './dashboard-light.css';

let currentUtterance: SpeechSynthesisUtterance | null = null;
let isConversationActive = false;

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [switchTargetRole, setSwitchTargetRole] = useState<AppRole | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [lockedLevelModalTarget, setLockedLevelModalTarget] = useState<Level | null>(null);
  const [isLockedLevelModalOpen, setIsLockedLevelModalOpen] = useState<boolean>(false);

  const isSuperAdmin = useMemo(() => {
    return Boolean(
      authUser?.isSuperAdmin ||
      authUser?.roleType === 'super_admin' ||
      authUser?.name?.toLowerCase().includes('super') ||
      authUser?.identifier?.toLowerCase().includes('super') ||
      authUser?.title?.toLowerCase().includes('super admin')
    );
  }, [authUser]);

  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('admin') || window.location.hash.includes('admin');
    }
    return false;
  });

  useEffect(() => {
    const handleCheckAdmin = () => {
      setIsAdminMode(
        window.location.search.includes('admin') || window.location.hash.includes('admin')
      );
    };
    window.addEventListener('popstate', handleCheckAdmin);
    window.addEventListener('hashchange', handleCheckAdmin);
    return () => {
      window.removeEventListener('popstate', handleCheckAdmin);
      window.removeEventListener('hashchange', handleCheckAdmin);
    };
  }, []);

  // SPA Route Path state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      // Also update admin mode if applicable
      setIsAdminMode(
        path.includes('admin') ||
        window.location.search.includes('admin') ||
        window.location.hash.includes('admin')
      );
      if (path === '/audio-test' || window.location.hash === '#audio-test') {
        setIsAudioTestOpen(true);
      } else {
        setIsAudioTestOpen(false);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname || '/';
        setCurrentPath(path);
        setIsAdminMode(
          path.includes('admin') ||
          window.location.search.includes('admin') ||
          window.location.hash.includes('admin')
        );
        if (path === '/audio-test' || window.location.hash === '#audio-test') {
          setIsAudioTestOpen(true);
        } else {
          setIsAudioTestOpen(false);
        }
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Audio Unlock state & Audio Test Screen (/audio-test) for Interactive Board / Android WebView
  const [isAudioUnlockedState, setIsAudioUnlockedState] = useState<boolean>(() => isAudioUnlocked());
  const [isAudioTestOpen, setIsAudioTestOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === '/audio-test' || window.location.hash === '#audio-test';
    }
    return false;
  });

  useEffect(() => {
    const unsubscribe = subscribeAudioUnlocked((unlocked) => {
      setIsAudioUnlockedState(unlocked);
    });

    const handleLocationCheck = () => {
      if (window.location.pathname === '/audio-test' || window.location.hash === '#audio-test') {
        setIsAudioTestOpen(true);
      }
    };

    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);

    return () => {
      unsubscribe();
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  const [role, setRole] = useState<AppRole>(() => {
    const storedAuth = getStoredAuthUser();
    if (storedAuth?.role) return storedAuth.role;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smart_english_app_role') || localStorage.getItem('mvm_kenedi_app_role');
      if (saved === 'admin' || saved === 'principal' || saved === 'student' || saved === 'classroom') {
        return saved;
      }
    }
    return 'student';
  });

  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [lessons, setLessons] = useState<Situation[]>(() => getStoredLessons());

  const [curLevel, setCurLevel] = useState<number>(1);
  const [curSitId, setCurSitId] = useState<number>(1);
  const [curStage, setCurStage] = useState<number>(1);
  const [isAvatarsModalOpen, setIsAvatarsModalOpen] = useState<boolean>(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);
  const [isBadgeGalleryOpen, setIsBadgeGalleryOpen] = useState<boolean>(false);
  const [celebratingBadge, setCelebratingBadge] = useState<AchievementBadge | null>(null);

  // Daily Streak State for consecutive days practiced
  const [streak, setStreak] = useState<DailyStreakData>(() => loadDailyStreak());
  const [isStreakModalOpen, setIsStreakModalOpen] = useState<boolean>(false);
  const [streakCelebration, setStreakCelebration] = useState<string | null>(null);

  // Track badges that have already shown their celebration modal
  const [celebratedBadgeIds, setCelebratedBadgeIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smart_celebrated_badges') || localStorage.getItem('mvm_celebrated_badges');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  // Voice speed and 4-second pause state
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    return getSavedVoicePrefs().speed || 0.85;
  });
  const [pauseSeconds, setPauseSeconds] = useState<number>(() => {
    const prefs = getSavedVoicePrefs();
    return typeof prefs.pauseDurationSeconds === 'number' ? prefs.pauseDurationSeconds : 4;
  });

  const [totalScore, setTotalScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('riya_anjali_score');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [completedSitIds, setCompletedSitIds] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('riya_anjali_completed');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  // Grammar progress refresh trigger & completed levels
  const [grammarRefreshKey, setGrammarRefreshKey] = useState<number>(0);
  const activeStudentId = authUser?.identifier || 'std-101';
  const completedGrammarLevels = useMemo(() => {
    return getStudentCompletedGrammarLevels(activeStudentId);
  }, [activeStudentId, grammarRefreshKey]);

  // Calculate unlocked badges count across situations and grammar levels
  const unlockedBadgesCount = useMemo(() => {
    return ALL_BADGES.filter((b) =>
      isBadgeUnlocked(b, completedSitIds.size, totalScore, completedGrammarLevels)
    ).length;
  }, [completedSitIds.size, totalScore, completedGrammarLevels]);

  // Visual Progress Roadmap Modal state
  const [isRoadmapOpen, setIsRoadmapOpen] = useState<boolean>(false);

  // Monitor and trigger celebration for newly unlocked milestone or grammar badges
  useEffect(() => {
    // Only check if we are in student mode or during active progress
    const newlyUnlocked = ALL_BADGES.filter(
      (b) =>
        isBadgeUnlocked(b, completedSitIds.size, totalScore, completedGrammarLevels) &&
        !celebratedBadgeIds.has(b.id)
    );

    if (newlyUnlocked.length > 0) {
      // Prioritize newly unlocked grammar badges or milestone badges
      const badgeToCelebrate =
        newlyUnlocked.find((b) => b.category === 'grammar') ||
        newlyUnlocked.find((b) => b.category === 'milestone') ||
        newlyUnlocked[0];

      setCelebratingBadge(badgeToCelebrate);

      setCelebratedBadgeIds((prev) => {
        const next = new Set([...prev, ...newlyUnlocked.map((b) => b.id)]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_celebrated_badges', JSON.stringify(Array.from(next)));
        }
        return next;
      });
    }
  }, [completedSitIds.size, totalScore, celebratedBadgeIds, completedGrammarLevels]);

  // Persist role
  const handleRoleChange = (newRole: AppRole) => {
    setRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_english_app_role', newRole);
    }
    // When switching to student view, verify that active situation is published
    if (newRole === 'student') {
      const isCurPublished = publishedLessons.some(
        (s) => s.id === curSitId && s.status === 'published'
      );
      if (!isCurPublished && publishedLessons.length > 0) {
        const firstInCurLevel = publishedLessons.find(
          (s) => (s.level || getSituationLevel(s.id)) === curLevel && s.status === 'published'
        );
        setCurSitId(firstInCurLevel ? firstInCurLevel.id : publishedLessons[0].id);
      }
    }
  };

  // Persist score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('riya_anjali_score', totalScore.toString());
    }
  }, [totalScore]);

  // Persist completed situations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'riya_anjali_completed',
        JSON.stringify(Array.from(completedSitIds))
      );
    }
  }, [completedSitIds]);

  const handleUpdateStudents = (updated: Student[]) => {
    setStudents(updated);
    saveStudents(updated);
  };

  const handleUpdateSingleStudent = (updatedStudent: Student) => {
    const next = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(next);
    saveStudents(next);
  };

  const handleUpdateLessons = (updated: Situation[]) => {
    setLessons(updated);
    saveLessons(updated);
  };

  // Student Lessons Filter: Students strictly only see status === 'published'
  const publishedLessons = useMemo(() => {
    return filterPublishedLessons(lessons);
  }, [lessons]);

  // Overall Curriculum Progress calculation
  const overallGrammarSummary = useMemo(() => {
    return calculateStudentGrammarSummary(activeStudentId);
  }, [activeStudentId, grammarRefreshKey]);

  const overallSituationsPercent = Math.round(
    (completedSitIds.size / (publishedLessons.length || 50)) * 100
  );
  const overallGrammarPercent = overallGrammarSummary.overallProgressPercent;
  const overallCurriculumPercent = Math.round(
    (overallSituationsPercent * 0.5) + (overallGrammarPercent * 0.5)
  );

  const currentSituation: Situation = useMemo(() => {
    // In student view, strictly ensure the situation is published
    const match = publishedLessons.find((s) => s.id === curSitId && s.status === 'published');
    if (match) return match;

    // Fallback to first published situation in current level
    const firstInCurLevel = publishedLessons.find(
      (s) => (s.level || getSituationLevel(s.id)) === curLevel && s.status === 'published'
    );
    if (firstInCurLevel) return firstInCurLevel;

    // Fallback to absolute first published situation
    return publishedLessons[0] || lessons[0];
  }, [publishedLessons, curSitId, curLevel, lessons]);

  const handleLevelSelect = (lvlId: number) => {
    // 2. When user clicks ANY new conversation / scenario button, FIRST do:
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stops all TTS immediately
    }
    if (currentUtterance) currentUtterance = null;
    isConversationActive = false;

    // Locked level modal trigger for students
    if (role === 'student' && isLevelLocked(lvlId)) {
      const targetLvl = LEVELS.find((l) => l.id === lvlId) || null;
      setLockedLevelModalTarget(targetLvl);
      setIsLockedLevelModalOpen(true);
      return;
    }

    setCurLevel(lvlId);
    // Student lesson selection: strictly verify status === 'published'
    const firstInLevel = publishedLessons.find(
      (s) => (s.level || getSituationLevel(s.id)) === lvlId && s.status === 'published'
    );
    if (firstInLevel) {
      setCurSitId(firstInLevel.id);
    } else if (publishedLessons.length > 0) {
      // If this level has no published situations yet, keep selection on a published lesson
      setCurSitId(publishedLessons[0].id);
    }
  };

  const handleSituationSelect = (sitId: number) => {
    // 2. When user clicks ANY new conversation / scenario button, FIRST do:
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stops all TTS immediately
    }
    if (currentUtterance) currentUtterance = null;
    isConversationActive = false;

    const sit = lessons.find((s) => s.id === sitId);
    if (!sit) return;

    // Strict student guard: verify status === 'published' to keep draft situations invisible to students
    if (role === 'student' && sit.status !== 'published') {
      console.warn(`[Student Mode] Situation #${sitId} is a draft and cannot be viewed by students.`);
      return;
    }

    setCurSitId(sitId);
    const sitLvl = sit.level || getSituationLevel(sitId);
    if (sitLvl !== curLevel) {
      setCurLevel(sitLvl);
    }
  };

  const handleStageSelect = (stageNum: number) => {
    // 4. Also when user clicks second conversation / stage tabs, always cancel TTS
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentUtterance) currentUtterance = null;
    isConversationActive = false;
    setCurStage(stageNum);
  };

  const handleSwitchToStudentView = (sitId?: number) => {
    if (sitId) {
      const target = lessons.find((s) => s.id === sitId);
      // Strictly verify status === 'published' before selecting for student view
      if (target && target.status === 'published') {
        handleSituationSelect(sitId);
      } else {
        const targetLvl = target?.level || getSituationLevel(sitId);
        const fallback =
          publishedLessons.find(
            (s) => (s.level || getSituationLevel(s.id)) === targetLvl && s.status === 'published'
          ) || publishedLessons[0];
        if (fallback) {
          setCurSitId(fallback.id);
          setCurLevel(fallback.level || getSituationLevel(fallback.id));
        }
      }
    }
    handleRoleChange('student');
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setRole(user.role);
    localStorage.setItem('smart_english_app_role', user.role);
    if (user.role === 'classroom') {
      navigateTo('/classroom');
    }
  };

  const handleLogout = () => {
    clearAuthUser();
    setAuthUser(null);
    navigateTo('/');
  };

  const handleRequestSwitchRole = (targetRole: AppRole) => {
    if (targetRole === role) return;
    setSwitchTargetRole(targetRole);
  };

  const handleSwitchSuccess = (newUser: AuthUser) => {
    setAuthUser(newUser);
    setRole(newUser.role);
    setSwitchTargetRole(null);
  };

  const handlePracticeRecorded = (situationId?: number) => {
    const sitToRecord = situationId || curSitId;
    const { updatedStreak, isNewPracticeToday } = recordDailySituationPractice(sitToRecord);
    setStreak(updatedStreak);

    if (isNewPracticeToday) {
      setStreakCelebration(
        `🔥 Daily Streak Extended! ${updatedStreak.currentStreak} Days Consecutive Practice!`
      );
      setTimeout(() => setStreakCelebration(null), 4500);
    }
  };

  const handleResetStreak = () => {
    const reset = resetDailyStreak();
    setStreak(reset);
  };

  const handleScoreEarned = (points: number) => {
    setTotalScore((prev) => prev + points);
    setCompletedSitIds((prev) => new Set([...prev, curSitId]));
    handlePracticeRecorded(curSitId);

    // Also sync Riya Sharma's mock student profile if present
    setStudents((prev) => {
      const next = prev.map((s) => {
        if (s.id === 'std-101' || s.name === 'Riya Sharma') {
          const newCompleted = Array.from(new Set([...s.completedSituationIds, curSitId]));
          return {
            ...s,
            completedSituationIds: newCompleted,
            totalScore: s.totalScore + points,
            lastActiveDate: new Date().toISOString().split('T')[0],
          };
        }
        return s;
      });
      saveStudents(next);
      return next;
    });
  };

  const activeLevel = LEVELS.find((l) => l.id === curLevel) || LEVELS[0];
  const levelSituations = useMemo(() => {
    return publishedLessons.filter(
      (s) => (s.level || getSituationLevel(s.id)) === curLevel
    );
  }, [publishedLessons, curLevel]);

  const handlePrevSituation = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentUtterance) currentUtterance = null;
    isConversationActive = false;

    const currentIndex = levelSituations.findIndex((s) => s.id === curSitId);
    if (currentIndex > 0) {
      handleSituationSelect(levelSituations[currentIndex - 1].id);
    } else {
      // Jump to previous level if available
      const globalIndex = publishedLessons.findIndex((s) => s.id === curSitId);
      if (globalIndex > 0) {
        handleSituationSelect(publishedLessons[globalIndex - 1].id);
      }
    }
  };

  const handleNextSituation = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentUtterance) currentUtterance = null;
    isConversationActive = false;

    const currentIndex = levelSituations.findIndex((s) => s.id === curSitId);
    if (currentIndex >= 0 && currentIndex < levelSituations.length - 1) {
      handleSituationSelect(levelSituations[currentIndex + 1].id);
    } else {
      // Jump to next level if available
      const globalIndex = publishedLessons.findIndex((s) => s.id === curSitId);
      if (globalIndex >= 0 && globalIndex < publishedLessons.length - 1) {
        handleSituationSelect(publishedLessons[globalIndex + 1].id);
      }
    }
  };

  const completedLevelsCount = useMemo(() => {
    return LEVELS.filter((lvl) => {
      const lvlSits = publishedLessons.filter(
        (s) => (s.level || getSituationLevel(s.id)) === lvl.id
      );
      return lvlSits.length > 0 && lvlSits.every((s) => completedSitIds.has(s.id));
    }).length;
  }, [publishedLessons, completedSitIds]);

  const isLevelLocked = (lvlId: number) => {
    if (lvlId <= 1) return false;
    const prevLevelSits = publishedLessons.filter(
      (s) => (s.level || getSituationLevel(s.id)) === lvlId - 1
    );
    const requiredInPrev = Math.max(1, Math.min(3, prevLevelSits.length || 3));
    const completedInPrev = prevLevelSits.filter((s) => completedSitIds.has(s.id)).length;
    return completedInPrev < requiredInPrev;
  };

  // Active route key calculation for smooth animated page transitions
  const isRegisterRoute =
    currentPath === '/register' ||
    currentPath === '/school-register' ||
    (typeof window !== 'undefined' &&
      (window.location.pathname === '/register' ||
        window.location.pathname === '/school-register' ||
        window.location.hash === '#register' ||
        window.location.hash === '#school-register'));

  const isClassroomRoute =
    currentPath === '/classroom' ||
    (typeof window !== 'undefined' &&
      (window.location.pathname === '/classroom' ||
        window.location.hash === '#classroom'));

  const isSecretAdminRoute =
    currentPath === '/stc-admin-secure-2026' ||
    (typeof window !== 'undefined' &&
      (window.location.pathname === '/stc-admin-secure-2026' ||
        window.location.pathname.startsWith('/stc-admin-secure-2026') ||
        window.location.hash === '#stc-admin-secure-2026' ||
        window.location.hash === '#/stc-admin-secure-2026' ||
        window.location.hash.startsWith('#stc-admin-secure-2026')));

  const isAdminRoute =
    currentPath === '/admin' ||
    (typeof window !== 'undefined' &&
      (window.location.pathname === '/admin' ||
        window.location.hash === '#admin'));

  // Protect /admin: if not admin role redirect to /
  useEffect(() => {
    if (isAdminRoute) {
      const isUserAdmin = authUser && (authUser.role === 'admin' || authUser.roleType === 'super_admin');
      if (!isUserAdmin) {
        console.warn('[Security Guard] Unauthorized access to /admin. Redirecting to home.');
        navigateTo('/');
      }
    }
  }, [isAdminRoute, authUser]);

  const defaultClassroomUser: AuthUser = useMemo(() => ({
    role: 'classroom',
    roleType: 'classroom',
    name: 'Classroom Group Practice',
    marathiName: 'वर्ग सामूहिक सराव (स्मार्ट बोर्ड)',
    identifier: 'classroom@smartenglish.edu',
    title: 'Classroom Whole-Class Practice • UDISE 27330308103',
    avatar: '🏫',
    udiseCode: '27330308103',
    schoolName: 'Smart English Sathi Model School',
    loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }), []);

  useEffect(() => {
    if (isClassroomRoute && !authUser) {
      setAuthUser(defaultClassroomUser);
      setRole('classroom');
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_english_app_role', 'classroom');
        localStorage.setItem('role', 'classroom');
      }
    }
  }, [isClassroomRoute, authUser, defaultClassroomUser]);

  const activeRouteKey = isAudioTestOpen
    ? 'audio-test'
    : isRegisterRoute
    ? 'school-register'
    : isSecretAdminRoute
    ? 'secret-admin-login'
    : isClassroomRoute || role === 'classroom'
    ? 'classroom-dashboard'
    : !authUser
    ? 'login-portal'
    : `app-dashboard-${role}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeRouteKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full min-h-screen"
      >
        {isAudioTestOpen ? (
          <AudioTestScreen
            onBackToApp={() => {
              setIsAudioTestOpen(false);
              if (window.location.pathname === '/audio-test') {
                navigateTo('/');
              } else if (window.location.hash === '#audio-test') {
                window.location.hash = '';
              }
            }}
          />
        ) : isRegisterRoute ? (
          <SchoolRegister
            onNavigateHome={() => {
              setIsAdminMode(false);
              navigateTo('/');
            }}
            onRegisterSuccess={() => {
              navigateTo('/');
            }}
          />
        ) : isSecretAdminRoute ? (
          <SuperAdminDashboard
            initialAuthUser={authUser}
            onLoginSuccess={(adminUser) => {
              handleLoginSuccess(adminUser);
            }}
            onLogout={() => {
              handleLogout();
              navigateTo('/');
            }}
            onNavigateHome={() => navigateTo('/')}
            onNavigateClassroom={() => navigateTo('/classroom')}
            students={students}
            onUpdateStudents={setStudents}
          />
        ) : !authUser && !isClassroomRoute ? (
          <>
            <AudioUnlockOverlay
              onUnlocked={() => setIsAudioUnlockedState(true)}
              onOpenAudioTest={() => {
                setIsAudioTestOpen(true);
                window.location.hash = '#audio-test';
              }}
            />
            <LoginScreen
              onLoginSuccess={handleLoginSuccess}
              initialRole={role}
              isAdminMode={false}
              onNavigateRegister={() => navigateTo('/register')}
            />
          </>
        ) : (
          <div className="dashboard-light-theme min-h-screen bg-[#F8F9FC] text-[#1E293B] flex flex-col font-sans selection:bg-blue-200">
            {/* Interactive Smart Board Audio Unlock Overlay */}
            <AudioUnlockOverlay
              onUnlocked={() => setIsAudioUnlockedState(true)}
              onOpenAudioTest={() => {
                setIsAudioTestOpen(true);
                window.location.hash = '#audio-test';
              }}
            />

      {/* App Header with Clean Role Navigation, Streak Counter & Auth Profile */}
      <header className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-xs px-3 sm:px-6 py-2.5 w-full max-w-full">
        <div className="w-full max-w-full md:max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Top bar on mobile / Left group */}
          <div className="flex items-center justify-between gap-2 w-full md:w-auto">
            {/* Logo and title */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg sm:text-xl shadow-xs shrink-0">
                🗣️
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-blue-700 flex items-center gap-1.5 truncate">
                  <span>Smart English Sathi</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-medium truncate hidden min-[400px]:block">
                  Spoken English Platform
                </p>
              </div>
            </div>

            {/* Mobile Drawer Menu Toggle Button */}
            <button
              id="mobileMenuToggleBtn"
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer shrink-0"
              title="Open Controls & Drawer"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Right badging, Voice settings, Avatar trigger, User profile & Score counter (Desktop) */}
          <div className="hidden md:flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
            {/* Authenticated User Badge & Logout */}
            {authUser && (
              <div
                id="headerUserBadge"
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs shadow-2xs shrink-0"
                title={`Logged in as: ${authUser.name} (${authUser.title})`}
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-sm">
                  {authUser.avatar}
                </span>
                <div className="flex flex-col text-left leading-tight hidden lg:flex">
                  <span className="font-black text-slate-800 text-[11px] truncate max-w-[95px]">
                    {authUser.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    {authUser.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  id="headerChangePasswordBtn"
                  className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors ml-0.5 cursor-pointer"
                  title="Change Secured Password / पासवर्ड बदला"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  id="headerLogoutBtn"
                  className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-0.5 cursor-pointer"
                  title="Lock Session & Switch Role / बाहेर पड"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Interactive Board Audio Status & Test Screen Trigger */}
            <button
              type="button"
              onClick={() => {
                setIsAudioTestOpen(true);
                window.location.hash = '#audio-test';
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-colors cursor-pointer ${
                isAudioUnlockedState
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400 animate-pulse'
              }`}
              title={
                isAudioUnlockedState
                  ? 'Interactive Board Audio is Active • Click to run Audio Test Screen'
                  : 'Audio Blocked in WebView • Tap to Enable Sound'
              }
            >
              {isAudioUnlockedState ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-amber-700" />
              )}
              <span className="hidden sm:inline">Sound:</span>
              <span>{isAudioUnlockedState ? 'Active' : 'Tap to Enable'}</span>
            </button>

            {/* Voice Speed & 4s Pause Quick Controller */}
            <button
              type="button"
              onClick={() => setIsVoiceSettingsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs transition-colors cursor-pointer"
              title="Adjust Voice Speed, 4s Pause & Real Indian Accent"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-mono">🇮🇳 {playbackSpeed.toFixed(2)}x</span>
              <span className="hidden lg:inline">• {pauseSeconds}s</span>
            </button>

            {/* AI Avatars Button */}
            <button
              type="button"
              onClick={() => setIsAvatarsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
              title="View AI Teacher & Student Avatars"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Avatars</span>
            </button>

            {/* Achievement Badges Trigger */}
            <button
              type="button"
              onClick={() => setIsBadgeGalleryOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs transition-colors cursor-pointer"
              title="View Achievement Badges & Milestones"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Badges</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950 font-black text-[10px]">
                {unlockedBadgesCount}
              </span>
            </button>

            {/* Visual Progress Roadmap Trigger (for student) */}
            {role === 'student' && (
              <button
                type="button"
                onClick={() => setIsRoadmapOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs transition-colors cursor-pointer"
                title="Open Visual Progress Roadmap / दृश्य प्रगती नकाशा"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Progress</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-black text-[10px]">
                  {overallCurriculumPercent}%
                </span>
              </button>
            )}

            {/* Student Status Group: Daily Streak Counter & Star Score Counter */}
            {role === 'student' ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {streak && (
                  <DailyStreakBadge
                    streak={streak}
                    onClick={() => setIsStreakModalOpen(true)}
                  />
                )}

                <div
                  id="headerScore"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs shrink-0"
                  title="Total Score Points"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{totalScore} pts</span>
                </div>
              </div>
            ) : role === 'classroom' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-orange-900 border border-orange-300 shadow-2xs shrink-0">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>Classroom Practice</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="capitalize">{role} Mode</span>
              </div>
            )}

            {/* If logged in as Classroom Teacher but in student practice view, show Back to Classroom Hub button */}
            {authUser?.role === 'classroom' && role !== 'classroom' && (
              <button
                type="button"
                id="btnReturnToClassroom"
                onClick={() => {
                  handleRoleChange('classroom');
                  navigateTo('/classroom');
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <School className="w-3.5 h-3.5" />
                <span>Classroom Hub</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Drawer Overlay */}
        {isDrawerOpen && (
          <div
            id="mobileDrawerOverlay"
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
          />
        )}

        {/* Fixed Right Drawer / Sidebar with bg-slate-900 */}
        <div
          id="mobileHeaderDrawer"
          className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-slate-900 text-white z-40 p-5 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗣️</span>
                <div>
                  <h3 className="font-black text-sm text-white">Smart English Sathi</h3>
                  <p className="text-[10px] text-slate-400">Controls &amp; Navigation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Mode Status Badge in Drawer */}
            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Active Mode</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="capitalize">{role} Mode</span>
              </div>
            </div>

            {/* Super Admin Switcher in Drawer - ONLY 2 tabs */}
            {isSuperAdmin && (
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2">
                <span className="text-xs text-slate-400 font-medium block">Dashboard Navigation</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleRoleChange('principal');
                      setIsDrawerOpen(false);
                    }}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'principal' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Principal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleRoleChange('admin');
                      setIsDrawerOpen(false);
                    }}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'admin' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>
            )}

            {/* Authenticated User in Drawer */}
            {authUser && (
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-base">
                    {authUser.avatar}
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white text-xs">{authUser.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{authUser.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setIsChangePasswordModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-700 cursor-pointer"
                    title="Change Password"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      handleLogout();
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Controls List in Mobile Drawer */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsAudioTestOpen(true);
                  window.location.hash = '#audio-test';
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Audio System</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isAudioUnlockedState ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300 animate-pulse'
                }`}>
                  {isAudioUnlockedState ? 'Active' : 'Tap to Enable'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsVoiceSettingsOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Voice Speed &amp; Pause</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  🇮🇳 {playbackSpeed.toFixed(2)}x
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsAvatarsModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>AI Teachers &amp; Avatars</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsBadgeGalleryOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Milestones &amp; Badges</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  {unlockedBadgesCount} Unlocked
                </span>
              </button>

              {role === 'student' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsRoadmapOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-400" />
                    <span>Progress Roadmap</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                    {overallCurriculumPercent}%
                  </span>
                </button>
              )}

              {role === 'student' && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Total Score</span>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{totalScore} pts</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
            Smart English Sathi
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && authUser && (
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          currentUser={authUser}
        />
      )}

      {/* Switch Role Secure Code Modal */}
      {switchTargetRole && (
        <SwitchRoleModal
          isOpen={!!switchTargetRole}
          targetRole={switchTargetRole}
          currentRole={role}
          onClose={() => setSwitchTargetRole(null)}
          onSwitchSuccess={handleSwitchSuccess}
          onLogoutToLoginScreen={handleLogout}
        />
      )}

      {/* AI Avatar Showcase Modal */}
      <AvatarShowcaseModal
        isOpen={isAvatarsModalOpen}
        onClose={() => setIsAvatarsModalOpen(false)}
      />

      {/* Milestone Celebration Modal */}
      <MilestoneCelebrationModal
        badge={celebratingBadge}
        isOpen={!!celebratingBadge}
        onClose={() => setCelebratingBadge(null)}
        completedCount={completedSitIds.size}
      />

      {/* Badges Gallery Modal */}
      <BadgesGalleryModal
        isOpen={isBadgeGalleryOpen}
        onClose={() => setIsBadgeGalleryOpen(false)}
        completedCount={completedSitIds.size}
        totalScore={totalScore}
        completedGrammarLevels={completedGrammarLevels}
        studentId={activeStudentId}
        onPreviewCelebration={(badge) => {
          setIsBadgeGalleryOpen(false);
          setCelebratingBadge(badge);
        }}
      />

      {/* 10-Level Visual Progress Roadmap Modal */}
      <VisualProgressRoadmap
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        currentLevel={curLevel}
        onSelectLevel={(lvlId) => {
          handleLevelSelect(lvlId);
          setIsRoadmapOpen(false);
        }}
        publishedLessons={publishedLessons}
        completedSituationIds={completedSitIds}
        totalScore={totalScore}
        studentId={activeStudentId}
        onSelectSituation={(sitId) => {
          handleSituationSelect(sitId);
          setIsRoadmapOpen(false);
          setCurStage(1);
        }}
        onSelectGrammarLevel={(levelId) => {
          handleLevelSelect(levelId);
          setIsRoadmapOpen(false);
          setCurStage(4);
        }}
      />

      {/* Locked Level Modal */}
      <LockedLevelModal
        isOpen={isLockedLevelModalOpen}
        onClose={() => setIsLockedLevelModalOpen(false)}
        targetLevel={lockedLevelModalTarget}
        publishedLessons={publishedLessons}
        completedSituationIds={completedSitIds}
        onGoToLevelPractice={(levelId, situationId) => {
          setIsLockedLevelModalOpen(false);
          setCurLevel(levelId);
          if (situationId) {
            handleSituationSelect(situationId);
          } else {
            const firstInLvl = publishedLessons.find(
              (s) => (s.level || getSituationLevel(s.id)) === levelId && s.status === 'published'
            );
            if (firstInLvl) setCurSitId(firstInLvl.id);
          }
        }}
      />

      {/* Daily Streak Details Modal */}
      <DailyStreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streak={streak}
        totalScore={totalScore}
        completedSituationsCount={completedSitIds.size}
        onPracticeTodayNow={() => {
          handlePracticeRecorded(curSitId);
          setCurStage(1);
        }}
        onResetStreak={handleResetStreak}
      />

      {/* Daily Streak Toast Notification */}
      {streakCelebration && (
        <div className="fixed top-16 sm:top-18 left-1/2 -translate-x-1/2 z-50 bg-linear-to-r from-orange-600 via-amber-600 to-red-600 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-orange-300 flex items-center gap-2.5 animate-bounce text-xs sm:text-sm font-black">
          <span className="text-base">🔥</span>
          <span>{streakCelebration}</span>
        </div>
      )}

      {/* Voice Speed, 4s Pause & Real Indian Accent Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        speed={playbackSpeed}
        onSpeedChange={(newSpeed) => {
          setPlaybackSpeed(newSpeed);
          saveVoicePrefs({ speed: newSpeed });
        }}
        pauseSeconds={pauseSeconds}
        onPauseSecondsChange={(newPause) => {
          setPauseSeconds(newPause);
          saveVoicePrefs({ pauseDurationSeconds: newPause });
        }}
      />

      <main
        style={{ marginTop: '70px' }}
        className="w-full max-w-full md:max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 space-y-4 overflow-x-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`dashboard-role-${role}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full space-y-4"
          >
            {/* VIEW 1: PRINCIPAL DASHBOARD */}
            {role === 'principal' && (
              <PrincipalDashboard
                students={students}
                lessons={lessons}
                onUpdateStudent={handleUpdateSingleStudent}
                onSwitchToStudentView={handleSwitchToStudentView}
                authUser={authUser}
              />
            )}

            {/* VIEW 2: ADMIN DASHBOARD */}
            {role === 'admin' && (
              <AdminDashboard
                students={students}
                onUpdateStudents={handleUpdateStudents}
                lessons={lessons}
                onUpdateLessons={handleUpdateLessons}
                onSwitchToStudentView={handleSwitchToStudentView}
              />
            )}

            {/* VIEW 3: CLASSROOM GROUP PRACTICE DASHBOARD */}
            {(role === 'classroom' || isClassroomRoute) && (
              <ClassroomDashboard
                students={students}
                lessons={publishedLessons}
                authUser={authUser || defaultClassroomUser}
                onStartPractice={(sitId) => {
                  if (sitId) {
                    setCurSitId(sitId);
                    const lesson = lessons.find((l) => l.id === sitId);
                    if (lesson?.level) setCurLevel(lesson.level);
                  }
                  setCurStage(1);
                  handleRoleChange('student');
                  navigateTo('/');
                }}
                onLogout={handleLogout}
              />
            )}

            {/* VIEW 4: STUDENT LEARNING EXPERIENCE */}
            {role === 'student' && !isClassroomRoute && (
          <>
            {/* Visual Achievement Badges Shelf & Milestones */}
            <BadgesShelf
              completedCount={completedSitIds.size}
              totalScore={totalScore}
              completedGrammarLevels={completedGrammarLevels}
              onOpenGallery={() => setIsBadgeGalleryOpen(true)}
              onSelectBadge={(badge) => setCelebratingBadge(badge)}
              streak={streak}
              onOpenStreakModal={() => setIsStreakModalOpen(true)}
            />

            {/* Daily Practice Streak & Activity Widget */}
            <DailyStreakCard
              streak={streak}
              totalScore={totalScore}
              onOpenDetails={() => setIsStreakModalOpen(true)}
              onQuickPractice={() => {
                handlePracticeRecorded(curSitId);
              }}
            />

            {/* 10-Level Curriculum Visual Progress Tracker (Section 19) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                    🗺️
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-slate-900">
                        10-Level Curriculum Progress
                      </h3>
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        {completedLevelsCount}/10 Levels Done
                      </span>
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {overallCurriculumPercent}% Overall Mastery
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span>Situations: <strong className="text-slate-800">{completedSitIds.size}/{publishedLessons.length}</strong> ({overallSituationsPercent}%)</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                        <span>Grammar: <strong className="text-slate-800">{overallGrammarSummary.completedTopicsCount}/{overallGrammarSummary.totalTopicsCount}</strong> ({overallGrammarPercent}%)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual Roadmap Modal Trigger & Quick Level Badges */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => setIsRoadmapOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer hover:shadow-md shrink-0"
                    title="Open full interactive 10-level Visual Progress Roadmap"
                  >
                    <Compass className="w-4 h-4 animate-spin-slow" />
                    <span>Visual Roadmap</span>
                    <span className="bg-white/25 px-1.5 py-0.5 rounded text-[10px] font-black">
                      {overallCurriculumPercent}%
                    </span>
                  </button>

                  {/* 10 Quick Level Badges */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                    {LEVELS.map((lvl) => {
                      const sitsInLvl = publishedLessons.filter((s) => (s.level || getSituationLevel(s.id)) === lvl.id);
                      const isLvlComplete = sitsInLvl.length > 0 && sitsInLvl.every((s) => completedSitIds.has(s.id));
                      const isCur = lvl.id === curLevel;
                      return (
                        <button
                          key={lvl.id}
                          onClick={() => handleLevelSelect(lvl.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all cursor-pointer shrink-0 ${
                            isLvlComplete
                              ? 'bg-emerald-500 text-white shadow-2xs'
                              : isCur
                              ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title={`Level ${lvl.id}: ${lvl.subtitle} (${isLvlComplete ? 'Completed' : 'In Progress'})`}
                        >
                          {isLvlComplete ? '✓' : lvl.id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dual Visual Progress Bars */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-2xs"
                    style={{
                      width: `${Math.min(100, Math.max(3, overallCurriculumPercent))}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                  <span>Level 1 (Foundations)</span>
                  <span>Overall Curriculum: {overallCurriculumPercent}%</span>
                  <span>Level 10 (Mastery)</span>
                </div>
              </div>
            </div>

            {/* 1. 10-Level Selector Tabs */}
            <div className="bg-white p-2 rounded-2xl shadow-xs border border-slate-200">
              <div
                id="levelTabs"
                className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar"
              >
                {LEVELS.map((lvl) => {
                  const isActive = lvl.id === curLevel;
                  const locked = isLevelLocked(lvl.id);
                  const pubInLevel = publishedLessons.filter((s) => (s.level || getSituationLevel(s.id)) === lvl.id).length;
                  return (
                    <button
                      key={lvl.id}
                      id={`level-tab-${lvl.id}`}
                      onClick={() => handleLevelSelect(lvl.id)}
                      className={`shrink-0 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 border-2 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[11px] ${
                          isActive ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {lvl.id}
                      </span>
                      <span>
                        {lvl.name} - {lvl.subtitle}
                      </span>
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {pubInLevel} Situations
                      </span>
                      {locked && (
                        <Lock className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Situation Cards Grid for Active Level */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                    LEVEL {activeLevel.id} - {activeLevel.subtitle.toUpperCase()} ({activeLevel.class.toUpperCase()})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevSituation}
                    disabled={levelSituations.findIndex((s) => s.id === curSitId) <= 0 && publishedLessons.findIndex((s) => s.id === curSitId) <= 0}
                    className="p-1 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Previous situation"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <span className="text-xs font-bold text-slate-600 px-1">
                    {(levelSituations.findIndex((s) => s.id === curSitId) + 1) || 1} / {levelSituations.length || 1}
                  </span>
                  <button
                    onClick={handleNextSituation}
                    disabled={
                      levelSituations.findIndex((s) => s.id === curSitId) >= levelSituations.length - 1 &&
                      publishedLessons.findIndex((s) => s.id === curSitId) >= publishedLessons.length - 1
                    }
                    className="p-1 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Next situation"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  </button>
                </div>
              </div>

              <div
                id="sitList"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5"
              >
                {levelSituations.length === 0 ? (
                  <div className="col-span-full py-8 px-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs font-bold text-slate-600">
                      No published situations in Level {activeLevel.id} yet.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      New situations will appear here once explicitly published in the curriculum manager.
                    </p>
                  </div>
                ) : (
                  levelSituations.map((sit) => {
                    const isCurrent = sit.id === curSitId;
                    const isCompleted = completedSitIds.has(sit.id);

                    return (
                      <SituationCard
                        key={sit.id}
                        situation={sit}
                        isCurrent={isCurrent}
                        isCompleted={isCompleted}
                        levelSubtitle={activeLevel.subtitle}
                        onSelect={handleSituationSelect}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Scene Illustration Banner (for conversation situations 1-3) */}
            {curStage !== 4 && (
              <SceneIllustrationCard
                situationNumber={currentSituation.id}
                title={currentSituation.title}
                setting={currentSituation.setting}
                level={activeLevel.subtitle}
              />
            )}

            {/* 4. Four-Stage Navigation Tabs (Section 2 specification) */}
            <div className="stage-nav bg-white p-1 rounded-2xl shadow-xs border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-1">
              <button
                id="stage1Tab"
                onClick={() => handleStageSelect(1)}
                className={`snav py-3 px-2 sm:px-3 rounded-xl text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  curStage === 1
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base sm:text-sm">🎬</span>
                <span className="hidden sm:inline">1. Watch &amp; Listen</span>
                <span className="sm:hidden">Watch</span>
              </button>

              <button
                id="stage2Tab"
                onClick={() => handleStageSelect(2)}
                className={`snav py-3 px-2 sm:px-3 rounded-xl text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  curStage === 2
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base sm:text-sm">✍️</span>
                <span className="hidden sm:inline">2. Write &amp; Vocab</span>
                <span className="sm:hidden">Write</span>
              </button>

              <button
                id="stage3Tab"
                onClick={() => handleStageSelect(3)}
                className={`snav py-3 px-2 sm:px-3 rounded-xl text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  curStage === 3
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base sm:text-sm">🎭</span>
                <span className="hidden sm:inline">3. Role Play</span>
                <span className="sm:hidden">Role Play</span>
              </button>

              <button
                id="stage4Tab"
                onClick={() => handleStageSelect(4)}
                className={`snav py-3 px-2 sm:px-3 rounded-xl text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  curStage === 4
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base sm:text-sm">📖</span>
                <span className="hidden sm:inline">4. Grammar</span>
                <span className="sm:hidden">Grammar</span>
              </button>
            </div>

            {/* 5. Stage Content Areas */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`stage-${curStage}-${curSitId}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {curStage === 1 && (
                    <div id="stage1" className="stage active">
                      <WatchListenStage
                        situation={currentSituation}
                        onNextStage={() => setCurStage(2)}
                        playbackSpeed={playbackSpeed}
                        onSpeedChange={(newSpeed) => {
                          setPlaybackSpeed(newSpeed);
                          saveVoicePrefs({ speed: newSpeed });
                        }}
                        pauseSeconds={pauseSeconds}
                        onPauseSecondsChange={(newPause) => {
                          setPauseSeconds(newPause);
                          saveVoicePrefs({ pauseDurationSeconds: newPause });
                        }}
                        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
                        onPracticeSituation={(sitId) => handlePracticeRecorded(sitId)}
                      />
                    </div>
                  )}

                  {curStage === 2 && (
                    <div id="stage2" className="stage active">
                      <WriteVocabStage
                        situation={currentSituation}
                        onNextStage={() => setCurStage(3)}
                        onScoreEarned={handleScoreEarned}
                      />
                    </div>
                  )}

                  {curStage === 3 && (
                    <div id="stage3" className="stage active">
                      <RolePlayStage
                        situation={currentSituation}
                        onScoreEarned={handleScoreEarned}
                        totalScore={totalScore}
                        playbackSpeed={playbackSpeed}
                      />
                    </div>
                  )}

                  {curStage === 4 && (
                    <div id="stage4" className="stage active">
                      <GrammarStage
                        currentLevel={curLevel}
                        onSelectLevel={handleLevelSelect}
                        studentId={activeStudentId}
                        onBadgeUnlocked={(badge) => setCelebratingBadge(badge)}
                        onGrammarProgressUpdated={() => setGrammarRefreshKey((k) => k + 1)}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          🗣️ Smart English Sathi • 20 Spoken Situations for School Students
        </p>
        <p className="mt-1 text-slate-400">
          Class 5 to Class 12 • Featuring Teacher Anjali &amp; Riya • Listen, Write &amp; Voice Role-Play
        </p>
      </footer>
    </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

