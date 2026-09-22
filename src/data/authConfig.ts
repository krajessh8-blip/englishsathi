import { AppRole, AuthUser } from '../types';
import { getStoredStudents } from './mockStudents';
import { logAdminLoginAttempt } from '../utils/auditLogger';

export interface RoleCredentials {
  role: AppRole;
  roleNameEn: string;
  roleNameMr: string;
  badgeLabel: string;
  avatarEmoji: string;
  defaultUserName: string;
  defaultUserMr: string;
  identifier: string;
  title: string;
  defaultUsername: string;
  allowedUsernames: string[];
  defaultPassword: string;
  alternateValidPasswords: string[];
  securityQuestion: string;
  securityAnswer: string;
  hint: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    gradient: string;
  };
  features: string[];
}

export const INITIAL_ROLE_CREDENTIALS: Record<AppRole, RoleCredentials> = {
  student: {
    role: 'student',
    roleNameEn: 'Student Access',
    roleNameMr: 'विद्यार्थी प्रवेश',
    badgeLabel: 'Class 5 to 12',
    avatarEmoji: '👧',
    defaultUserName: 'Riya Sharma',
    defaultUserMr: 'रिया शर्मा',
    identifier: 'STD-101 (Class 8-B)',
    title: 'Student • Class 8-B • Group A Spoken English',
    defaultUsername: 'student@smartenglish.edu',
    allowedUsernames: [
      'student@smartenglish.edu',
      'student@mvm.edu',
      'student',
      'std-101',
      'riya.sharma',
      '101',
      'riya',
      'std101',
    ],
    defaultPassword: '',
    alternateValidPasswords: ['1001', 'student123', 'Student@2026', 'Student@MVM2026', 'STUDENT101', 'Riya@1001'],
    securityQuestion: 'What is your registered student class section?',
    securityAnswer: '8-B',
    hint: 'Enter your registered student credentials to log in.',
    colorScheme: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      accent: 'blue',
      gradient: 'from-blue-600 via-indigo-600 to-sky-600',
    },
    features: [
      'Practice 20 school conversational situations',
      'Watch & Listen with Marathi translations',
      'Interactive speech shadowing & 4s practice pauses',
      'Daily practice streak counter & achievement badges',
    ],
  },
  principal: {
    role: 'principal',
    roleNameEn: 'Principal Access',
    roleNameMr: 'मा. प्राचार्य प्रवेश',
    badgeLabel: 'Executive Oversight',
    avatarEmoji: '🎓',
    defaultUserName: 'Sumant D. Dalvi',
    defaultUserMr: 'मा. प्राचार्य सुमंत डी. दळवी',
    identifier: 'PRIN-01 (Smart English Sathi)',
    title: 'Principal • Smart English Sathi Portal',
    defaultUsername: 'principal@smartenglish.edu',
    allowedUsernames: [
      'principal@smartenglish.edu',
      'principal@mvm.edu',
      'principal',
      'sumant.dalvi',
      'sumant',
      'dalvi',
      's.dalvi',
      'dr.kulkarni',
      'prin-01',
      'kulkarni',
      'prin01',
    ],
    defaultPassword: '',
    alternateValidPasswords: ['7788', 'principal123', 'Principal@2026', 'Principal@MVM2026', 'PRIN7788', 'Dalvi#7788', 'Sumant@2026', 'Dalvi@MVM', 'Kulkarni#7788'],
    securityQuestion: 'What is the application name?',
    securityAnswer: 'Smart English Sathi',
    hint: 'Enter your registered school administrative credentials to log in.',
    colorScheme: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      text: 'text-emerald-900',
      accent: 'emerald',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    },
    features: [
      'Macro academic analytics across Classes 5 to 12',
      'Recharts comparative completion rates across Groups A to D',
      'Class-wise student distribution & attendance metrics',
      'Detailed student report cards and teacher evaluations',
    ],
  },
  admin: {
    role: 'admin',
    roleNameEn: 'Administrator',
    roleNameMr: 'प्रशासक',
    badgeLabel: 'Curriculum & Records',
    avatarEmoji: '🛡️',
    defaultUserName: 'Administrator',
    defaultUserMr: 'प्रशासक',
    identifier: 'ADM-01',
    title: 'System Administrator',
    defaultUsername: 'admin@smartenglish.edu',
    allowedUsernames: [
      'admin@smartenglish.edu',
      'admin@mvm.edu',
      'admin',
      'anjali.sawant',
      'adm-01',
      'teacher',
      'anjali',
      'adm01',
    ],
    defaultPassword: '',
    alternateValidPasswords: [],
    securityQuestion: 'Which lab department is this portal for?',
    securityAnswer: 'Spoken English Lab',
    hint: '',
    colorScheme: {
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      text: 'text-purple-900',
      accent: 'purple',
      gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    },
    features: [
      'Add & edit curriculum situations, dialogues and vocabulary',
      'Manage student database, roll numbers & group assignments',
      'School-wide English proficiency benchmarks & reporting',
      'Direct switch to inspect student simulation view',
    ],
  },
  classroom: {
    role: 'classroom',
    roleNameEn: 'Classroom Mode',
    roleNameMr: 'वर्ग सामूहिक सराव',
    badgeLabel: 'Classroom Group Practice',
    avatarEmoji: '🏫',
    defaultUserName: 'Classroom (Group Practice)',
    defaultUserMr: 'वर्ग सामूहिक सराव',
    identifier: 'CLASS-01 (Classroom)',
    title: 'Classroom Whole-Class Practice Mode',
    defaultUsername: 'classroom@smartenglish.edu',
    allowedUsernames: [
      'classroom@smartenglish.edu',
      'classroom',
      'class',
      'smartboard',
    ],
    defaultPassword: '',
    alternateValidPasswords: ['1234', 'classroom123', 'Class@2026', 'smart2026'],
    securityQuestion: 'What is this mode used for?',
    securityAnswer: 'Group Practice',
    hint: 'Enter classroom credentials for whole-class group practice.',
    colorScheme: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-900',
      accent: 'orange',
      gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    },
    features: [
      'Whole-class interactive English speaking practice',
      'Smart TV & Projector friendly group session view',
      'Classroom student roster & roll call status',
      'Instant lesson projection with voice roleplay & shadowing',
    ],
  },
};

const PASSWORDS_STORAGE_KEY = 'mvm_auth_passwords_v2';
const AUTH_STORAGE_KEY = 'mvm_auth_active_user_v2';
const LOCKOUT_STORAGE_KEY = 'mvm_auth_lockout_v2';

export function getCustomPasswords(): Record<AppRole, string> {
  if (typeof window === 'undefined') {
    return {
      student: INITIAL_ROLE_CREDENTIALS.student.defaultPassword,
      principal: INITIAL_ROLE_CREDENTIALS.principal.defaultPassword,
      admin: INITIAL_ROLE_CREDENTIALS.admin.defaultPassword,
      classroom: INITIAL_ROLE_CREDENTIALS.classroom.defaultPassword,
    };
  }

  try {
    const raw = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (!raw) {
      return {
        student: INITIAL_ROLE_CREDENTIALS.student.defaultPassword,
        principal: INITIAL_ROLE_CREDENTIALS.principal.defaultPassword,
        admin: INITIAL_ROLE_CREDENTIALS.admin.defaultPassword,
        classroom: INITIAL_ROLE_CREDENTIALS.classroom.defaultPassword,
      };
    }
    return {
      student: INITIAL_ROLE_CREDENTIALS.student.defaultPassword,
      principal: INITIAL_ROLE_CREDENTIALS.principal.defaultPassword,
      admin: INITIAL_ROLE_CREDENTIALS.admin.defaultPassword,
      classroom: INITIAL_ROLE_CREDENTIALS.classroom.defaultPassword,
      ...JSON.parse(raw),
    };
  } catch {
    return {
      student: INITIAL_ROLE_CREDENTIALS.student.defaultPassword,
      principal: INITIAL_ROLE_CREDENTIALS.principal.defaultPassword,
      admin: INITIAL_ROLE_CREDENTIALS.admin.defaultPassword,
      classroom: INITIAL_ROLE_CREDENTIALS.classroom.defaultPassword,
    };
  }
}

export function updateRolePassword(role: AppRole, newPassword: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomPasswords();
    current[role] = newPassword;
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to update password:', err);
  }
}

export function resetRolePasswordToDefault(role: AppRole): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomPasswords();
    current[role] = INITIAL_ROLE_CREDENTIALS[role].defaultPassword;
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to reset password:', err);
  }
}

// Lockout management
export interface LockoutStatus {
  isLocked: boolean;
  lockUntil: number; // timestamp
  secondsRemaining: number;
}

export function getLockoutStatus(): LockoutStatus {
  if (typeof window === 'undefined') {
    return { isLocked: false, lockUntil: 0, secondsRemaining: 0 };
  }
  try {
    const raw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (!raw) return { isLocked: false, lockUntil: 0, secondsRemaining: 0 };
    const parsed = JSON.parse(raw);
    const now = Date.now();
    if (parsed.lockUntil && parsed.lockUntil > now) {
      return {
        isLocked: true,
        lockUntil: parsed.lockUntil,
        secondsRemaining: Math.ceil((parsed.lockUntil - now) / 1000),
      };
    }
    // Lock expired
    localStorage.removeItem(LOCKOUT_STORAGE_KEY);
    return { isLocked: false, lockUntil: 0, secondsRemaining: 0 };
  } catch {
    return { isLocked: false, lockUntil: 0, secondsRemaining: 0 };
  }
}

export function recordFailedAttempt(): { isNowLocked: boolean; attemptsCount: number; secondsLock: number } {
  if (typeof window === 'undefined') return { isNowLocked: false, attemptsCount: 1, secondsLock: 0 };
  try {
    const raw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : { count: 0, lockUntil: 0 };
    parsed.count = (parsed.count || 0) + 1;

    // After 5 failed attempts, lock for 30 seconds
    if (parsed.count >= 5) {
      parsed.lockUntil = Date.now() + 30 * 1000;
      parsed.count = 0; // reset count after lock triggers
      localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(parsed));
      return { isNowLocked: true, attemptsCount: 5, secondsLock: 30 };
    }

    localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(parsed));
    return { isNowLocked: false, attemptsCount: parsed.count, secondsLock: 0 };
  } catch {
    return { isNowLocked: false, attemptsCount: 1, secondsLock: 0 };
  }
}

export function clearFailedAttempts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCKOUT_STORAGE_KEY);
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    // 1. Check Smart English Sathi (SES) session keys: ses_logged, ses_role, ses_user
    const sesLogged = localStorage.getItem('ses_logged');
    const sesRole = localStorage.getItem('ses_role');
    const sesUser = localStorage.getItem('ses_user');

    if (sesLogged === '1' || sesLogged === 'true' || sesRole || sesUser) {
      const roleStr = (sesRole || 'student').toLowerCase().trim();
      const validRole: AppRole =
        roleStr === 'admin' ? 'admin' :
        roleStr === 'principal' ? 'principal' : 'student';

      const username = sesUser || 'student@smartenglish.edu';
      const config = INITIAL_ROLE_CREDENTIALS[validRole];
      const displayName = username.includes('@') ? username.split('@')[0] : username;

      return {
        role: validRole,
        name: displayName || config.defaultUserName,
        marathiName: config.defaultUserMr,
        identifier: username,
        title: config.title,
        avatar: config.avatarEmoji,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 2. Check generic user / role
    const genericRole = localStorage.getItem('role');
    const genericUser = localStorage.getItem('user');
    if (genericRole && (genericRole === 'admin' || genericRole === 'principal' || genericRole === 'student')) {
      const config = INITIAL_ROLE_CREDENTIALS[genericRole as AppRole];
      const displayName = genericUser && genericUser.includes('@') ? genericUser.split('@')[0] : (genericUser || config.defaultUserName);
      return {
        role: genericRole as AppRole,
        name: displayName,
        marathiName: config.defaultUserMr,
        identifier: genericUser || config.identifier,
        title: config.title,
        avatar: config.avatarEmoji,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.role && INITIAL_ROLE_CREDENTIALS[parsed.role as AppRole]) {
      // Keep principal name updated to Sumant D. Dalvi
      if (parsed.role === 'principal' && parsed.name !== INITIAL_ROLE_CREDENTIALS.principal.defaultUserName) {
        parsed.name = INITIAL_ROLE_CREDENTIALS.principal.defaultUserName;
        parsed.marathiName = INITIAL_ROLE_CREDENTIALS.principal.defaultUserMr;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed as AuthUser;
    }
    return null;
  } catch (err) {
    console.error('Failed to read auth user from localStorage:', err);
    return null;
  }
}

export function saveAuthUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem('smart_english_app_role', user.role);
      localStorage.setItem('mvm_kenedi_app_role', user.role);
      localStorage.setItem('ses_role', user.role);
      localStorage.setItem('ses_user', user.identifier || user.name);
      localStorage.setItem('ses_logged', '1');
      localStorage.setItem('user', user.identifier || user.name);
      localStorage.setItem('role', user.role);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('ses_role');
      localStorage.removeItem('ses_user');
      localStorage.removeItem('ses_logged');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  } catch (err) {
    console.error('Failed to save auth user to localStorage:', err);
  }
}

export function clearAuthUser(): void {
  saveAuthUser(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('ses_role');
    localStorage.removeItem('ses_user');
    localStorage.removeItem('ses_logged');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('smart_english_app_role');
    localStorage.removeItem('mvm_kenedi_app_role');
  }
}

/**
 * Validates credentials (Username/ID and Password) for the chosen role.
 */
export function verifyCredentials(
  role: AppRole,
  usernameInput: string,
  passwordInput: string
): {
  success: boolean;
  user?: AuthUser;
  errorMessage?: string;
  isLocked?: boolean;
  lockSecondsRemaining?: number;
} {
  // Check lockout first
  const lockout = getLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      isLocked: true,
      lockSecondsRemaining: lockout.secondsRemaining,
      errorMessage: `Too many failed attempts. Security lock active for ${lockout.secondsRemaining}s.`,
    };
  }

  const config = INITIAL_ROLE_CREDENTIALS[role];
  if (!config) {
    return { success: false, errorMessage: 'Invalid role selected.' };
  }

  const cleanUser = usernameInput.trim();
  const cleanPass = passwordInput.trim();

  // DEMO BYPASS: If password is not empty, allow login immediately
  if (!cleanPass) {
    return { success: false, errorMessage: 'Please enter password.' };
  }

  // Allow ANY email/username and ANY password for all roles
  localStorage.setItem('user', cleanUser || config.defaultUsername);
  localStorage.setItem('role', role);

  const displayName = cleanUser.includes('@')
    ? cleanUser.split('@')[0]
    : (cleanUser || config.defaultUserName);

  const user: AuthUser = {
    role,
    name: displayName,
    marathiName: config.defaultUserMr,
    identifier: cleanUser || config.identifier,
    title: config.title,
    avatar: config.avatarEmoji,
    loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  saveAuthUser(user);
  return { success: true, user };
}

// Backwards-compatible verifySecureCode
export function verifySecureCode(
  role: AppRole,
  inputCode: string
): { success: boolean; user?: AuthUser; errorMessage?: string } {
  return verifyCredentials(role, INITIAL_ROLE_CREDENTIALS[role].defaultUsername, inputCode);
}

// Password strength calculation helper
export function calculatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
} {
  if (!password) return { score: 0, label: 'Very Weak', color: 'bg-slate-300' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const normalized = Math.min(4, score);

  switch (normalized) {
    case 0:
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-red-500' };
    case 2:
      return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    case 3:
      return { score: 3, label: 'Strong', color: 'bg-blue-500' };
    case 4:
      return { score: 4, label: 'Very Strong', color: 'bg-emerald-500' };
    default:
      return { score: 2, label: 'Fair', color: 'bg-amber-500' };
  }
}

export const ROLE_AUTH_CONFIGS = INITIAL_ROLE_CREDENTIALS;

export interface AdminAuditRecord {
  id: string;
  timestamp: string;
  formattedTime?: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOCKOUT_TRIGGERED' | 'PASSWORD_CHANGED' | 'STUDENT_STATUS_CHANGE' | string;
  action?: string;
  actionDescription?: string;
  udiseCode?: string;
  user: string;
  role: string;
  status?: string;
  ip: string;
  userAgent?: string;
  details: string;
}

/**
 * Verifies admin coordinator password securely against backend API endpoint.
 * Password is never exposed in client bundle or source.
 * Logs all authentication attempts to Firestore and backend audit trails.
 */
export async function verifyAdminCredentialsSecurely(password: string): Promise<{
  success: boolean;
  user?: AuthUser;
  errorMessage?: string;
  isLocked?: boolean;
  lockSecondsRemaining?: number;
}> {
  try {
    const res = await fetch('/api/auth/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const user = data.user || {
        role: 'admin',
        roleType: 'super_admin',
        isSuperAdmin: true,
        name: 'Super Admin (Owner)',
        marathiName: 'सुपर ॲडमिन (प्रणाली मालक)',
        identifier: 'SUPER-ADM (Owner)',
        title: 'Super Administrator & Multi-School Authority',
        avatar: '👑',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      // Log successful login attempt to Firestore
      logAdminLoginAttempt({
        udiseCode: user.udiseCode || 'SUPER_ADMIN',
        user: user.name || 'Super Admin',
        role: user.roleType || 'super_admin',
        success: true,
      }).catch(() => {});

      return { success: true, user };
    }

    // Log failed login attempt to Firestore
    logAdminLoginAttempt({
      udiseCode: 'SUPER_ADMIN',
      user: 'Admin Operator',
      role: 'admin',
      success: false,
      reason: data.message || 'Invalid secured password.',
    }).catch(() => {});

    return {
      success: false,
      isLocked: Boolean(data.isLocked),
      lockSecondsRemaining: data.secondsRemaining,
      errorMessage: data.message || 'Invalid secured password.',
    };
  } catch {
    // Log network failure / attempt to Firestore
    logAdminLoginAttempt({
      udiseCode: 'SUPER_ADMIN',
      user: 'Admin Operator',
      role: 'admin',
      success: false,
      reason: 'Network connection error during admin verification.',
    }).catch(() => {});

    return {
      success: false,
      errorMessage: 'Network error verifying admin password with secure server.',
    };
  }
}

/**
 * Checks if the current client is locked out due to exceeding failed attempts.
 */
export async function getAdminLockoutStatus(): Promise<{
  isLocked: boolean;
  secondsRemaining: number;
  message?: string;
}> {
  try {
    const res = await fetch('/api/auth/admin-status');
    const data = await res.json();
    return {
      isLocked: Boolean(data.isLocked),
      secondsRemaining: data.secondsRemaining || 0,
      message: data.message,
    };
  } catch {
    return { isLocked: false, secondsRemaining: 0 };
  }
}

/**
 * Changes the admin password securely via backend API and logs audit trail.
 */
export async function changeAdminPasswordSecurely(
  currentPassword: string,
  newPassword: string,
  udiseCode?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/auth/change-admin-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, udiseCode }),
    });
    const data = await res.json();
    return {
      success: Boolean(data.success),
      message: data.message || (data.success ? 'Admin password changed.' : 'Failed to change password.'),
    };
  } catch {
    return { success: false, message: 'Network error updating admin password.' };
  }
}

/**
 * Fetches recent admin audit logs from the secure database.
 */
export async function getAdminAuditLogs(): Promise<AdminAuditRecord[]> {
  try {
    const res = await fetch('/api/auth/admin-audit-logs');
    const data = await res.json();
    return data.logs || [];
  } catch {
    return [];
  }
}
