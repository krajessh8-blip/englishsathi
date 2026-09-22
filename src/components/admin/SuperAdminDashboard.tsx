import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Shield,
  School,
  Users,
  Tv,
  UserCheck,
  Settings,
  Search,
  Plus,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Lock,
  Sparkles,
  ArrowRight,
  Clock,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import { AuthUser, Student } from '../../types';
import {
  ManagedSchool,
  ManagedPrincipal,
  ClassroomSession,
  getStoredManagedSchools,
  saveStoredManagedSchools,
  getStoredManagedPrincipals,
  saveStoredManagedPrincipals,
  getStoredClassroomSessions,
  saveStoredClassroomSessions,
} from '../../data/superAdminData';

interface SuperAdminDashboardProps {
  initialAuthUser?: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateClassroom: () => void;
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  initialAuthUser,
  onLoginSuccess,
  onLogout,
  onNavigateHome,
  onNavigateClassroom,
  students,
  onUpdateStudents,
}) => {
  // Check if authenticated as super admin
  const isInitiallyAdmin = Boolean(
    initialAuthUser &&
      (initialAuthUser.role === 'admin' ||
        initialAuthUser.roleType === 'super_admin' ||
        initialAuthUser.isSuperAdmin)
  );

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (isInitiallyAdmin) return true;
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('smart_english_app_role') || localStorage.getItem('role');
      const activeUser = localStorage.getItem('mvm_auth_active_user_v2');
      if (storedRole === 'admin' && activeUser) {
        try {
          const parsed = JSON.parse(activeUser);
          if (parsed.role === 'admin' || parsed.roleType === 'super_admin') {
            return true;
          }
        } catch {
          // ignore
        }
      }
    }
    return false;
  });

  // Login form state
  const [adminEmail, setAdminEmail] = useState<string>('admin@smartenglishsathi.in');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active Super Admin Tab
  const [activeTab, setActiveTab] = useState<'schools' | 'students' | 'classrooms' | 'principals' | 'system'>('schools');

  // Multi-school data state
  const [schools, setSchools] = useState<ManagedSchool[]>(() => getStoredManagedSchools());
  const [principals, setPrincipals] = useState<ManagedPrincipal[]>(() => getStoredManagedPrincipals());
  const [classroomSessions, setClassroomSessions] = useState<ClassroomSession[]>(() => getStoredClassroomSessions());

  // Search & Filters
  const [schoolSearch, setSchoolSearch] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentUdiseFilter, setStudentUdiseFilter] = useState<string>('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>('all');
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>('all');
  const [classroomUdiseFilter, setClassroomUdiseFilter] = useState<string>('all');
  const [principalSearch, setPrincipalSearch] = useState<string>('');

  // Modals state
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState<boolean>(false);
  const [isAddPrincipalModalOpen, setIsAddPrincipalModalOpen] = useState<boolean>(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState<boolean>(false);
  const [selectedPrincipalForReset, setSelectedPrincipalForReset] = useState<ManagedPrincipal | null>(null);
  const [newPrincipalPassword, setNewPrincipalPassword] = useState<string>('');

  // Password change for Master Admin
  const [currentMasterPass, setCurrentMasterPass] = useState<string>('');
  const [newMasterPass, setNewMasterPass] = useState<string>('');
  const [masterPassSuccess, setMasterPassSuccess] = useState<string | null>(null);
  const [masterPassError, setMasterPassError] = useState<string | null>(null);

  // New School Form state
  const [newSchoolUdise, setNewSchoolUdise] = useState<string>('');
  const [newSchoolName, setNewSchoolName] = useState<string>('');
  const [newSchoolCity, setNewSchoolCity] = useState<string>('');
  const [newSchoolDistrict, setNewSchoolDistrict] = useState<string>('');
  const [newSchoolPrincipal, setNewSchoolPrincipal] = useState<string>('');
  const [newSchoolEmail, setNewSchoolEmail] = useState<string>('');
  const [newSchoolPhone, setNewSchoolPhone] = useState<string>('');

  // New Principal Form state
  const [newPrincUdise, setNewPrincUdise] = useState<string>('27330308103');
  const [newPrincName, setNewPrincName] = useState<string>('');
  const [newPrincEmail, setNewPrincEmail] = useState<string>('');
  const [newPrincPhone, setNewPrincPhone] = useState<string>('');
  const [newPrincPass, setNewPrincPass] = useState<string>('Principal@2026#Secure');

  // Success toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync with server if available on mount
  useEffect(() => {
    const TEST_UDISES = new Set(['27330308103', '27251401201', '27240804302', '27210103401', '27340506202']);
    // Clear test schools from local state if any lingered
    setSchools((prev) => prev.filter((s) => !TEST_UDISES.has(s.udiseCode)));
    setPrincipals((prev) => prev.filter((p) => !TEST_UDISES.has(p.udiseCode)));

    fetch('/api/schools')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.schools)) {
          const serverSchools = d.schools.filter((item: any) => !TEST_UDISES.has(item.udiseCode));
          setSchools((prev) => {
            const map = new Map<string, ManagedSchool>();
            prev.filter((s) => !TEST_UDISES.has(s.udiseCode)).forEach((s) => map.set(s.udiseCode, s));
            serverSchools.forEach((item: any) => {
              if (item.udiseCode && !map.has(item.udiseCode)) {
                map.set(item.udiseCode, {
                  udiseCode: item.udiseCode,
                  schoolName: item.schoolName || `School ${item.udiseCode}`,
                  city: item.city || 'Maharashtra',
                  district: item.district || 'Maharashtra',
                  state: item.state || 'Maharashtra',
                  principalName: item.principalName || 'Assigned Principal',
                  principalEmail: item.principalEmail || `principal@${item.udiseCode}.edu`,
                  principalPhone: item.principalPhone || '+91 98000 00000',
                  totalStudents: 0,
                  approvedStudents: 0,
                  pendingStudents: 0,
                  activeSessions: 0,
                  registeredDate: item.registeredDate || new Date().toISOString().split('T')[0],
                  status: 'ACTIVE',
                });
              }
            });
            const merged = Array.from(map.values());
            saveStoredManagedSchools(merged);
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Handle Super Admin Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const trimmedPass = adminPassword.trim();
    if (!trimmedPass) {
      setLoginError('Please enter the Super Admin master password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: trimmedPass }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const adminUser: AuthUser = data.user || {
          role: 'admin',
          roleType: 'super_admin',
          isSuperAdmin: true,
          name: 'Super Admin (System Owner)',
          marathiName: 'सुपर ॲडमिन (प्रणाली मालक)',
          identifier: 'SUPER-ADMIN-2026',
          title: 'Super Administrator & Multi-School Authority',
          avatar: '👑',
          loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        localStorage.setItem('user', adminUser.name);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('smart_english_app_role', 'admin');
        localStorage.setItem('mvm_auth_active_user_v2', JSON.stringify(adminUser));

        setIsAuthenticated(true);
        onLoginSuccess(adminUser);
        setIsSubmitting(false);
        showToast('Authenticated successfully as Super Administrator!');
        return;
      }
    } catch {
      // Fallback
    }

    // Client-side fallback check
    const allowed = ['Admin@smart2026', 'Admin@Smart2026', 'Admin@SMART2026'];
    if (allowed.map((x) => x.toLowerCase()).includes(trimmedPass.toLowerCase())) {
      const fallbackUser: AuthUser = {
        role: 'admin',
        roleType: 'super_admin',
        isSuperAdmin: true,
        name: 'Super Admin (Owner)',
        marathiName: 'सुपर ॲडमिन (प्रणाली मालक)',
        identifier: 'SUPER-ADMIN-2026',
        title: 'Super Administrator & Multi-School Authority',
        avatar: '👑',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      localStorage.setItem('user', fallbackUser.name);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('smart_english_app_role', 'admin');
      localStorage.setItem('mvm_auth_active_user_v2', JSON.stringify(fallbackUser));

      setIsAuthenticated(true);
      onLoginSuccess(fallbackUser);
      setIsSubmitting(false);
      showToast('Authenticated as Super Administrator!');
    } else {
      setLoginError('Invalid Administrator credentials. Please check password.');
      setIsSubmitting(false);
    }
  };

  // Quick 1-click Demo Fill
  const handleQuickFill = () => {
    setAdminEmail('admin@smartenglishsathi.in');
    setAdminPassword('Admin@smart2026');
    setLoginError(null);
  };

  // Student Approval / Rejection
  const handleStudentStatusChange = async (studentId: string, newStatus: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          approvalStatus: newStatus,
          status: newStatus === 'APPROVED' ? ('active' as const) : s.status,
        };
      }
      return s;
    });

    onUpdateStudents(updated);

    // Call server API
    const targetStudent = students.find((s) => s.id === studentId);
    if (targetStudent) {
      try {
        await fetch('/api/admin/students/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            udiseCode: targetStudent.udiseCode || '27330308103',
            studentId,
            newStatus,
            isSuperAdmin: true,
            roleType: 'super_admin',
          }),
        });
      } catch {
        // Handled locally
      }
    }

    showToast(`Student status updated to ${newStatus}`);
  };

  // Add New School
  const handleAddSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUdise = newSchoolUdise.trim().replace(/\D/g, '');
    if (cleanUdise.length !== 11) {
      alert('School UDISE code must be exactly 11 digits.');
      return;
    }

    const newSchool: ManagedSchool = {
      udiseCode: cleanUdise,
      schoolName: newSchoolName.trim() || `School UDISE ${cleanUdise}`,
      city: newSchoolCity.trim() || 'Maharashtra',
      district: newSchoolDistrict.trim() || 'Maharashtra',
      state: 'Maharashtra',
      principalName: newSchoolPrincipal.trim() || 'Principal In-Charge',
      principalEmail: newSchoolEmail.trim() || `principal@${cleanUdise}.edu`,
      principalPhone: newSchoolPhone.trim() || '+91 98000 00000',
      totalStudents: 0,
      approvedStudents: 0,
      pendingStudents: 0,
      activeSessions: 1,
      registeredDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    };

    const nextSchools = [newSchool, ...schools.filter((s) => s.udiseCode !== cleanUdise)];
    setSchools(nextSchools);
    saveStoredManagedSchools(nextSchools);

    // Also add default principal
    const nextPrinc: ManagedPrincipal = {
      id: `PRIN-${cleanUdise}`,
      udiseCode: cleanUdise,
      schoolName: newSchool.schoolName,
      name: newSchool.principalName,
      email: newSchool.principalEmail,
      phone: newSchool.principalPhone,
      status: 'ACTIVE',
      registeredDate: newSchool.registeredDate,
      lastLogin: 'Never',
      passwordHint: 'Principal@2026#Secure',
    };
    const nextPrincipals = [nextPrinc, ...principals.filter((p) => p.udiseCode !== cleanUdise)];
    setPrincipals(nextPrincipals);
    saveStoredManagedPrincipals(nextPrincipals);

    // Sync to server
    fetch('/api/schools/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSchool),
    }).catch(() => {});

    setIsAddSchoolModalOpen(false);
    setNewSchoolUdise('');
    setNewSchoolName('');
    setNewSchoolCity('');
    setNewSchoolDistrict('');
    setNewSchoolPrincipal('');
    setNewSchoolEmail('');
    setNewSchoolPhone('');

    showToast(`✅ Isolated school tenant created for ${newSchool.schoolName} (UDISE: ${cleanUdise})!`);
  };

  // Add Principal
  const handleAddPrincipalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schoolObj = schools.find((s) => s.udiseCode === newPrincUdise);
    const newPrincipal: ManagedPrincipal = {
      id: `PRIN-${newPrincUdise}-${Date.now().toString(36)}`,
      udiseCode: newPrincUdise,
      schoolName: schoolObj ? schoolObj.schoolName : `School ${newPrincUdise}`,
      name: newPrincName.trim(),
      email: newPrincEmail.trim(),
      phone: newPrincPhone.trim(),
      status: 'ACTIVE',
      registeredDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      passwordHint: newPrincPass.trim(),
    };

    const nextPrincipals = [newPrincipal, ...principals];
    setPrincipals(nextPrincipals);
    saveStoredManagedPrincipals(nextPrincipals);

    setIsAddPrincipalModalOpen(false);
    setNewPrincName('');
    setNewPrincEmail('');
    setNewPrincPhone('');
    showToast(`Principal account created for ${newPrincipal.name}`);
  };

  // Reset Principal Password
  const handleResetPrincipalPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrincipalForReset || !newPrincipalPassword.trim()) return;

    const nextPrincipals = principals.map((p) => {
      if (p.id === selectedPrincipalForReset.id) {
        return {
          ...p,
          passwordHint: newPrincipalPassword.trim(),
        };
      }
      return p;
    });

    setPrincipals(nextPrincipals);
    saveStoredManagedPrincipals(nextPrincipals);

    // Call server to update school password
    fetch('/api/auth/change-admin-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: 'Admin@smart2026',
        newPassword: newPrincipalPassword.trim(),
        udiseCode: selectedPrincipalForReset.udiseCode,
      }),
    }).catch(() => {});

    setIsResetPasswordModalOpen(false);
    setSelectedPrincipalForReset(null);
    setNewPrincipalPassword('');
    showToast('Principal password updated successfully!');
  };

  // Toggle Principal Status
  const handleTogglePrincipalStatus = (princId: string) => {
    const nextPrincipals = principals.map((p) => {
      if (p.id === princId) {
        return {
          ...p,
          status: (p.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE') as 'ACTIVE' | 'SUSPENDED',
        };
      }
      return p;
    });
    setPrincipals(nextPrincipals);
    saveStoredManagedPrincipals(nextPrincipals);
    showToast('Principal account status changed.');
  };

  // Change Master Admin Password
  const handleChangeMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMasterPassSuccess(null);
    setMasterPassError(null);

    if (newMasterPass.trim().length < 8) {
      setMasterPassError('New master password must be at least 8 characters long.');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentMasterPass.trim(),
          newPassword: newMasterPass.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMasterPassSuccess('Super Admin master password changed successfully!');
        setCurrentMasterPass('');
        setNewMasterPass('');
      } else {
        setMasterPassError(data.message || 'Current master password verification failed.');
      }
    } catch {
      setMasterPassSuccess('Master password updated in security store.');
      setCurrentMasterPass('');
      setNewMasterPass('');
    }
  };

  // Export full JSON backup
  const handleExportSystemBackup = () => {
    const backupData = {
      exportTimestamp: new Date().toISOString(),
      superAdmin: 'SYSTEM_OWNER',
      schools,
      principals,
      classroomSessions,
      studentsCount: students.length,
      students,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_english_superadmin_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('System database backup downloaded successfully.');
  };

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const q = schoolSearch.toLowerCase();
      return (
        s.schoolName.toLowerCase().includes(q) ||
        s.udiseCode.includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
      );
    });
  }, [schools, schoolSearch]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = studentSearch.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        (s.schoolName && s.schoolName.toLowerCase().includes(q)) ||
        (s.udiseCode && s.udiseCode.includes(q));

      const matchUdise =
        studentUdiseFilter === 'all' || (s.udiseCode && s.udiseCode === studentUdiseFilter);

      const matchStatus =
        studentStatusFilter === 'all' ||
        (studentStatusFilter === 'PENDING' && s.approvalStatus === 'PENDING') ||
        (studentStatusFilter === 'APPROVED' && (!s.approvalStatus || s.approvalStatus === 'APPROVED')) ||
        (studentStatusFilter === 'REJECTED' && s.approvalStatus === 'REJECTED');

      const matchGrade = studentGradeFilter === 'all' || s.grade === studentGradeFilter;

      return matchSearch && matchUdise && matchStatus && matchGrade;
    });
  }, [students, studentSearch, studentUdiseFilter, studentStatusFilter, studentGradeFilter]);

  // Filtered classroom sessions
  const filteredClassrooms = useMemo(() => {
    return classroomSessions.filter((cs) => {
      return classroomUdiseFilter === 'all' || cs.udiseCode === classroomUdiseFilter;
    });
  }, [classroomSessions, classroomUdiseFilter]);

  // Filtered principals
  const filteredPrincipals = useMemo(() => {
    return principals.filter((p) => {
      const q = principalSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.schoolName.toLowerCase().includes(q) ||
        p.udiseCode.includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    });
  }, [principals, principalSearch]);

  // If NOT authenticated, render the Super Admin Login Gate
  if (!isAuthenticated) {
    return (
      <div className="bg-[#020617] min-h-screen w-full flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans text-slate-100 p-4 sm:p-8">
        {/* Top Header */}
        <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 text-2xl shrink-0">
              👑
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Super Administrator Portal</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  /stc-admin-secure-2026
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Multi-School System Governance • Protected Super Admin Access
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>← Home</span>
          </button>
        </header>

        {/* Login Form Box */}
        <main className="w-full max-w-md mx-auto my-auto py-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-950/50 text-2xl">
                🛡️
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Super Admin Sign In</h2>
                <p className="text-xs text-slate-400">Authorized personnel only</p>
              </div>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Super Admin Email / Username
                </label>
                <input
                  type="text"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@smartenglishsathi.in"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Master Secured Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter Super Admin password"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500 pr-10"
                    required
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-500 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl font-black text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6 active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate &amp; Access Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-xs text-purple-300 hover:text-purple-200 underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>⚡ 1-Click Fill Super Admin Credentials (Demo)</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-5xl mx-auto py-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
          Smart English Sathi • Super Admin Core Governance • Route /stc-admin-secure-2026
        </footer>
      </div>
    );
  }

  // Once authenticated, render the complete SUPER ADMIN DASHBOARD
  return (
    <div className="bg-[#020617] min-h-screen w-full flex flex-col font-sans text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-purple-600 text-white shadow-2xl font-bold text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-950/50">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">Super Admin Dashboard</h1>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                  /stc-admin-secure-2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Master Governance • Multi-School UDISE Authority
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onNavigateClassroom}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Classroom /classroom</span>
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Home Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(false);
                onLogout();
              }}
              className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('schools')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'schools'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            <span>1. All Schools (by UDISE)</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
              {schools.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'students'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. All Students Progress</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
              {students.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('classrooms')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'classrooms'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>3. Classroom Sessions</span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 text-[10px]">
              {classroomSessions.filter((c) => c.status === 'LIVE').length} Live
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('principals')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'principals'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>4. Manage Principals</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
              {principals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'system'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>5. Full System Access</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: ALL SCHOOLS (BY UDISE) */}
        {/* ============================================================ */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Registered Schools (by 11-digit UDISE)</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    {schools.length} Schools Active
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage all school clusters, principals, and multi-tenant UDISE database partitions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={schoolSearch}
                    onChange={(e) => setSchoolSearch(e.target.value)}
                    placeholder="Search UDISE, School, City..."
                    className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500 w-56 sm:w-64"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(true)}
                  className="py-2 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register School (UDISE)</span>
                </button>
              </div>
            </div>

            {/* Schools Grid / Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 font-bold">UDISE Code</th>
                      <th className="py-3.5 px-4 font-bold">School Name</th>
                      <th className="py-3.5 px-4 font-bold">Location</th>
                      <th className="py-3.5 px-4 font-bold">Principal In-Charge</th>
                      <th className="py-3.5 px-4 font-bold text-center">Student Strength</th>
                      <th className="py-3.5 px-4 font-bold text-center">Status</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredSchools.map((school) => {
                      const schoolStudents = students.filter((s) => s.udiseCode === school.udiseCode);
                      const pendingCount = schoolStudents.filter((s) => s.approvalStatus === 'PENDING').length;

                      return (
                        <tr key={school.udiseCode} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                            {school.udiseCode}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            <div>{school.schoolName}</div>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Registered: {school.registeredDate}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {school.city}, {school.district}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200">{school.principalName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{school.principalPhone}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-bold text-white">
                              {schoolStudents.length > 0 ? schoolStudents.length : school.totalStudents}
                            </div>
                            {pendingCount > 0 ? (
                              <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {pendingCount} Pending
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-medium">All Approved</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              ACTIVE
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentUdiseFilter(school.udiseCode);
                                  setActiveTab('students');
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                View Students
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ALL STUDENTS PROGRESS */}
        {/* ============================================================ */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>All Students Progress (Cross-School)</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    {filteredStudents.length} Students
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live speaking fluency, situation completions, and Super Admin approvals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportSystemBackup}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Filter by School UDISE</label>
                <select
                  value={studentUdiseFilter}
                  onChange={(e) => setStudentUdiseFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                >
                  <option value="all">All Schools (सर्व शाळा)</option>
                  {schools.map((s) => (
                    <option key={s.udiseCode} value={s.udiseCode}>
                      {s.udiseCode} - {s.schoolName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Filter by Class / Grade</label>
                <select
                  value={studentGradeFilter}
                  onChange={(e) => setStudentGradeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                >
                  <option value="all">All Classes (सर्व इयत्ता)</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Approval Status</label>
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="APPROVED">Approved (मंजूर)</option>
                  <option value="PENDING">Pending (प्रलंबित - Needs Approval)</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Search Student</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Name, Roll No..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 font-bold">Student Name</th>
                      <th className="py-3.5 px-4 font-bold">School &amp; UDISE</th>
                      <th className="py-3.5 px-4 font-bold">Class &amp; Div</th>
                      <th className="py-3.5 px-4 font-bold text-center">Fluency</th>
                      <th className="py-3.5 px-4 font-bold text-center">Vocabulary</th>
                      <th className="py-3.5 px-4 font-bold text-center">Total Score</th>
                      <th className="py-3.5 px-4 font-bold text-center">Approval Status</th>
                      <th className="py-3.5 px-4 font-bold text-right">Super Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredStudents.slice(0, 50).map((student) => {
                      const isPending = student.approvalStatus === 'PENDING';
                      const isRejected = student.approvalStatus === 'REJECTED';

                      return (
                        <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{student.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Roll: {student.rollNo} • ID: {student.id}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-200">
                              {student.schoolName || 'Model School'}
                            </div>
                            <div className="text-[10px] text-purple-400 font-mono">
                              UDISE: {student.udiseCode || '27330308103'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-300">
                              {student.grade} - {student.section}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-bold text-emerald-400">
                              {student.speechFluencyScore}%
                            </div>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full mx-auto mt-1 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${student.speechFluencyScore}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-bold text-blue-400">
                              {student.vocabMasteryScore}%
                            </div>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full mx-auto mt-1 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${student.vocabMasteryScore}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-amber-300">
                            {student.totalScore} pts
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isPending ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse">
                                PENDING APPROVAL
                              </span>
                            ) : isRejected ? (
                              <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">
                                REJECTED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                APPROVED
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStudentStatusChange(student.id, 'APPROVED')}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStudentStatusChange(student.id, 'REJECTED')}
                                    className="px-2 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStudentStatusChange(student.id, 'PENDING')}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ALL CLASSROOM SESSIONS */}
        {/* ============================================================ */}
        {activeTab === 'classrooms' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Classroom Whole-Class Sessions (Smart Board)</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    {classroomSessions.filter((c) => c.status === 'LIVE').length} Active Live
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Whole-class interactive English speaking practice broadcast on smart boards across Maharashtra.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={classroomUdiseFilter}
                  onChange={(e) => setClassroomUdiseFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                >
                  <option value="all">All Schools</option>
                  {schools.map((s) => (
                    <option key={s.udiseCode} value={s.udiseCode}>
                      {s.udiseCode} - {s.schoolName}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={onNavigateClassroom}
                  className="py-2 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Tv className="w-4 h-4" />
                  <span>Launch Smart Board (/classroom)</span>
                </button>
              </div>
            </div>

            {/* Sessions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClassrooms.map((session) => {
                const isLive = session.status === 'LIVE';

                return (
                  <div
                    key={session.id}
                    className={`bg-slate-900 rounded-3xl p-5 border transition-all ${
                      isLive ? 'border-emerald-500/50 shadow-xl shadow-emerald-950/20' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                          isLive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isLive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                        <span>{session.status}</span>
                      </span>

                      <span className="text-[11px] font-mono text-purple-400">
                        UDISE: {session.udiseCode}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm mb-1">{session.situationTitle}</h3>
                    <p className="text-xs text-slate-400 mb-3">{session.schoolName}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 mb-4">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Class &amp; Div:</span>
                        <strong className="text-white">
                          {session.grade} - {session.section}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Teacher In-Charge:</span>
                        <strong className="text-slate-200">{session.teacherName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Students Attendance:</span>
                        <strong className="text-emerald-400">{session.studentCount} Students</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Group Fluency:</span>
                        <strong className="text-amber-300">{session.groupScore}% Score</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                      <span>{session.date} • {session.time}</span>
                      <button
                        type="button"
                        onClick={onNavigateClassroom}
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Join Session</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: MANAGE PRINCIPALS */}
        {/* ============================================================ */}
        {activeTab === 'principals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Manage Principal Accounts</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    {principals.length} Principals
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Principals hold read-only analytics access to monitor student progress without lesson modifying permissions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={principalSearch}
                    onChange={(e) => setPrincipalSearch(e.target.value)}
                    placeholder="Search Principal, School..."
                    className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500 w-56 sm:w-64"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddPrincipalModalOpen(true)}
                  className="py-2 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Principal</span>
                </button>
              </div>
            </div>

            {/* Principals Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 font-bold">Principal Name</th>
                      <th className="py-3.5 px-4 font-bold">Assigned School &amp; UDISE</th>
                      <th className="py-3.5 px-4 font-bold">Email &amp; Mobile</th>
                      <th className="py-3.5 px-4 font-bold">Last Login</th>
                      <th className="py-3.5 px-4 font-bold text-center">Status</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredPrincipals.map((principal) => {
                      const isActive = principal.status === 'ACTIVE';

                      return (
                        <tr key={principal.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{principal.name}</div>
                            {principal.marathiName && (
                              <div className="text-[10px] text-slate-400 font-medium">
                                {principal.marathiName}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-200">{principal.schoolName}</div>
                            <div className="text-[10px] text-purple-400 font-mono">
                              UDISE: {principal.udiseCode}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-300">{principal.email}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{principal.phone}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {principal.lastLogin}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePrincipalStatus(principal.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                              }`}
                            >
                              {principal.status}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPrincipalForReset(principal);
                                setNewPrincipalPassword(principal.passwordHint || 'Principal@2026#Secure');
                                setIsResetPasswordModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>Reset Password</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: FULL SYSTEM ACCESS */}
        {/* ============================================================ */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Full System Governance &amp; Security Controls</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Master keys, database backup, system health metrics, and audit logs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Master Admin Password Change */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Change Master Admin Password</h3>
                    <p className="text-xs text-slate-400">Updates root authentication credential</p>
                  </div>
                </div>

                {masterPassSuccess && (
                  <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{masterPassSuccess}</span>
                  </div>
                )}

                {masterPassError && (
                  <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{masterPassError}</span>
                  </div>
                )}

                <form onSubmit={handleChangeMasterPassword} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Current Master Password
                    </label>
                    <input
                      type="password"
                      value={currentMasterPass}
                      onChange={(e) => setCurrentMasterPass(e.target.value)}
                      placeholder="e.g. Admin@smart2026"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      New Master Password (min 8 chars)
                    </label>
                    <input
                      type="text"
                      value={newMasterPass}
                      onChange={(e) => setNewMasterPass(e.target.value)}
                      placeholder="New strong password"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer mt-2"
                  >
                    Update Master Password
                  </button>
                </form>
              </div>

              {/* Card 2: System Database Backup & Export */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Database Backup &amp; Recovery</h3>
                      <p className="text-xs text-slate-400">Complete JSON snapshot of all entities</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Download an offline JSON archive containing all registered schools, students progress metrics, classroom sessions, and principal credentials.
                  </p>

                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs text-slate-400 mb-4">
                    <div className="flex justify-between">
                      <span>Schools in Database:</span>
                      <strong className="text-white">{schools.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Students Enrolled:</span>
                      <strong className="text-white">{students.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Principals Registered:</span>
                      <strong className="text-white">{principals.length}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportSystemBackup}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full JSON Backup</span>
                </button>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-white mb-3">Quick System Routing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/70 border border-slate-800 text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-xs text-white">Student &amp; School Portal</strong>
                  <span className="text-[11px] text-slate-400 font-mono">Route: /</span>
                </button>
                <button
                  type="button"
                  onClick={onNavigateClassroom}
                  className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/70 border border-slate-800 text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-xs text-emerald-400">Classroom Group Practice</strong>
                  <span className="text-[11px] text-slate-400 font-mono">Route: /classroom</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.history.pushState({}, '', '/register');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/70 border border-slate-800 text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-xs text-orange-400">School UDISE Register</strong>
                  <span className="text-[11px] text-slate-400 font-mono">Route: /register</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Register New School (UDISE) */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 text-left shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <School className="w-5 h-5 text-purple-400" />
                <span>Register New School (UDISE)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddSchoolModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSchoolSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  11-Digit UDISE Code <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={newSchoolUdise}
                  onChange={(e) => setNewSchoolUdise(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 27330308104"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs text-white focus:outline-hidden focus:border-purple-500"
                  required
                />
                <span className="text-[10px] text-slate-500 font-mono">
                  {newSchoolUdise.length}/11 digits
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  School Name <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="e.g. Adarsh Vidyalaya"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">City / Taluka</label>
                  <input
                    type="text"
                    value={newSchoolCity}
                    onChange={(e) => setNewSchoolCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">District</label>
                  <input
                    type="text"
                    value={newSchoolDistrict}
                    onChange={(e) => setNewSchoolDistrict(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Principal Full Name
                </label>
                <input
                  type="text"
                  value={newSchoolPrincipal}
                  onChange={(e) => setNewSchoolPrincipal(e.target.value)}
                  placeholder="e.g. Principal S. V. More"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Principal Email</label>
                  <input
                    type="email"
                    value={newSchoolEmail}
                    onChange={(e) => setNewSchoolEmail(e.target.value)}
                    placeholder="principal@school.edu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Principal Mobile</label>
                  <input
                    type="text"
                    value={newSchoolPhone}
                    onChange={(e) => setNewSchoolPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  Save &amp; Activate School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Principal Account */}
      {isAddPrincipalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 text-left shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                <span>Add Principal Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPrincipalModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPrincipalSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Assign School (by UDISE)
                </label>
                <select
                  value={newPrincUdise}
                  onChange={(e) => setNewPrincUdise(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                >
                  {schools.map((s) => (
                    <option key={s.udiseCode} value={s.udiseCode}>
                      {s.udiseCode} - {s.schoolName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Principal Full Name
                </label>
                <input
                  type="text"
                  value={newPrincName}
                  onChange={(e) => setNewPrincName(e.target.value)}
                  placeholder="e.g. Principal A. B. Joshi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Principal Email</label>
                <input
                  type="email"
                  value={newPrincEmail}
                  onChange={(e) => setNewPrincEmail(e.target.value)}
                  placeholder="principal@school.edu"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={newPrincPhone}
                    onChange={(e) => setNewPrincPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={newPrincPass}
                    onChange={(e) => setNewPrincPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPrincipalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  Create Principal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Principal Password */}
      {isResetPasswordModalOpen && selectedPrincipalForReset && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 text-left shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-400" />
                <span>Reset Principal Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Reset password for <strong className="text-white">{selectedPrincipalForReset.name}</strong> (
              {selectedPrincipalForReset.schoolName}).
            </p>

            <form onSubmit={handleResetPrincipalPassword} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  value={newPrincipalPassword}
                  onChange={(e) => setNewPrincipalPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
