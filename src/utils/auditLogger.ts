import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Firestore,
  Timestamp,
} from 'firebase/firestore';

/**
 * Standard Firebase Configuration for Smart English Sathi
 */
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCZ2NCwRR1qBv_xeFSoFwxiJWWa_Gh2BYU",
  authDomain: "samart-english-sathi.firebaseapp.com",
  projectId: "samart-english-sathi",
  storageBucket: "samart-english-sathi.firebasestorage.app",
  messagingSenderId: "1044719140242",
  appId: "1:1044719140242:web:101127d5a7834fbc94554b",
  measurementId: "G-YFDBBSSBTJ"
};

/**
 * Action Categories for Audit Trails
 */
export type AuditActionType =
  | 'ADMIN_LOGIN_ATTEMPT'
  | 'ADMIN_LOGIN_SUCCESS'
  | 'ADMIN_LOGIN_FAILED'
  | 'ADMIN_LOCKOUT_TRIGGERED'
  | 'STUDENT_STATUS_CHANGE'
  | 'PASSWORD_CHANGED'
  | 'CURRICULUM_UPDATE'
  | 'SECURITY_OVERRIDE'
  | 'SYSTEM_CONFIG_CHANGE';

export interface AuditLogData {
  id?: string;
  timestamp: string; // ISO 8601 string
  udiseCode: string; // School UDISE code (e.g., '27330308103' or 'SUPER_ADMIN')
  action: AuditActionType | string; // Action tag
  actionDescription: string; // Comprehensive human-readable action description
  description?: string; // Standard alias
  user?: string; // Operator name (e.g. "Super Admin (Owner)")
  role?: string; // Role level (e.g. "super_admin", "coordinator")
  status?: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'WARNING' | 'PENDING';
  studentId?: string;
  studentName?: string;
  previousStatus?: string;
  newStatus?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt?: any;
}

let firestoreInstance: Firestore | null = null;
let firebaseAppInstance: FirebaseApp | null = null;

/**
 * Lazy initialization of Firestore client.
 * Does not crash if offline or if running in headless testing.
 */
export function getFirestoreDb(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  try {
    const existingApps = getApps();
    firebaseAppInstance = existingApps.length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
    firestoreInstance = getFirestore(firebaseAppInstance);
    return firestoreInstance;
  } catch (err) {
    console.warn('[AuditLogger] Firebase/Firestore init notice:', err);
    return null;
  }
}

/**
 * Core utility to log any administrative or critical security action into Firestore.
 * - Writes to the global 'adminAuditLogs' collection
 * - If udiseCode is an 11-digit school code, mirrors to 'schools/{udiseCode}/auditLogs'
 * - Also notifies the server API to keep backend in-memory log & sessions synced
 */
export async function logAuditEvent(
  entry: Omit<AuditLogData, 'timestamp'> & { timestamp?: string }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const timestamp = entry.timestamp || new Date().toISOString();
  const udiseCode = entry.udiseCode ? String(entry.udiseCode).trim() : 'SUPER_ADMIN';
  const actionDescription = entry.actionDescription || entry.description || 'Administrative Action Performed';

  const payload: AuditLogData = {
    ...entry,
    timestamp,
    udiseCode,
    actionDescription,
    description: actionDescription,
    user: entry.user || 'Admin Operator',
    role: entry.role || 'admin',
    status: entry.status || (entry.action.includes('FAIL') ? 'FAILED' : 'SUCCESS'),
    ip: entry.ip || (typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'),
    userAgent: entry.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Node/Applet'),
  };

  let firestoreDocId: string | undefined;

  // 1. Write to Firestore 'adminAuditLogs'
  const db = getFirestoreDb();
  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'adminAuditLogs'), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      firestoreDocId = docRef.id;

      // If valid 11-digit UDISE, also mirror under partitioned school
      if (/^\d{11}$/.test(udiseCode)) {
        try {
          await addDoc(collection(db, 'schools', udiseCode, 'auditLogs'), {
            ...payload,
            createdAt: serverTimestamp(),
          });
        } catch (partitionErr) {
          console.warn('[AuditLogger] School partition audit log note:', partitionErr);
        }
      }
    } catch (fsErr) {
      console.warn('[AuditLogger] Firestore addDoc note:', fsErr);
    }
  }

  // 2. Sync with Backend Server Audit Store (non-blocking)
  try {
    if (typeof fetch !== 'undefined') {
      fetch('/api/auth/admin-audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          id: firestoreDocId || `audit_${Date.now()}`,
          eventType: payload.action,
          details: payload.actionDescription,
        }),
      }).catch(() => {});
    }
  } catch {}

  // 3. Keep local storage fallback cache
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = JSON.parse(localStorage.getItem('sathi_audit_logs_cache') || '[]');
      cached.unshift({ ...payload, id: firestoreDocId || `audit_${Date.now()}` });
      if (cached.length > 100) cached.length = 100;
      localStorage.setItem('sathi_audit_logs_cache', JSON.stringify(cached));
    }
  } catch {}

  return {
    success: true,
    id: firestoreDocId || `local_${Date.now()}`,
  };
}

/**
 * Dedicated helper to log Admin Login attempts (Success, Failure, Lockout)
 * Automatically calculates UDISE code, descriptive messages, and timestamps.
 */
export async function logAdminLoginAttempt(params: {
  udiseCode?: string;
  user?: string;
  role?: string;
  success: boolean;
  reason?: string;
  ip?: string;
  userAgent?: string;
}): Promise<{ success: boolean; id?: string }> {
  const {
    udiseCode = 'SUPER_ADMIN',
    user = 'Admin',
    role = 'super_admin',
    success,
    reason,
    ip,
    userAgent,
  } = params;

  const action: AuditActionType = success ? 'ADMIN_LOGIN_SUCCESS' : 'ADMIN_LOGIN_FAILED';
  const status = success ? 'SUCCESS' : (reason && reason.includes('Too many') ? 'BLOCKED' : 'FAILED');

  let actionDescription = '';
  if (success) {
    actionDescription = `Admin login successful for ${user} (${role}) [UDISE: ${udiseCode}]. Session established.`;
  } else {
    actionDescription = `Failed admin login attempt for ${user} (${role}) [UDISE: ${udiseCode}]. Reason: ${reason || 'Invalid credentials'}.`;
  }

  return logAuditEvent({
    udiseCode,
    action,
    actionDescription,
    user,
    role,
    status,
    ip,
    userAgent,
    metadata: {
      attemptResult: success ? 'GRANTED' : 'DENIED',
      failureReason: reason,
    },
  });
}

/**
 * Dedicated helper to log critical student status modifications (Approve / Reject)
 * Records old vs new status, target student ID, school UDISE, and operator details.
 */
export async function logStudentStatusChange(params: {
  udiseCode: string;
  studentId: string;
  studentName?: string;
  previousStatus?: string;
  newStatus: 'APPROVED' | 'REJECTED' | 'PENDING' | string;
  adminUser?: string;
  adminRole?: string;
  reason?: string;
}): Promise<{ success: boolean; id?: string }> {
  const {
    udiseCode,
    studentId,
    studentName = 'Student',
    previousStatus = 'PENDING',
    newStatus,
    adminUser = 'Super Admin (Owner)',
    adminRole = 'super_admin',
    reason,
  } = params;

  const action: AuditActionType = 'STUDENT_STATUS_CHANGE';
  const actionDescription = `Super Admin action: Student status changed from [${previousStatus}] to [${newStatus}] for ${studentName} (ID: ${studentId}) under School UDISE ${udiseCode}.${reason ? ` Reason: ${reason}` : ''}`;

  return logAuditEvent({
    udiseCode,
    action,
    actionDescription,
    user: adminUser,
    role: adminRole,
    status: 'SUCCESS',
    studentId,
    studentName,
    previousStatus,
    newStatus,
    metadata: {
      studentId,
      studentName,
      previousStatus,
      newStatus,
      schoolUdise: udiseCode,
      reason,
    },
  });
}

/**
 * Fetches recent audit logs from Firestore 'adminAuditLogs', falling back to backend API if needed.
 */
export async function fetchAuditLogs(options?: {
  udiseCode?: string;
  limitCount?: number;
}): Promise<AuditLogData[]> {
  const maxRecords = options?.limitCount || 50;
  const db = getFirestoreDb();

  if (db) {
    try {
      const logsRef = collection(db, 'adminAuditLogs');
      let q = query(logsRef, orderBy('timestamp', 'desc'), limit(maxRecords));

      if (options?.udiseCode && options.udiseCode !== 'ALL') {
        q = query(logsRef, where('udiseCode', '==', options.udiseCode), orderBy('timestamp', 'desc'), limit(maxRecords));
      }

      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => {
          const data = d.data() as AuditLogData;
          return {
            id: d.id,
            ...data,
            // Format fallback time if needed
            timestamp: data.timestamp || (data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
          };
        });
      }
    } catch (err) {
      console.warn('[AuditLogger] Firestore getDocs notice, falling back to server audit API:', err);
    }
  }

  // Fallback 1: Fetch from server API
  try {
    const res = await fetch('/api/auth/admin-audit-logs');
    if (res.ok) {
      const data = await res.json();
      if (data.logs && Array.isArray(data.logs)) {
        return data.logs.map((l: any) => ({
          id: l.id,
          timestamp: l.timestamp,
          udiseCode: l.udiseCode || 'SUPER_ADMIN',
          action: l.action || l.eventType,
          actionDescription: l.actionDescription || l.details,
          user: l.user,
          role: l.role,
          status: l.eventType === 'LOGIN_SUCCESS' ? 'SUCCESS' : 'FAILED',
          ip: l.ip,
          userAgent: l.userAgent,
        }));
      }
    }
  } catch {}

  // Fallback 2: Local storage cache
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = JSON.parse(localStorage.getItem('sathi_audit_logs_cache') || '[]');
      if (Array.isArray(cached) && cached.length > 0) return cached;
    }
  } catch {}

  return [];
}
