import { Student } from '../types';

export interface ManagedSchool {
  udiseCode: string;
  schoolName: string;
  city: string;
  district: string;
  state: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  totalStudents: number;
  approvedStudents: number;
  pendingStudents: number;
  activeSessions: number;
  registeredDate: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
}

export interface ManagedPrincipal {
  id: string;
  udiseCode: string;
  schoolName: string;
  name: string;
  marathiName?: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED';
  registeredDate: string;
  lastLogin: string;
  passwordHint?: string;
}

export interface ClassroomSession {
  id: string;
  udiseCode: string;
  schoolName: string;
  teacherName: string;
  grade: string;
  section: string;
  situationId: number;
  situationTitle: string;
  situationLevel: number;
  studentCount: number;
  groupScore: number;
  date: string;
  time: string;
  status: 'LIVE' | 'COMPLETED';
}

const TEST_UDISES = new Set(['27330308103', '27251401201', '27240804302', '27210103401', '27340506202']);

export const INITIAL_MANAGED_SCHOOLS: ManagedSchool[] = [];

export const INITIAL_MANAGED_PRINCIPALS: ManagedPrincipal[] = [];

export const INITIAL_CLASSROOM_SESSIONS: ClassroomSession[] = [];

// Helper functions for persistent storage
const SCHOOLS_KEY = 'smart_superadmin_schools_registry';
const PRINCIPALS_KEY = 'smart_superadmin_principals_registry';
const SESSIONS_KEY = 'smart_superadmin_sessions_registry';

export function getStoredManagedSchools(): ManagedSchool[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SCHOOLS_KEY);
    if (!raw) {
      localStorage.setItem(SCHOOLS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: ManagedSchool[] = JSON.parse(raw);
    // Purge any of the 5 legacy test schools from user's localStorage
    const cleaned = parsed.filter((s) => !TEST_UDISES.has(s.udiseCode));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(SCHOOLS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredManagedSchools(schools: ManagedSchool[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = schools.filter((s) => !TEST_UDISES.has(s.udiseCode));
    localStorage.setItem(SCHOOLS_KEY, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to save managed schools:', err);
  }
}

export function getStoredManagedPrincipals(): ManagedPrincipal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRINCIPALS_KEY);
    if (!raw) {
      localStorage.setItem(PRINCIPALS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: ManagedPrincipal[] = JSON.parse(raw);
    const cleaned = parsed.filter((p) => !TEST_UDISES.has(p.udiseCode));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(PRINCIPALS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredManagedPrincipals(principals: ManagedPrincipal[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = principals.filter((p) => !TEST_UDISES.has(p.udiseCode));
    localStorage.setItem(PRINCIPALS_KEY, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to save managed principals:', err);
  }
}

export function getStoredClassroomSessions(): ClassroomSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: ClassroomSession[] = JSON.parse(raw);
    const cleaned = parsed.filter((s) => !TEST_UDISES.has(s.udiseCode));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredClassroomSessions(sessions: ClassroomSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = sessions.filter((s) => !TEST_UDISES.has(s.udiseCode));
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to save classroom sessions:', err);
  }
}
