import React, { useState, useEffect } from 'react';
import {
  changeAdminPasswordSecurely,
  getAdminAuditLogs,
  getAdminLockoutStatus,
  calculatePasswordStrength,
  AdminAuditRecord,
} from '../../data/authConfig';
import { fetchAuditLogs, logAuditEvent } from '../../utils/auditLogger';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Laptop,
  Check,
  Loader2,
  Building2,
  School,
  Search,
  ChevronRight,
} from 'lucide-react';

export const SuperAdminSecurity: React.FC = () => {
  // Scope & School selection state
  const [targetScope, setTargetScope] = useState<'school' | 'super_admin'>('school');
  const [selectedUdise, setSelectedUdise] = useState<string>('27330308103');
  const [customUdiseInput, setCustomUdiseInput] = useState<string>('');
  const [schoolsList, setSchoolsList] = useState<
    Array<{ udiseCode: string; schoolName: string; city: string; district: string; principalName?: string }>
  >([
    {
      udiseCode: '27330308103',
      schoolName: 'Smart English Sathi Model School',
      city: 'Pune',
      district: 'Beed / Pune',
      principalName: 'Sumant D. Dalvi',
    },
    {
      udiseCode: '27251401201',
      schoolName: 'Z.P. High School & Junior College',
      city: 'Chhatrapati Sambhajinagar',
      district: 'Sambhajinagar',
      principalName: 'Dr. Ramesh Kulkarni',
    },
    {
      udiseCode: '27240804302',
      schoolName: 'Saraswati Vidyalaya Secondary School',
      city: 'Nashik',
      district: 'Nashik',
      principalName: 'Sunil G. Deshmukh',
    },
    {
      udiseCode: '27210502104',
      schoolName: 'Adarsh Secondary Ashram School',
      city: 'Nagpur',
      district: 'Nagpur',
      principalName: 'Pravin S. Patil',
    },
  ]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AdminAuditRecord[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Rate limit status state
  const [lockoutStatus, setLockoutStatus] = useState<{
    isLocked: boolean;
    secondsRemaining: number;
  }>({ isLocked: false, secondsRemaining: 0 });

  const strength = calculatePasswordStrength(newPassword);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      // First attempt to fetch from Firestore audit trail
      const firestoreLogs = await fetchAuditLogs({ limitCount: 50 });
      if (firestoreLogs && firestoreLogs.length > 0) {
        setAuditLogs(
          firestoreLogs.map((l) => ({
            id: l.id || `log_${Date.now()}`,
            timestamp: l.timestamp,
            formattedTime: new Date(l.timestamp).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'medium',
            }),
            eventType: (l.action as any) || 'ADMIN_LOGIN_ATTEMPT',
            action: l.action,
            actionDescription: l.actionDescription || l.description || '',
            udiseCode: l.udiseCode || 'SUPER_ADMIN',
            user: l.user || 'Super Admin',
            role: l.role || 'super_admin',
            ip: l.ip || '127.0.0.1',
            userAgent: l.userAgent,
            details: l.actionDescription || l.description || '',
          }))
        );
      } else {
        const logs = await getAdminAuditLogs();
        setAuditLogs(logs);
      }
    } catch {
      try {
        const logs = await getAdminAuditLogs();
        setAuditLogs(logs);
      } catch {}
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const checkStatus = async () => {
    try {
      const status = await getAdminLockoutStatus();
      setLockoutStatus({
        isLocked: status.isLocked,
        secondsRemaining: status.secondsRemaining,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchLogs();
    checkStatus();

    // Fetch registered schools for UDISE password management
    fetch('/api/schools')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.schools) && data.schools.length > 0) {
          setSchoolsList(data.schools);
        }
      })
      .catch(() => {});

    const interval = setInterval(() => {
      fetchLogs();
      checkStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (!currentPassword.trim()) {
      setChangeError('Please enter the current master admin password for verification.');
      return;
    }

    const activeUdise = targetScope === 'school' ? (customUdiseInput.trim() || selectedUdise) : undefined;
    if (targetScope === 'school' && (!activeUdise || activeUdise.length !== 11)) {
      setChangeError('Please select or specify a valid 11-digit school UDISE code.');
      return;
    }

    if (newPassword.length < 8) {
      setChangeError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError('New password and confirmation password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await changeAdminPasswordSecurely(currentPassword, newPassword, activeUdise);
      if (result.success) {
        setChangeSuccess(
          result.message ||
            (activeUdise
              ? `Admin password for school UDISE ${activeUdise} updated securely!`
              : 'Super Admin master password updated securely!')
        );
        // Log critical action into Firestore
        logAuditEvent({
          udiseCode: activeUdise || 'SUPER_ADMIN',
          action: 'PASSWORD_CHANGED',
          actionDescription: activeUdise
            ? `Admin password updated for school UDISE ${activeUdise}.`
            : 'Super Admin master password changed securely.',
          user: 'Super Admin (Owner)',
          role: 'super_admin',
          status: 'SUCCESS',
        }).catch(() => {});

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        fetchLogs();
      } else {
        setChangeError(result.message || 'Verification failed. Please check current password.');
      }
    } catch {
      setChangeError('Network error connecting to security authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'STUDENT_STATUS_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
            <Check className="w-3 h-3 text-blue-600" />
            <span>Status Changed</span>
          </span>
        );
      case 'ADMIN_LOGIN_SUCCESS':
      case 'LOGIN_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Login Success</span>
          </span>
        );
      case 'ADMIN_LOGIN_FAILED':
      case 'LOGIN_FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Failed Attempt</span>
          </span>
        );
      case 'ADMIN_LOCKOUT_TRIGGERED':
      case 'LOCKOUT_TRIGGERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>5-Min Lockout</span>
          </span>
        );
      case 'PASSWORD_CHANGED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300">
            <KeyRound className="w-3 h-3 text-purple-600" />
            <span>Password Changed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-300">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Security Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-purple-800/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-black tracking-wider uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Admin Security &amp; Access Control</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              System Administrator Access
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-2xl">
              Strict production security enabled. Admin credentials are authenticated server-side via{' '}
              <code className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-700/50 text-purple-300 font-mono text-xs">
                ADMIN_SECURE_KEY
              </code>
              . Demo passwords and autofill buttons are eliminated from client code.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs text-xs">
              <span className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider">Rate Limiting</span>
              <span className="font-bold text-white">3 attempts • 5m lock</span>
            </div>
            <div className="px-3 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs text-xs">
              <span className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider">Audit Logging</span>
              <span className="font-bold text-emerald-300">Immutable Log Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Change Admin Password Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-2xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Change Admin Password
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Set a strong unique password (no demo shown)
              </p>
            </div>
          </div>

          {changeSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{changeSuccess}</span>
            </div>
          )}

          {changeError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{changeError}</span>
            </div>
          )}

          {/* Target Scope Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 block">
              Password Target / पासवर्ड बदलण्याचे उद्दिष्ट
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTargetScope('school')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  targetScope === 'school'
                    ? 'bg-white text-purple-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>UDISE School Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('super_admin')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  targetScope === 'super_admin'
                    ? 'bg-white text-purple-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Master Admin</span>
              </button>
            </div>
          </div>

          {/* School Selector if school scope */}
          {targetScope === 'school' && (
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>Select Target School / शाळा निवडा</span>
                </span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  UDISE Mode
                </span>
              </div>

              <select
                value={selectedUdise}
                onChange={(e) => {
                  setSelectedUdise(e.target.value);
                  if (e.target.value !== 'custom') setCustomUdiseInput('');
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-purple-600 cursor-pointer"
              >
                {schoolsList.map((s) => (
                  <option key={s.udiseCode} value={s.udiseCode}>
                    {s.schoolName} ({s.udiseCode})
                  </option>
                ))}
                <option value="custom">+ Enter Custom 11-digit UDISE Code</option>
              </select>

              {selectedUdise === 'custom' && (
                <div>
                  <input
                    type="text"
                    maxLength={11}
                    value={customUdiseInput}
                    onChange={(e) => setCustomUdiseInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 11-digit school UDISE (e.g. 27330308103)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-purple-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              )}

              <div className="text-[11px] text-purple-800 font-medium flex items-center justify-between pt-1 border-t border-purple-100">
                <span>Active Target UDISE:</span>
                <span className="font-mono font-black text-purple-950 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                  {selectedUdise === 'custom' ? customUdiseInput || 'Pending Entry' : selectedUdise}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                Current Master Admin Password / सध्याचा मुख्य पासवर्ड
              </label>
              <div className="relative flex items-center">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  autoComplete="new-password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current master admin password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                {targetScope === 'school'
                  ? 'New School Admin Password / नवीन शाळा पासवर्ड'
                  : 'New Master Admin Password / नवीन मुख्य पासवर्ड'}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  autoComplete="new-password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter strong unique password (min. 8 chars)"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Strength:</span>
                    <span className="text-slate-800">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all ${
                          strength.score >= step ? strength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                Confirm New Password / पासवर्डची पुष्टी करा
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newPassword || !confirmPassword || !currentPassword}
              className="w-full py-3 px-4 rounded-xl font-black text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>
                {isSubmitting
                  ? 'Updating Password...'
                  : targetScope === 'school'
                  ? `Save School Password (${selectedUdise === 'custom' ? customUdiseInput || 'UDISE' : selectedUdise})`
                  : 'Change Master Admin Password'}
              </span>
            </button>
          </form>

          {/* Quick School List */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                Quick Select Registered Schools
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{schoolsList.length} Schools</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {schoolsList.map((sch) => (
                <div
                  key={sch.udiseCode}
                  onClick={() => {
                    setTargetScope('school');
                    setSelectedUdise(sch.udiseCode);
                    setCustomUdiseInput('');
                  }}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    targetScope === 'school' && selectedUdise === sch.udiseCode
                      ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-bold'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate mr-2">
                    <p className="font-bold truncate text-[11px]">{sch.schoolName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">UDISE: {sch.udiseCode}</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-300 text-purple-700 hover:bg-purple-600 hover:text-white transition-colors"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security policy summary */}
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/80 space-y-1.5 text-xs text-purple-900 font-medium">
            <div className="font-bold flex items-center gap-1.5 text-purple-950">
              <Lock className="w-3.5 h-3.5 text-purple-700" />
              <span>Production Security Guidelines</span>
            </div>
            <p className="text-[11px] leading-relaxed text-purple-800">
              • Passwords must be at least 8 characters long.
              <br />
              • Password changes are verified and committed directly on the server.
              <br />
              • 3 failed attempts from any IP triggers a 5-minute lockout with audit event.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Admin Login Audit Trail */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Admin Login &amp; Security Audit Trail
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Logged in database with timestamp for compliance
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                fetchLogs();
                checkStatus();
              }}
              disabled={isLoadingLogs}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Lockout status banner if active */}
          {lockoutStatus.isLocked && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Rate limiting active: Too many attempts. Try after 5 minutes ({Math.ceil(lockoutStatus.secondsRemaining / 60)}m left)
              </span>
            </div>
          )}

          {/* Table of logs */}
          <div className="overflow-x-auto max-h-[460px] overflow-y-auto border border-slate-100 rounded-2xl">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-2">
                <Shield className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No audit log events recorded yet. Admin login attempts will appear here automatically.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">UDISE Code</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">User &amp; Role</th>
                    <th className="py-2.5 px-3">Action Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {log.formattedTime || new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {log.udiseCode || 'SUPER_ADMIN'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getEventBadge(log.eventType)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{log.user}</div>
                        <div className="text-[10px] text-slate-400 font-mono">IP: {log.ip}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {log.actionDescription || log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
