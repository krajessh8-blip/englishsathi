import React, { useState } from 'react';
import { AppRole, DailyStreakData, AuthUser } from '../types';
import { DailyStreakBadge } from './streak/DailyStreakBadge';
import {
  Star,
  Award,
  GraduationCap,
  Users,
  Sliders,
  ShieldCheck,
  Briefcase,
  LogOut,
  Lock,
  KeyRound,
  Volume2,
  VolumeX,
  Compass,
  Menu,
  X,
  ChevronRight,
  School,
} from 'lucide-react';

interface Props {
  totalScore: number;
  completedSituationsCount: number;
  onOpenAvatarsModal: () => void;
  speed: number;
  pauseSeconds: number;
  onOpenVoiceSettings: () => void;
  currentRole: AppRole;
  onRoleChange: (role: AppRole) => void;
  onOpenBadgesGallery: () => void;
  unlockedBadgesCount: number;
  streak?: DailyStreakData;
  onOpenStreakModal?: () => void;
  authUser?: AuthUser | null;
  onLogout?: () => void;
  onRequestSwitchRole?: (role: AppRole) => void;
  onOpenChangePasswordModal?: () => void;
  onOpenAudioTest?: () => void;
  isAudioUnlocked?: boolean;
  onOpenRoadmap?: () => void;
  curriculumProgressPercent?: number;
}

export const Header: React.FC<Props> = ({
  totalScore,
  completedSituationsCount,
  onOpenAvatarsModal,
  speed,
  pauseSeconds,
  onOpenVoiceSettings,
  currentRole,
  onRoleChange,
  onOpenBadgesGallery,
  unlockedBadgesCount,
  streak,
  onOpenStreakModal,
  authUser,
  onLogout,
  onRequestSwitchRole,
  onOpenChangePasswordModal,
  onOpenAudioTest,
  isAudioUnlocked = true,
  onOpenRoadmap,
  curriculumProgressPercent = 0,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const handleRoleClick = (targetRole: AppRole) => {
    if (targetRole === currentRole) return;
    if (onRequestSwitchRole) {
      onRequestSwitchRole(targetRole);
    } else {
      onRoleChange(targetRole);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-xs px-3 sm:px-6 py-2.5 w-full max-w-full">
      <div className="w-full max-w-full md:max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Top bar on mobile / Left group */}
        <div className="flex items-center justify-between gap-2 w-full md:w-auto">
          {/* Logo and title */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg sm:text-xl shadow-xs shrink-0">
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

          {/* Header tabs (Student / Principal / Admin) - flex flex-wrap, relative z-50 */}
          <div className="flex flex-wrap items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 relative z-50 shrink-0">
            <button
              id="mobile-tab-student"
              onClick={() => handleRoleClick('student')}
              className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                currentRole === 'student' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student
            </button>
            <button
              id="mobile-tab-principal"
              onClick={() => handleRoleClick('principal')}
              className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                currentRole === 'principal' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Principal
            </button>
            <button
              id="mobile-tab-admin"
              onClick={() => handleRoleClick('admin')}
              className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                currentRole === 'admin' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
            {(currentRole === 'classroom' || authUser?.role === 'classroom' || authUser?.roleType === 'coordinator') && (
              <button
                id="mobile-tab-classroom"
                onClick={() => handleRoleClick('classroom')}
                className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                  currentRole === 'classroom' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Classroom
              </button>
            )}
          </div>

          {/* Mobile Drawer Menu Toggle Button */}
          <button
            id="mobileMenuToggleBtn"
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer shrink-0"
            title="Open Controls & Drawer"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Center Desktop Role Navigation Switcher */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            id="role-btn-student"
            onClick={() => handleRoleClick('student')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'student'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Learning</span>
          </button>

          <button
            id="role-btn-principal"
            onClick={() => handleRoleClick('principal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'principal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Principal Dashboard</span>
          </button>

          <button
            id="role-btn-admin"
            onClick={() => handleRoleClick('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>

          {(currentRole === 'classroom' || authUser?.role === 'classroom' || authUser?.roleType === 'coordinator') && (
            <button
              id="role-btn-classroom"
              onClick={() => handleRoleClick('classroom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentRole === 'classroom'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Classroom Practice</span>
            </button>
          )}
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
              {onOpenChangePasswordModal && (
                <button
                  onClick={onOpenChangePasswordModal}
                  id="headerChangePasswordBtn"
                  className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors ml-0.5 cursor-pointer"
                  title="Change Secured Password / पासवर्ड बदला"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  id="headerLogoutBtn"
                  className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-0.5 cursor-pointer"
                  title="Lock Session & Switch Role / बाहेर पडा"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Interactive Board Audio Status & Test Screen Trigger */}
          {onOpenAudioTest && (
            <button
              onClick={onOpenAudioTest}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-colors cursor-pointer ${
                isAudioUnlocked
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400 animate-pulse'
              }`}
              title={
                isAudioUnlocked
                  ? 'Interactive Board Audio is Active • Click to run Audio Test Screen'
                  : 'Audio Blocked in WebView • Tap to Enable Sound'
              }
            >
              {isAudioUnlocked ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-amber-700" />
              )}
              <span className="hidden sm:inline">Sound:</span>
              <span>{isAudioUnlocked ? 'Active' : 'Tap to Enable'}</span>
            </button>
          )}

          {/* Voice Speed & 4s Pause Quick Controller */}
          <button
            onClick={onOpenVoiceSettings}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs transition-colors cursor-pointer"
            title="Adjust Voice Speed, 4s Pause & Real Indian Accent"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-mono">🇮🇳 {speed.toFixed(2)}x</span>
            <span className="hidden lg:inline">• {pauseSeconds}s</span>
          </button>

          {/* AI Avatars Button */}
          <button
            onClick={onOpenAvatarsModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
            title="View AI Teacher & Student Avatars"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Avatars</span>
          </button>

          {/* Achievement Badges Trigger */}
          <button
            onClick={onOpenBadgesGallery}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs transition-colors cursor-pointer"
            title="View Achievement Badges & Milestones"
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Badges</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950 font-black text-[10px]">
              {unlockedBadgesCount}
            </span>
          </button>

          {/* Visual Progress Roadmap Trigger */}
          {currentRole === 'student' && onOpenRoadmap && (
            <button
              onClick={onOpenRoadmap}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs transition-colors cursor-pointer"
              title="Open Visual Progress Roadmap / दृश्य प्रगती नकाशा"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Progress</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-black text-[10px]">
                {curriculumProgressPercent}%
              </span>
            </button>
          )}

          {/* Student Status Group: Daily Streak Counter & Star Score Counter */}
          {currentRole === 'student' ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {streak && (
                <DailyStreakBadge
                  streak={streak}
                  onClick={onOpenStreakModal || (() => {})}
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
          ) : (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="capitalize">{currentRole} Mode</span>
            </div>
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
              <span className="capitalize">{currentRole} Mode</span>
            </div>
          </div>

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
                {onOpenChangePasswordModal && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenChangePasswordModal();
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-700 cursor-pointer"
                    title="Change Password"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onLogout();
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Controls List in Mobile Drawer */}
          <div className="space-y-2 pt-1">
            {onOpenAudioTest && (
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenAudioTest();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Audio System</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isAudioUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300 animate-pulse'
                }`}>
                  {isAudioUnlocked ? 'Active' : 'Tap to Enable'}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenVoiceSettings();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Voice Speed &amp; Pause</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                🇮🇳 {speed.toFixed(2)}x
              </span>
            </button>

            <button
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenAvatarsModal();
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
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenBadgesGallery();
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

            {currentRole === 'student' && onOpenRoadmap && (
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenRoadmap();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-400" />
                  <span>Progress Roadmap</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                  {curriculumProgressPercent}%
                </span>
              </button>
            )}

            {currentRole === 'student' && (
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
          Smart English Sathi • Vercel Edition
        </div>
      </div>
    </header>
  );
};

