import {
  SchoolDoc,
  UserDoc,
  LessonDoc,
  CashRequestDoc,
  CashRequestStatus,
  Situation,
} from '../types';
import { SITUATIONS } from './situations';

// =========================================================================
// FIRESTORE COLLECTION NAMES
// =========================================================================
export const FIRESTORE_COLLECTIONS = {
  SCHOOLS: 'schools',
  USERS: 'users',
  LESSONS: 'lessons',
  CASH_REQUESTS: 'cashRequests',
} as const;

// =========================================================================
// DEFAULT SEEDED SCHOOL (Smart English Sathi Model School - SES001)
// =========================================================================
export const DEFAULT_SCHOOL: SchoolDoc = {
  schoolId: 'smart_school_01',
  schoolName: 'Smart English Sathi Model School',
  city: 'Wai',
  principalId: 'prin_sumant_dalvi',
  totalStudents: 120,
  plan: 'paid',
  schoolCode: 'SES001',
  createdAt: '2026-09-01T00:00:00.000Z',
};

// =========================================================================
// DEFAULT USERS (Multi-School & Individual Learner structure)
// =========================================================================
export const DEFAULT_USERS: UserDoc[] = [
  // 1. Student (Enrolled in Smart English Sathi Model School)
  {
    uid: 'std_riya_sharma_101',
    email: 'student@smartenglish.edu',
    name: 'Riya Sharma',
    role: 'student',
    schoolId: 'smart_school_01',
    principalId: 'prin_sumant_dalvi',
    class: 'Class 10',
    isPaid: true,
    validTill: '2027-04-30T23:59:59.000Z',
    trialStart: '2026-09-01T08:00:00.000Z',
    trialEnd: '2026-09-01T08:10:00.000Z', // 10 min demo completed
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  // 2. Principal (Principal of Smart English Sathi Model School)
  {
    uid: 'prin_sumant_dalvi',
    email: 'principal@smartenglish.edu',
    name: 'Sumant D. Dalvi',
    role: 'principal',
    schoolId: 'smart_school_01',
    principalId: null,
    class: null,
    isPaid: true,
    validTill: '2028-12-31T23:59:59.000Z',
    trialStart: null,
    trialEnd: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  // 3. Admin (System Coordinator)
  {
    uid: 'adm_anjali_sawant',
    email: 'admin@smartenglish.edu',
    name: 'Anjali Sawant',
    role: 'admin',
    schoolId: 'smart_school_01',
    principalId: null,
    class: null,
    isPaid: true,
    validTill: '2030-12-31T23:59:59.000Z',
    trialStart: null,
    trialEnd: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  // 4. Individual Learner (Direct subscription, no school association)
  {
    uid: 'ind_aarav_patil_99',
    email: 'aarav.learner@gmail.com',
    name: 'Aarav Patil',
    role: 'individual',
    schoolId: null, // null for individual learners
    principalId: null,
    class: 'Class 8',
    isPaid: false, // Free trial user
    validTill: null,
    trialStart: '2026-09-05T10:00:00.000Z',
    trialEnd: '2026-09-05T10:10:00.000Z', // 10 min active demo
    createdAt: '2026-09-05T10:00:00.000Z',
  },
];

// =========================================================================
// DEFAULT CASH PAYMENT REQUESTS
// =========================================================================
export const DEFAULT_CASH_REQUESTS: CashRequestDoc[] = [
  {
    id: 'cash_req_001',
    userId: 'std_rohit_more_102',
    schoolId: 'smart_school_01',
    status: 'pending',
    requestedAt: '2026-09-05T14:30:00.000Z',
    amount: 500,
    notes: 'Paid cash to class teacher Shri Shinde Sir',
  },
  {
    id: 'cash_req_002',
    userId: 'std_riya_sharma_101',
    schoolId: 'smart_school_01',
    status: 'approved',
    requestedAt: '2026-09-02T10:15:00.000Z',
    approvedAt: '2026-09-02T11:00:00.000Z',
    amount: 500,
    notes: 'Annual academic subscription fee verified by school office',
  },
];

// =========================================================================
// LOCAL STORAGE KEYS (FOR CLIENT PERSISTENCE & SAFE FALLBACK)
// =========================================================================
const STORAGE_KEYS = {
  SCHOOLS: 'smart_firestore_schools',
  USERS: 'smart_firestore_users',
  CASH_REQUESTS: 'smart_firestore_cash_requests',
};
const LEGACY_STORAGE_KEYS = {
  SCHOOLS: 'mvm_firestore_schools',
  USERS: 'mvm_firestore_users',
  CASH_REQUESTS: 'mvm_firestore_cash_requests',
};

// =========================================================================
// DATA ACCESS LAYER: SCHOOLS
// =========================================================================
export function getSchools(): SchoolDoc[] {
  if (typeof window === 'undefined') return [DEFAULT_SCHOOL];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS) || localStorage.getItem(LEGACY_STORAGE_KEYS.SCHOOLS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify([DEFAULT_SCHOOL]));
      return [DEFAULT_SCHOOL];
    }
    const parsed: SchoolDoc[] = JSON.parse(raw);
    if (!parsed.some((s) => s.schoolId === DEFAULT_SCHOOL.schoolId)) {
      parsed.unshift(DEFAULT_SCHOOL);
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return [DEFAULT_SCHOOL];
  }
}

export function getSchoolById(schoolId: string): SchoolDoc | undefined {
  const schools = getSchools();
  return schools.find((s) => s.schoolId === schoolId);
}

export function getSchoolByCode(schoolCode: string): SchoolDoc | undefined {
  const schools = getSchools();
  return schools.find((s) => s.schoolCode.toUpperCase() === schoolCode.trim().toUpperCase());
}

export function saveSchool(school: SchoolDoc): void {
  if (typeof window === 'undefined') return;
  const schools = getSchools();
  const index = schools.findIndex((s) => s.schoolId === school.schoolId);
  if (index >= 0) {
    schools[index] = school;
  } else {
    schools.push(school);
  }
  localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
}

// =========================================================================
// DATA ACCESS LAYER: USERS
// =========================================================================
export function getUsers(): UserDoc[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS) || localStorage.getItem(LEGACY_STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

export function getUserDoc(uid: string): UserDoc | undefined {
  const users = getUsers();
  return users.find((u) => u.uid === uid);
}

export function saveUserDoc(user: UserDoc): void {
  if (typeof window === 'undefined') return;
  const users = getUsers();
  const index = users.findIndex((u) => u.uid === user.uid);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getUsersBySchool(schoolId: string): UserDoc[] {
  const users = getUsers();
  return users.filter((u) => u.schoolId === schoolId);
}

// =========================================================================
// DATA ACCESS LAYER: LESSONS (Multi-School & Access Filter)
// =========================================================================
export function getLessonDocs(schoolId?: string | null): LessonDoc[] {
  // Convert SITUATIONS into LessonDoc collection
  return SITUATIONS.map((s) => ({
    lessonId: s.id,
    title: s.title,
    youtubeLink: `https://www.youtube.com/watch?v=smart_lesson_${s.id}`,
    group: s.group,
    access: (s.id <= 5 ? 'free' : 'paid') as 'free' | 'paid',
    schoolId: null, // null for all schools
    subtitle: s.subtitle,
    setting: s.setting,
    dialogs: s.dialogs,
    vocabulary: s.vocabulary,
    questions: s.questions,
    roleplaySteps: s.roleplaySteps,
    isActive: true,
    difficulty: (s.group === 'A'
      ? 'Beginner'
      : s.group === 'B'
      ? 'Intermediate'
      : s.group === 'C'
      ? 'Advanced'
      : 'Expert') as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
    createdAt: '2026-09-01T00:00:00.000Z',
  })).filter((lesson) => {
    // If schoolId is passed, match lessons that belong to that school OR are global (null)
    if (!schoolId) return true;
    return lesson.schoolId === null || lesson.schoolId === schoolId;
  });
}

// =========================================================================
// DATA ACCESS LAYER: CASH REQUESTS
// =========================================================================
export function getCashRequests(schoolId?: string): CashRequestDoc[] {
  if (typeof window === 'undefined') return DEFAULT_CASH_REQUESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_REQUESTS) || localStorage.getItem(LEGACY_STORAGE_KEYS.CASH_REQUESTS);
    let requests: CashRequestDoc[] = raw ? JSON.parse(raw) : DEFAULT_CASH_REQUESTS;
    if (schoolId) {
      requests = requests.filter((r) => r.schoolId === schoolId);
    }
    return requests;
  } catch {
    return DEFAULT_CASH_REQUESTS;
  }
}

export function createCashRequest(data: {
  userId: string;
  schoolId: string;
  amount?: number;
  notes?: string;
}): CashRequestDoc {
  const newReq: CashRequestDoc = {
    id: `cash_req_${Date.now()}`,
    userId: data.userId,
    schoolId: data.schoolId,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    amount: data.amount || 500,
    notes: data.notes,
  };

  const requests = getCashRequests();
  requests.unshift(newReq);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CASH_REQUESTS, JSON.stringify(requests));
  }
  return newReq;
}

export function updateCashRequestStatus(
  requestId: string,
  status: CashRequestStatus
): CashRequestDoc | null {
  const requests = getCashRequests();
  const target = requests.find((r) => r.id === requestId);
  if (!target) return null;

  target.status = status;
  if (status === 'approved') {
    target.approvedAt = new Date().toISOString();

    // Automatically mark the user as paid in the users collection
    const user = getUserDoc(target.userId);
    if (user) {
      user.isPaid = true;
      user.validTill = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year access
      saveUserDoc(user);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CASH_REQUESTS, JSON.stringify(requests));
  }
  return target;
}
