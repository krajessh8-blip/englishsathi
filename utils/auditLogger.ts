export * from '../src/utils/auditLogger';
export {
  FIREBASE_CONFIG,
  getFirestoreDb,
  logAuditEvent,
  logAdminLoginAttempt,
  logStudentStatusChange,
  fetchAuditLogs,
} from '../src/utils/auditLogger';
export type {
  AuditActionType,
  AuditLogData,
} from '../src/utils/auditLogger';
