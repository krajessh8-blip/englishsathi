import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage path for persistent audit logs and dynamically updated admin credentials
const DATA_DIR = path.join(process.cwd(), "data");
const SECURITY_STORE_PATH = path.join(DATA_DIR, "admin-security-audit.json");

interface AuditLogEntry {
  id: string;
  timestamp: string;
  formattedTime: string;
  eventType: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "LOCKOUT_TRIGGERED" | "PASSWORD_CHANGED" | "STUDENT_STATUS_CHANGE" | "ADMIN_LOGIN_ATTEMPT" | string;
  action?: string;
  actionDescription?: string;
  udiseCode?: string;
  user: string;
  role: string;
  ip: string;
  userAgent: string;
  details: string;
  status?: string;
  studentId?: string;
  studentName?: string;
  previousStatus?: string;
  newStatus?: string;
}

// Background Firestore REST logger for persistence in cloud
async function writeLogToFirestoreRest(entry: Partial<AuditLogEntry>) {
  try {
    const url = "https://firestore.googleapis.com/v1/projects/samart-english-sathi/databases/(default)/documents/adminAuditLogs?key=AIzaSyCZ2NCwRR1qBv_xeFSoFwxiJWWa_Gh2BYU";
    const nowIso = entry.timestamp || new Date().toISOString();
    const udise = entry.udiseCode || "SUPER_ADMIN";
    const action = entry.action || entry.eventType || "ADMIN_ACTION";
    const description = entry.actionDescription || entry.details || "";

    const fields: Record<string, any> = {
      timestamp: { stringValue: nowIso },
      udiseCode: { stringValue: udise },
      action: { stringValue: action },
      actionDescription: { stringValue: description },
      description: { stringValue: description },
      user: { stringValue: entry.user || "Admin" },
      role: { stringValue: entry.role || "admin" },
      status: { stringValue: entry.status || (action.includes("FAIL") ? "FAILED" : "SUCCESS") },
      ip: { stringValue: entry.ip || "127.0.0.1" },
      userAgent: { stringValue: entry.userAgent || "Server" },
      details: { stringValue: entry.details || description },
    };

    if (entry.studentId) fields.studentId = { stringValue: entry.studentId };
    if (entry.studentName) fields.studentName = { stringValue: entry.studentName };
    if (entry.previousStatus) fields.previousStatus = { stringValue: entry.previousStatus };
    if (entry.newStatus) fields.newStatus = { stringValue: entry.newStatus };

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    }).catch(() => {});
  } catch (err) {
    console.warn("Firestore REST log notice:", err);
  }
}

interface SecurityStore {
  customAdminPassword?: string;
  schoolPasswords?: Record<string, string>;
  auditLogs: AuditLogEntry[];
}

function ensureSecurityStore(): SecurityStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SECURITY_STORE_PATH)) {
      const initial: SecurityStore = { auditLogs: [] };
      fs.writeFileSync(SECURITY_STORE_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(SECURITY_STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error loading security store:", err);
    return { auditLogs: [] };
  }
}

function saveSecurityStore(store: SecurityStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SECURITY_STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving security store:", err);
  }
}

function getSuperAdminPassword(): string {
  const store = ensureSecurityStore();
  if (store.customAdminPassword && store.customAdminPassword.trim().length >= 8) {
    return store.customAdminPassword.trim();
  }
  return "Admin@smart2026";
}

function getCoordinatorPassword(): string {
  return process.env.COORDINATOR_SECURE_KEY || "Coordinator@Anjali2026#Secure";
}

function getPrincipalPassword(): string {
  return process.env.PRINCIPAL_SECURE_KEY || "Principal@Dalvi2026#Secure";
}

function getActiveAdminPassword(): string {
  return getSuperAdminPassword();
}

// Multi-School Architecture (UDISE Partition & Unique Indexing)
const SCHOOLS_DIR = path.join(DATA_DIR, "schools");
const SCHOOLS_REGISTRY_PATH = path.join(DATA_DIR, "schools-registry.json");
const PENDING_SCHOOLS_PATH = path.join(DATA_DIR, "pending-schools.json");
const UDISE_INDEX_PATH = path.join(DATA_DIR, "udise-index.json");

interface SchoolInfo {
  udiseCode: string;
  schoolName: string;
  category?: string;
  medium?: string;
  city: string;
  district: string;
  taluka?: string;
  state: string;
  pincode?: string;
  schoolEmail?: string;
  schoolPhone?: string;
  principalName?: string;
  principalEmail?: string;
  principalPhone?: string;
  principalPassword?: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  coordinatorPassword?: string;
  studentStrength?: number | string;
  registeredDate: string;
  status: "ACTIVE" | "PENDING" | "REJECTED";
  approvedAt?: string;
  approvedBy?: string;
}

interface UdiseIndexRecord {
  udiseCode: string;
  schoolName: string;
  status: "ACTIVE" | "PENDING" | "REJECTED";
  registeredDate: string;
  source: "active" | "pending";
}

const DEFAULT_SCHOOLS: Record<string, SchoolInfo> = {};
const TEST_UDISES = new Set(["27330308103", "27251401201", "27240804302", "27210103401", "27340506202"]);

function getSchoolsRegistry(): Record<string, SchoolInfo> {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(SCHOOLS_REGISTRY_PATH)) {
      fs.writeFileSync(SCHOOLS_REGISTRY_PATH, JSON.stringify({}, null, 2), "utf-8");
      return {};
    }
    const raw = fs.readFileSync(SCHOOLS_REGISTRY_PATH, "utf-8");
    const parsed: Record<string, SchoolInfo> = JSON.parse(raw);
    let cleaned = false;
    for (const testId of TEST_UDISES) {
      if (parsed[testId]) {
        delete parsed[testId];
        cleaned = true;
      }
    }
    if (cleaned) {
      fs.writeFileSync(SCHOOLS_REGISTRY_PATH, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (err) {
    console.error("Error loading schools registry:", err);
    return {};
  }
}

function saveSchoolsRegistry(registry: Record<string, SchoolInfo>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SCHOOLS_REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving schools registry:", err);
  }
}

function getPendingSchools(): Record<string, SchoolInfo> {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(PENDING_SCHOOLS_PATH)) {
      fs.writeFileSync(PENDING_SCHOOLS_PATH, JSON.stringify({}, null, 2), "utf-8");
      return {};
    }
    const raw = fs.readFileSync(PENDING_SCHOOLS_PATH, "utf-8");
    const parsed: Record<string, SchoolInfo> = JSON.parse(raw);
    let cleaned = false;
    for (const testId of TEST_UDISES) {
      if (parsed[testId]) {
        delete parsed[testId];
        cleaned = true;
      }
    }
    if (cleaned) {
      fs.writeFileSync(PENDING_SCHOOLS_PATH, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (err) {
    console.error("Error loading pending schools:", err);
    return {};
  }
}

function savePendingSchools(pending: Record<string, SchoolInfo>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(PENDING_SCHOOLS_PATH, JSON.stringify(pending, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving pending schools:", err);
  }
}

function getUdiseIndex(): Record<string, UdiseIndexRecord> {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(UDISE_INDEX_PATH)) {
      const active = getSchoolsRegistry();
      const pending = getPendingSchools();
      const index: Record<string, UdiseIndexRecord> = {};
      for (const [code, s] of Object.entries(active)) {
        if (!TEST_UDISES.has(code)) {
          index[code] = {
            udiseCode: code,
            schoolName: s.schoolName,
            status: "ACTIVE",
            registeredDate: s.registeredDate,
            source: "active",
          };
        }
      }
      for (const [code, s] of Object.entries(pending)) {
        if (!TEST_UDISES.has(code) && !index[code]) {
          index[code] = {
            udiseCode: code,
            schoolName: s.schoolName,
            status: "PENDING",
            registeredDate: s.registeredDate,
            source: "pending",
          };
        }
      }
      fs.writeFileSync(UDISE_INDEX_PATH, JSON.stringify(index, null, 2), "utf-8");
      return index;
    }
    const raw = fs.readFileSync(UDISE_INDEX_PATH, "utf-8");
    const parsed: Record<string, UdiseIndexRecord> = JSON.parse(raw);
    for (const testId of TEST_UDISES) {
      if (parsed[testId]) delete parsed[testId];
    }
    return parsed;
  } catch (err) {
    console.error("Error loading UDISE index:", err);
    return {};
  }
}

function saveUdiseIndex(index: Record<string, UdiseIndexRecord>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(UDISE_INDEX_PATH, JSON.stringify(index, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving UDISE index:", err);
  }
}

// Global Unique Check for UDISE across active schools, pending requests, and index
function checkUdiseDuplicateAcrossAll(cleanUdise: string): {
  isDuplicate: boolean;
  status?: "ACTIVE" | "PENDING";
  schoolName?: string;
  message?: string;
  marathiError?: string;
} {
  const active = getSchoolsRegistry();
  const pending = getPendingSchools();
  const index = getUdiseIndex();

  const marathiMsg = "हा UDISE कोड आधीच नोंदणीकृत किंवा मंजुरीसाठी प्रलंबित आहे. कृपया वेगळा UDISE कोड वापरा.";

  if (active[cleanUdise]) {
    return {
      isDuplicate: true,
      status: "ACTIVE",
      schoolName: active[cleanUdise].schoolName,
      message: `UDISE code ${cleanUdise} is already registered as an Active School: "${active[cleanUdise].schoolName}". (${marathiMsg})`,
      marathiError: marathiMsg,
    };
  }

  if (pending[cleanUdise]) {
    return {
      isDuplicate: true,
      status: "PENDING",
      schoolName: pending[cleanUdise].schoolName,
      message: `UDISE code ${cleanUdise} already has a Pending Registration Request for: "${pending[cleanUdise].schoolName}". (${marathiMsg})`,
      marathiError: marathiMsg,
    };
  }

  if (index[cleanUdise]) {
    const rec = index[cleanUdise];
    return {
      isDuplicate: true,
      status: rec.status === "ACTIVE" ? "ACTIVE" : "PENDING",
      schoolName: rec.schoolName,
      message: `UDISE code ${cleanUdise} is already recorded in database: "${rec.schoolName}". (${marathiMsg})`,
      marathiError: marathiMsg,
    };
  }

  return { isDuplicate: false };
}

function getSchoolStudentsPath(udiseCode: string): string {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SCHOOLS_DIR)) {
    fs.mkdirSync(SCHOOLS_DIR, { recursive: true });
  }
  const schoolFolder = path.join(SCHOOLS_DIR, udiseCode);
  if (!fs.existsSync(schoolFolder)) {
    fs.mkdirSync(schoolFolder, { recursive: true });
  }
  return path.join(schoolFolder, "students.json");
}

function getStudentsForSchool(udiseCode: string): any[] {
  try {
    const filePath = getSchoolStudentsPath(udiseCode);
    if (!fs.existsSync(filePath)) {
      const initialStudents: any[] = [];
      fs.writeFileSync(filePath, JSON.stringify(initialStudents, null, 2), "utf-8");
      return initialStudents;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading students for ${udiseCode}:`, err);
    return [];
  }
}

function saveStudentsForSchool(udiseCode: string, students: any[]): void {
  try {
    const filePath = getSchoolStudentsPath(udiseCode);
    fs.writeFileSync(filePath, JSON.stringify(students, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error saving students for ${udiseCode}:`, err);
  }
}

function getAllPendingStudentsGrouped(): { groups: any[]; totalPending: number } {
  const registry = getSchoolsRegistry();
  const groups: any[] = [];
  let totalPending = 0;

  for (const udiseCode of Object.keys(registry)) {
    const school = registry[udiseCode];
    const students = getStudentsForSchool(udiseCode);
    const pending = students.filter((s: any) => s.status === "PENDING");
    if (pending.length > 0) {
      totalPending += pending.length;
      groups.push({
        udiseCode,
        schoolName: school.schoolName,
        city: school.city,
        district: school.district,
        pendingCount: pending.length,
        students: pending,
      });
    }
  }

  if (fs.existsSync(SCHOOLS_DIR)) {
    const dirEntries = fs.readdirSync(SCHOOLS_DIR);
    for (const dirName of dirEntries) {
      if (!registry[dirName] && /^\d{11}$/.test(dirName)) {
        const students = getStudentsForSchool(dirName);
        const pending = students.filter((s: any) => s.status === "PENDING");
        if (pending.length > 0) {
          totalPending += pending.length;
          groups.push({
            udiseCode: dirName,
            schoolName: `School UDISE ${dirName}`,
            city: "Maharashtra",
            district: "Maharashtra",
            pendingCount: pending.length,
            students: pending,
          });
        }
      }
    }
  }

  return { groups, totalPending };
}

function appendAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp" | "formattedTime">): AuditLogEntry {
  const store = ensureSecurityStore();
  const now = new Date();
  const newEntry: AuditLogEntry = {
    id: "audit_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    timestamp: now.toISOString(),
    formattedTime: now.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Kolkata",
    }),
    udiseCode: entry.udiseCode || "SUPER_ADMIN",
    action: entry.action || entry.eventType,
    actionDescription: entry.actionDescription || entry.details,
    ...entry,
  };
  store.auditLogs.unshift(newEntry);
  if (store.auditLogs.length > 200) {
    store.auditLogs = store.auditLogs.slice(0, 200);
  }
  saveSecurityStore(store);

  // Background mirror to Firestore
  writeLogToFirestoreRest(newEntry);

  return newEntry;
}

// In-memory rate limiting map for admin password attempts
interface RateLimitRecord {
  attempts: number;
  lockUntil: number;
}
const adminRateLimitMap = new Map<string, RateLimitRecord>();

function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Admin Security Status endpoint
  app.get("/api/auth/admin-status", (req, res) => {
    const ip = getClientIp(req);
    const record = adminRateLimitMap.get(ip);
    const now = Date.now();
    if (record && record.lockUntil > now) {
      return res.json({
        isLocked: true,
        lockUntil: record.lockUntil,
        secondsRemaining: Math.ceil((record.lockUntil - now) / 1000),
        message: "Too many attempts. Try after 5 minutes",
      });
    }
    return res.json({
      isLocked: false,
      secondsRemaining: 0,
    });
  });

  // Secure Admin Password Verification endpoint
  app.post("/api/auth/verify-admin", (req, res) => {
    const ip = getClientIp(req);
    const userAgent = (req.headers["user-agent"] as string) || "Unknown";
    const record = adminRateLimitMap.get(ip) || { attempts: 0, lockUntil: 0 };
    const now = Date.now();

    // Check if client is currently locked out
    if (record.lockUntil > now) {
      return res.status(429).json({
        success: false,
        isLocked: true,
        lockUntil: record.lockUntil,
        secondsRemaining: Math.ceil((record.lockUntil - now) / 1000),
        message: "Too many attempts. Try after 5 minutes",
      });
    }

    const { password } = req.body || {};
    if (!password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Secured password is required.",
      });
    }

    const trimmed = password.trim();
    const superAdminPass = getSuperAdminPassword().trim();
    const coordinatorPass = getCoordinatorPassword().trim();
    const principalPass = getPrincipalPassword().trim();

    const allowed = ["Admin@smart2026", "Admin@Smart2026", "Admin@SMART2026"];
    const isSuperAdminMatch = allowed.map(x => x.toLowerCase()).includes(trimmed.toLowerCase()) || trimmed === superAdminPass;

    // 1. Super Admin Match (Highest Role / Owner)
    if (isSuperAdminMatch) {
      adminRateLimitMap.delete(ip);
      appendAuditLog({
        eventType: "LOGIN_SUCCESS",
        action: "ADMIN_LOGIN_SUCCESS",
        actionDescription: "Super Admin (System Owner) authenticated successfully.",
        udiseCode: "SUPER_ADMIN",
        user: "Super Admin",
        role: "super_admin",
        status: "SUCCESS",
        ip,
        userAgent,
        details: "Super Admin (System Owner) authenticated successfully.",
      });

      return res.json({
        success: true,
        user: {
          role: "admin",
          roleType: "super_admin",
          isSuperAdmin: true,
          name: "Super Admin (Owner)",
          marathiName: "सुपर ॲडमिन (प्रणाली मालक)",
          identifier: "SUPER-ADM (Owner)",
          title: "Super Administrator & Multi-School Authority",
          avatar: "👑",
          loginTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      });
    }

    // 2. Coordinator Match (Teacher Anjali Sawant)
    if (trimmed === coordinatorPass) {
      adminRateLimitMap.delete(ip);
      appendAuditLog({
        eventType: "LOGIN_SUCCESS",
        action: "ADMIN_LOGIN_SUCCESS",
        actionDescription: "English Dept Coordinator Teacher Anjali Sawant authenticated successfully under UDISE 27330308103.",
        udiseCode: "27330308103",
        user: "Teacher Anjali Sawant",
        role: "coordinator",
        status: "SUCCESS",
        ip,
        userAgent,
        details: "English Dept Coordinator Teacher Anjali Sawant authenticated successfully under UDISE 27330308103.",
      });

      return res.json({
        success: true,
        user: {
          role: "admin",
          roleType: "coordinator",
          isSuperAdmin: false,
          udiseCode: "27330308103",
          schoolName: "Smart English Sathi Model School",
          name: "Teacher Anjali Sawant",
          marathiName: "सौ. अंजली सावंत मॅडम",
          identifier: "COORD-01 (Ambajogai)",
          title: "English Dept Coordinator (Ambajogai 27330308103)",
          avatar: "🛡️",
          loginTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      });
    }

    // 3. Principal / School Admin Match
    const store = ensureSecurityStore();
    const reqUdise = (req.body?.udiseCode || "27330308103").toString().trim();
    const customSchoolPass = store.schoolPasswords?.[reqUdise];
    if (trimmed === principalPass || (customSchoolPass && trimmed === customSchoolPass)) {
      adminRateLimitMap.delete(ip);
      appendAuditLog({
        eventType: "LOGIN_SUCCESS",
        action: "ADMIN_LOGIN_SUCCESS",
        actionDescription: `School Principal / Admin authenticated successfully under UDISE ${reqUdise}.`,
        udiseCode: reqUdise,
        user: "Principal Sumant D. Dalvi",
        role: "principal",
        status: "SUCCESS",
        ip,
        userAgent,
        details: `Principal authenticated successfully for UDISE ${reqUdise}.`,
      });

      return res.json({
        success: true,
        user: {
          role: "principal",
          roleType: "principal",
          isSuperAdmin: false,
          udiseCode: reqUdise,
          schoolName: "Smart English Sathi Model School",
          name: "Principal Sumant D. Dalvi",
          marathiName: "मा. प्राचार्य सुमंत डी. दळवी",
          identifier: `PRIN-01 (${reqUdise})`,
          title: "Principal • Model School Portal",
          avatar: "🎓",
          loginTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      });
    }

    // Wrong password handling with rate limiting
    record.attempts += 1;
    if (record.attempts >= 3) {
      record.lockUntil = now + 5 * 60 * 1000;
      record.attempts = 0;
      adminRateLimitMap.set(ip, record);

      appendAuditLog({
        eventType: "LOCKOUT_TRIGGERED",
        action: "ADMIN_LOCKOUT_TRIGGERED",
        actionDescription: "3 failed password attempts reached. Account locked for 5 minutes.",
        udiseCode: "SUPER_ADMIN",
        user: "Unknown User",
        role: "admin",
        status: "BLOCKED",
        ip,
        userAgent,
        details: "3 failed password attempts reached. Account locked for 5 minutes.",
      });

      return res.status(429).json({
        success: false,
        isLocked: true,
        lockUntil: record.lockUntil,
        secondsRemaining: 300,
        message: "Too many attempts. Try after 5 minutes",
      });
    } else {
      adminRateLimitMap.set(ip, record);
      const attemptsRemaining = 3 - record.attempts;

      appendAuditLog({
        eventType: "LOGIN_FAILED",
        action: "ADMIN_LOGIN_FAILED",
        actionDescription: `Failed admin login attempt: Incorrect password (${record.attempts}/3 attempts).`,
        udiseCode: "SUPER_ADMIN",
        user: "Unknown User",
        role: "admin",
        status: "FAILED",
        ip,
        userAgent,
        details: `Incorrect password attempt (${record.attempts}/3).`,
      });

      return res.status(401).json({
        success: false,
        attemptsRemaining,
        message: `Incorrect secured password. (${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining before 5-minute lockout)`,
      });
    }
  });

  // Super Admin Change Admin Password endpoint (Master or specific UDISE School)
  app.post("/api/auth/change-admin-password", (req, res) => {
    const ip = getClientIp(req);
    const userAgent = (req.headers["user-agent"] as string) || "Unknown";
    const { currentPassword, newPassword, udiseCode } = req.body || {};

    const activePassword = getSuperAdminPassword();

    if (!currentPassword || currentPassword.trim() !== activePassword.trim()) {
      return res.status(401).json({
        success: false,
        message: "Current Super Admin master password verification failed.",
      });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long with uppercase, lowercase, numbers, or symbols.",
      });
    }

    const store = ensureSecurityStore();

    if (udiseCode && udiseCode.trim() !== "" && udiseCode.trim() !== "SUPER_ADMIN") {
      const cleanUdise = udiseCode.trim();
      if (!store.schoolPasswords) {
        store.schoolPasswords = {};
      }
      store.schoolPasswords[cleanUdise] = newPassword.trim();
      saveSecurityStore(store);

      try {
        const registry = getSchoolsRegistry();
        if (registry[cleanUdise]) {
          (registry[cleanUdise] as any).adminPassword = newPassword.trim();
          saveSchoolsRegistry(registry);
        }
      } catch (err) {
        console.warn("Notice: could not update registry school password:", err);
      }

      appendAuditLog({
        eventType: "PASSWORD_CHANGED",
        action: "SCHOOL_PASSWORD_CHANGED",
        actionDescription: `Administrator password updated for school UDISE ${cleanUdise}.`,
        user: "Super Admin",
        role: "super_admin",
        udiseCode: cleanUdise,
        status: "SUCCESS",
        ip,
        userAgent,
        details: `Administrator password updated for school UDISE ${cleanUdise}.`,
      });

      return res.json({
        success: true,
        message: `Admin password for school (UDISE: ${cleanUdise}) updated successfully! New password is now active.`,
      });
    }

    // Default: Super Admin Master Password
    store.customAdminPassword = newPassword.trim();
    saveSecurityStore(store);

    appendAuditLog({
      eventType: "PASSWORD_CHANGED",
      action: "SUPER_ADMIN_PASSWORD_CHANGED",
      actionDescription: "Super Admin master password changed successfully.",
      user: "Super Admin",
      role: "super_admin",
      udiseCode: "SUPER_ADMIN",
      status: "SUCCESS",
      ip,
      userAgent,
      details: "Super Admin master password successfully changed.",
    });

    return res.json({
      success: true,
      message: "Super Admin master password updated successfully! New password is now active.",
    });
  });

  // Admin Audit Logs endpoint - Retrieve
  app.get("/api/auth/admin-audit-logs", (_req, res) => {
    const store = ensureSecurityStore();
    return res.json({
      success: true,
      logs: store.auditLogs,
    });
  });

  // Admin Audit Logs endpoint - Append (from client utils/auditLogger)
  app.post("/api/auth/admin-audit-log", (req, res) => {
    try {
      const ip = getClientIp(req);
      const userAgent = (req.headers["user-agent"] as string) || "Unknown";
      const {
        udiseCode = "SUPER_ADMIN",
        action = "ADMIN_ACTION",
        actionDescription,
        description,
        user = "Admin",
        role = "admin",
        status = "SUCCESS",
        details,
        studentId,
        studentName,
        previousStatus,
        newStatus,
      } = req.body || {};

      const finalDescription = actionDescription || description || details || "Admin action performed.";

      const newLog = appendAuditLog({
        eventType: action,
        action,
        actionDescription: finalDescription,
        udiseCode,
        user,
        role,
        status,
        ip,
        userAgent,
        details: finalDescription,
        studentId,
        studentName,
        previousStatus,
        newStatus,
      });

      return res.json({
        success: true,
        log: newLog,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Failed to append audit log",
      });
    }
  });

  // --- MULTI-SCHOOL STUDENT APPROVAL ENDPOINTS ---

  // 1. Get Pending Approvals grouped by UDISE
  app.get("/api/admin/pending-students", (_req, res) => {
    const result = getAllPendingStudentsGrouped();
    res.json({
      success: true,
      ...result,
    });
  });

  // 2. Change Student Status (Approved by that school's Principal or Super Admin)
  app.post(["/api/admin/students/status", "/api/schools/:udise/students/status"], (req, res) => {
    const ip = getClientIp(req);
    const userAgent = (req.headers["user-agent"] as string) || "Unknown";
    const { udiseCode, studentId, newStatus, roleType, role, isSuperAdmin, adminKey } = req.body || {};
    const targetUdise = req.params.udise || udiseCode;

    // Authority Check:
    // - Super Admin can approve students for any school
    // - Principal can approve students of their OWN school UDISE
    const isSuper = isSuperAdmin === true || roleType === "super_admin" || (adminKey && adminKey === getSuperAdminPassword());
    const isPrincipal = role === "principal" || roleType === "principal";

    if (!isSuper && !isPrincipal) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only School Principal or Super Admin can approve or reject students. (मुख्याध्यापक किंवा सुपर ॲडमिन मंजुरी आवश्यक आहे)",
      });
    }

    if (!targetUdise || !studentId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: udiseCode, studentId, and newStatus ('APPROVED' | 'REJECTED').",
      });
    }

    if (newStatus !== "APPROVED" && newStatus !== "REJECTED" && newStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Allowed: 'APPROVED', 'REJECTED', 'PENDING'.",
      });
    }

    const students = getStudentsForSchool(targetUdise);
    const studentIndex = students.findIndex((s: any) => s.id === studentId);

    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found under school UDISE ${targetUdise}.`,
      });
    }

    const student = students[studentIndex];
    const previousStatus = student.status || "PENDING";
    const approverLabel = isSuper ? "Super Admin" : "School Principal";

    student.status = newStatus;
    student.updatedAt = new Date().toISOString();
    student.approvedBy = approverLabel;

    saveStudentsForSchool(targetUdise, students);

    const studentDisplayName = student.name || student.studentName || student.fullName || studentId;
    const actionDesc = `Student ${studentDisplayName} (${student.rollNo || student.id}) under School UDISE ${targetUdise} status updated from [${previousStatus}] to [${newStatus}] by ${approverLabel}.`;

    appendAuditLog({
      eventType: "STUDENT_STATUS_CHANGE",
      action: "STUDENT_STATUS_CHANGE",
      actionDescription: actionDesc,
      udiseCode: targetUdise,
      user: approverLabel,
      role: isSuper ? "super_admin" : "principal",
      status: "SUCCESS",
      ip,
      userAgent,
      details: actionDesc,
      studentId,
      studentName: studentDisplayName,
      previousStatus,
      newStatus,
    });

    const pendingData = getAllPendingStudentsGrouped();

    return res.json({
      success: true,
      message: `Student status successfully updated to ${newStatus} by ${approverLabel}.`,
      student,
      ...pendingData,
    });
  });

  // 3. Register New Student (Status = PENDING under active UDISE school)
  app.post("/api/students/register", (req, res) => {
    const {
      udiseCode,
      studentName,
      name,
      className,
      grade,
      rollNumber,
      rollNo,
      section,
      div,
      parentPhone,
      mobile,
      gender,
      password,
    } = req.body || {};

    const cleanUdise = String(udiseCode || "").trim();
    if (!cleanUdise || !/^\d{11}$/.test(cleanUdise)) {
      return res.status(400).json({
        success: false,
        message: "Invalid School UDISE code. Must be exactly 11 numeric digits.",
      });
    }

    const resolvedName = String(studentName || name || "").trim();
    if (!resolvedName) {
      return res.status(400).json({
        success: false,
        message: "Student Full Name is required.",
      });
    }

    // School MUST be active for student registration
    const registry = getSchoolsRegistry();
    const schoolInfo = registry[cleanUdise];
    if (!schoolInfo || (schoolInfo.status && schoolInfo.status !== "ACTIVE")) {
      return res.status(400).json({
        success: false,
        message: "The selected school is not registered or not yet active. Students can only register after Super Admin approves the school. (निवडलेली शाळा अद्याप सक्रिय नाही.)",
        marathiMessage: "निवडलेली शाळा अद्याप सक्रिय नाही. सुपर ॲडमिन मंजुरीनंतरच विद्यार्थी नोंदणी करू शकतात.",
      });
    }

    const resolvedClass = String(className || grade || "Class 5").trim();
    const resolvedRoll = String(rollNumber || rollNo || "").trim();
    const resolvedDiv = String(div || section || "A").trim().toUpperCase();
    const resolvedPhone = String(parentPhone || mobile || "").trim();

    const students = getStudentsForSchool(cleanUdise);

    // Create student under schools/{UDISE}/students with status PENDING
    const newStudentId = `std_${cleanUdise}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newStudent = {
      id: newStudentId,
      udiseCode: cleanUdise,
      schoolName: schoolInfo.schoolName,
      name: resolvedName,
      className: resolvedClass,
      grade: resolvedClass,
      rollNo: resolvedRoll || "01",
      section: resolvedDiv,
      mobile: resolvedPhone || "+91 98000 00000",
      parentPhone: resolvedPhone || "+91 98000 00000",
      parentName: "Parent of " + resolvedName,
      gender: gender || "female",
      date: new Date().toISOString().split("T")[0],
      registrationDate: new Date().toISOString(),
      // Must be PENDING upon registration - requires Principal approval
      status: "PENDING",
      password: password || undefined,
      totalScore: 0,
      speechFluencyScore: 0,
      vocabMasteryScore: 0,
      roleplayAccuracy: 0,
      attendanceRate: 100,
      completedSituationIds: [],
    };

    students.unshift(newStudent);
    saveStudentsForSchool(cleanUdise, students);

    return res.status(201).json({
      success: true,
      status: "PENDING",
      message: "Registration submitted successfully. Pending approval by school Principal.",
      marathiMessage: "नोंदणी सबमिट झाली आहे. शाळेच्या मुख्याध्यापकांच्या मंजुरीची प्रतीक्षा आहे.",
      student: {
        id: newStudent.id,
        udiseCode: newStudent.udiseCode,
        name: newStudent.name,
        className: newStudent.className,
        rollNo: newStudent.rollNo,
        section: newStudent.section,
        status: newStudent.status,
      },
    });
  });

  // 4. Student Login Verification
  app.post("/api/students/login", (req, res) => {
    const { udiseCode, rollNumber, rollNo, div, section, password } = req.body || {};
    const cleanUdise = String(udiseCode || "").trim();

    if (!cleanUdise) {
      return res.status(400).json({
        success: false,
        message: "School UDISE code is required.",
      });
    }

    const registry = getSchoolsRegistry();
    const schoolInfo = registry[cleanUdise];
    if (!schoolInfo || (schoolInfo.status && schoolInfo.status !== "ACTIVE")) {
      return res.status(403).json({
        success: false,
        message: "School is not currently active. (शाळा अद्याप सक्रिय नाही.)",
        marathiMessage: "शाळा अद्याप सक्रिय नाही. कृपया मुख्याध्यापकांशी संपर्क साधा.",
      });
    }

    const students = getStudentsForSchool(cleanUdise);
    const targetRoll = String(rollNumber || rollNo || "").trim().toLowerCase();
    const targetDiv = String(div || section || "").trim().toLowerCase();

    // Find student by roll number & division
    const student = students.find((s: any) => {
      const sRoll = String(s.rollNo || "").trim().toLowerCase();
      const sDiv = String(s.section || "").trim().toLowerCase();
      if (targetDiv) {
        return sRoll === targetRoll && sDiv === targetDiv;
      }
      return sRoll === targetRoll;
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "No student record found with this Roll Number and Division under school UDISE " + cleanUdise,
      });
    }

    // If student password was registered, verify it
    if (student.password && password && student.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect student password. Please re-enter or contact your teacher.",
      });
    }

    // CHECK APPROVAL STATUS: Login is BLOCKED if PENDING or REJECTED!
    if (student.status === "PENDING") {
      return res.status(403).json({
        success: false,
        isPending: true,
        status: "PENDING",
        message: "Pending Principal approval. (मुख्याध्यापकांच्या मंजुरीची प्रतीक्षा आहे.)",
        marathiMessage: "आपली नोंदणी प्रलंबित आहे. कृपया शाळेच्या मुख्याध्यापक मंजुरीची प्रतीक्षा करा.",
      });
    }

    if (student.status === "REJECTED") {
      return res.status(403).json({
        success: false,
        isRejected: true,
        status: "REJECTED",
        message: "Registration was rejected by Principal. Please contact school administration.",
        marathiMessage: "नोंदणी मुख्याध्यापकांद्वारे नाकारली गेली आहे. कृपया शाळा प्रशासनाशी संपर्क साधा.",
      });
    }

    // APPROVED: Allow login
    return res.json({
      success: true,
      status: "APPROVED",
      student,
    });
  });

  // 5. Check UDISE Duplicate across ALL collections (schools, pendingRequests, index)
  app.get("/api/schools/check-udise/:udise", (req, res) => {
    const cleanUdise = String(req.params.udise || "").trim();
    if (!cleanUdise || !/^\d{11}$/.test(cleanUdise)) {
      return res.status(400).json({
        success: false,
        message: "Invalid School UDISE code. Must be exactly 11 numeric digits.",
      });
    }

    const check = checkUdiseDuplicateAcrossAll(cleanUdise);
    return res.json({
      success: true,
      exists: check.isDuplicate,
      isDuplicate: check.isDuplicate,
      status: check.status,
      schoolName: check.schoolName,
      message: check.message,
      marathiError: check.marathiError,
    });
  });

  // 6. Get ONLY Active Schools list for public student dropdowns
  app.get("/api/schools", (_req, res) => {
    const registry = getSchoolsRegistry();
    const activeSchools = Object.values(registry).filter((s) => s.status === "ACTIVE" || !s.status);
    return res.json({
      success: true,
      schools: activeSchools,
    });
  });

  // 7. Get Pending Schools/Principals requests for Super Admin
  app.get("/api/admin/pending-schools", (_req, res) => {
    const pending = getPendingSchools();
    const pendingList = Object.values(pending).filter((s) => s.status === "PENDING" || !s.status);
    return res.json({
      success: true,
      count: pendingList.length,
      pendingSchools: pendingList,
    });
  });

  // 8. Super Admin Approve or Reject School/Principal Registration
  app.post("/api/admin/schools/approve", (req, res) => {
    const { udiseCode, action } = req.body || {}; // action: 'APPROVE' | 'REJECT'
    const cleanUdise = String(udiseCode || "").trim();
    if (!cleanUdise) {
      return res.status(400).json({
        success: false,
        message: "School UDISE code is required.",
      });
    }

    const pending = getPendingSchools();
    const target = pending[cleanUdise];

    if (!target) {
      return res.status(404).json({
        success: false,
        message: `No pending school registration found for UDISE ${cleanUdise}.`,
      });
    }

    const ip = getClientIp(req);
    const userAgent = (req.headers["user-agent"] as string) || "Server";

    if (action === "REJECT") {
      delete pending[cleanUdise];
      savePendingSchools(pending);

      const index = getUdiseIndex();
      delete index[cleanUdise];
      saveUdiseIndex(index);

      appendAuditLog({
        eventType: "SCHOOL_REJECTED",
        action: "SCHOOL_REJECTED",
        actionDescription: `School registration request for "${target.schoolName}" (UDISE: ${cleanUdise}) was rejected by Super Admin.`,
        udiseCode: cleanUdise,
        user: "Super Admin",
        role: "super_admin",
        status: "REJECTED",
        ip,
        userAgent,
        details: `Rejected registration for ${target.schoolName} (${cleanUdise})`,
      });

      return res.json({
        success: true,
        message: `School registration request for ${target.schoolName} (UDISE: ${cleanUdise}) was rejected. (शाळा नोंदणी अर्ज नाकारण्यात आला.)`,
      });
    }

    // Default: APPROVE -> Move from Pending to Active Registry!
    delete pending[cleanUdise];
    savePendingSchools(pending);

    const registry = getSchoolsRegistry();
    const approvedSchool: SchoolInfo = {
      ...target,
      status: "ACTIVE",
      approvedAt: new Date().toISOString(),
      approvedBy: "Super Admin",
    };
    registry[cleanUdise] = approvedSchool;
    saveSchoolsRegistry(registry);

    // Update UDISE index to ACTIVE
    const index = getUdiseIndex();
    index[cleanUdise] = {
      udiseCode: cleanUdise,
      schoolName: approvedSchool.schoolName,
      status: "ACTIVE",
      registeredDate: approvedSchool.registeredDate,
      source: "active",
    };
    saveUdiseIndex(index);

    // Initialize school students directory
    const tenantFilePath = getSchoolStudentsPath(cleanUdise);
    if (!fs.existsSync(tenantFilePath)) {
      fs.writeFileSync(tenantFilePath, JSON.stringify([], null, 2), "utf-8");
    }

    appendAuditLog({
      eventType: "SCHOOL_APPROVED",
      action: "SCHOOL_ACTIVATED",
      actionDescription: `School "${approvedSchool.schoolName}" (UDISE: ${cleanUdise}) approved by Super Admin and activated.`,
      udiseCode: cleanUdise,
      user: "Super Admin",
      role: "super_admin",
      status: "SUCCESS",
      ip,
      userAgent,
      details: `School ${approvedSchool.schoolName} (UDISE: ${cleanUdise}) moved to active status.`,
    });

    return res.json({
      success: true,
      message: `School "${approvedSchool.schoolName}" (UDISE: ${cleanUdise}) approved and activated successfully! (शाळा यशस्वीरीत्या मंजूर आणि सक्रिय करण्यात आली आहे.)`,
      school: approvedSchool,
    });
  });

  // 9. Manual Add Principal in Super Admin (with Duplicate UDISE check)
  app.post("/api/admin/schools/add-principal", (req, res) => {
    const {
      udiseCode,
      schoolName,
      principalName,
      principalEmail,
      principalPhone,
      principalPassword,
      coordinatorName,
      coordinatorPhone,
      coordinatorEmail,
      coordinatorPassword,
      category,
      medium,
      city,
      district,
      state,
    } = req.body || {};

    const cleanUdise = String(udiseCode || "").trim();
    if (!cleanUdise || !/^\d{11}$/.test(cleanUdise)) {
      return res.status(400).json({
        success: false,
        message: "School UDISE code must be exactly 11 numeric digits.",
      });
    }

    // UNIQUE CHECK ACROSS ALL COLLECTIONS
    const check = checkUdiseDuplicateAcrossAll(cleanUdise);
    if (check.isDuplicate) {
      return res.status(409).json({
        success: false,
        duplicateUdise: true,
        message: check.message,
        marathiError: check.marathiError,
      });
    }

    const registry = getSchoolsRegistry();
    const newSchool: SchoolInfo = {
      udiseCode: cleanUdise,
      schoolName: String(schoolName || `School ${cleanUdise}`).trim(),
      category: String(category || "Zilla Parishad / Government").trim(),
      medium: String(medium || "Semi-English").trim(),
      city: String(city || "Maharashtra").trim(),
      district: String(district || "Maharashtra").trim(),
      state: String(state || "Maharashtra").trim(),
      principalName: String(principalName || "Principal").trim(),
      principalEmail: String(principalEmail || `principal_${cleanUdise}@school.edu`).trim(),
      principalPhone: String(principalPhone || "").trim(),
      coordinatorName: String(coordinatorName || "").trim(),
      coordinatorEmail: String(coordinatorEmail || "").trim(),
      coordinatorPhone: String(coordinatorPhone || "").trim(),
      registeredDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      approvedAt: new Date().toISOString(),
      approvedBy: "Super Admin (Manual Creation)",
    };
    registry[cleanUdise] = newSchool;
    saveSchoolsRegistry(registry);

    const index = getUdiseIndex();
    index[cleanUdise] = {
      udiseCode: cleanUdise,
      schoolName: newSchool.schoolName,
      status: "ACTIVE",
      registeredDate: newSchool.registeredDate,
      source: "active",
    };
    saveUdiseIndex(index);

    const tenantFilePath = getSchoolStudentsPath(cleanUdise);
    if (!fs.existsSync(tenantFilePath)) {
      fs.writeFileSync(tenantFilePath, JSON.stringify([], null, 2), "utf-8");
    }

    if (principalPassword || coordinatorPassword) {
      const store = ensureSecurityStore();
      if (!store.schoolPasswords) store.schoolPasswords = {};
      if (principalPassword) store.schoolPasswords[`principal_${cleanUdise}`] = String(principalPassword).trim();
      if (coordinatorPassword) store.schoolPasswords[`coord_${cleanUdise}`] = String(coordinatorPassword).trim();
      saveSecurityStore(store);
    }

    appendAuditLog({
      eventType: "PRINCIPAL_MANUAL_CREATED",
      action: "MANUAL_PRINCIPAL_ADDED",
      actionDescription: `Super Admin manually added principal "${newSchool.principalName}" for school "${newSchool.schoolName}" (UDISE: ${cleanUdise}).`,
      udiseCode: cleanUdise,
      user: "Super Admin",
      role: "super_admin",
      status: "SUCCESS",
      ip: getClientIp(req),
      userAgent: (req.headers["user-agent"] as string) || "Server",
      details: `Manual creation of active principal & school for UDISE ${cleanUdise}`,
    });

    return res.status(201).json({
      success: true,
      message: `Principal and school added successfully! (शाळा आणि मुख्याध्यापक सक्रिय करण्यात आले.)`,
      school: newSchool,
    });
  });

  // 10. Get all students for a specific school UDISE
  app.get("/api/schools/:udise/students", (req, res) => {
    const udise = req.params.udise;
    const students = getStudentsForSchool(udise);
    return res.json({
      success: true,
      udiseCode: udise,
      students,
    });
  });

  // 11. Register New School - STATUS IS PENDING! (NO AUTO-ACTIVE EVER!)
  app.post("/api/schools/register", (req, res) => {
    const {
      udiseCode,
      schoolName,
      category,
      medium,
      state,
      district,
      taluka,
      city,
      pincode,
      schoolEmail,
      schoolPhone,
      principalName,
      principalPhone,
      principalEmail,
      principalPassword,
      coordinatorName,
      coordinatorPhone,
      coordinatorEmail,
      coordinatorPassword,
      studentStrength,
    } = req.body || {};

    const cleanUdise = String(udiseCode || "").trim();
    if (!cleanUdise || !/^\d{11}$/.test(cleanUdise)) {
      return res.status(400).json({
        success: false,
        message: "Invalid School UDISE code. Must be exactly 11 numeric digits.",
      });
    }

    // CHECK DUPLICATE UDISE ACROSS ALL COLLECTIONS: schools, pendingRequests, index
    const check = checkUdiseDuplicateAcrossAll(cleanUdise);
    if (check.isDuplicate) {
      return res.status(409).json({
        success: false,
        duplicateUdise: true,
        message: check.message,
        marathiError: check.marathiError,
      });
    }

    // Save into PENDING SCHOOLS (NO AUTO-ACTIVE EVER!)
    const pending = getPendingSchools();
    const newPendingRecord: SchoolInfo = {
      udiseCode: cleanUdise,
      schoolName: String(schoolName || `School ${cleanUdise}`).trim(),
      category: String(category || "Zilla Parishad / Government").trim(),
      medium: String(medium || "Semi-English").trim(),
      city: String(city || "Maharashtra").trim(),
      district: String(district || "Maharashtra").trim(),
      taluka: String(taluka || "").trim(),
      state: String(state || "Maharashtra").trim(),
      pincode: String(pincode || "").trim(),
      schoolEmail: String(schoolEmail || "").trim(),
      schoolPhone: String(schoolPhone || "").trim(),
      principalName: String(principalName || "Principal").trim(),
      principalEmail: String(principalEmail || "").trim(),
      principalPhone: String(principalPhone || "").trim(),
      principalPassword: String(principalPassword || "").trim(),
      coordinatorName: String(coordinatorName || "").trim(),
      coordinatorEmail: String(coordinatorEmail || "").trim(),
      coordinatorPhone: String(coordinatorPhone || "").trim(),
      coordinatorPassword: String(coordinatorPassword || "").trim(),
      studentStrength: studentStrength || "150-300",
      registeredDate: new Date().toISOString().split("T")[0],
      status: "PENDING",
    };
    pending[cleanUdise] = newPendingRecord;
    savePendingSchools(pending);

    // Save to UDISE index as PENDING
    const index = getUdiseIndex();
    index[cleanUdise] = {
      udiseCode: cleanUdise,
      schoolName: newPendingRecord.schoolName,
      status: "PENDING",
      registeredDate: newPendingRecord.registeredDate,
      source: "pending",
    };
    saveUdiseIndex(index);

    // Securely record passwords for pending school
    if (principalPassword || coordinatorPassword) {
      const store = ensureSecurityStore();
      if (!store.schoolPasswords) store.schoolPasswords = {};
      if (principalPassword) store.schoolPasswords[`principal_${cleanUdise}`] = String(principalPassword).trim();
      if (coordinatorPassword) store.schoolPasswords[`coord_${cleanUdise}`] = String(coordinatorPassword).trim();
      saveSecurityStore(store);
    }

    appendAuditLog({
      eventType: "SCHOOL_REGISTRATION_PENDING",
      action: "SCHOOL_REGISTRATION_SUBMITTED",
      actionDescription: `New school registration submitted for "${newPendingRecord.schoolName}" (UDISE: ${cleanUdise}). Status is PENDING Super Admin approval.`,
      udiseCode: cleanUdise,
      user: "Registration Portal",
      role: "school_applicant",
      status: "PENDING",
      ip: getClientIp(req),
      userAgent: (req.headers["user-agent"] as string) || "Server",
      details: `New school registration request pending for UDISE ${cleanUdise}.`,
    });

    return res.status(201).json({
      success: true,
      status: "PENDING",
      message: "School registration submitted successfully. It is now pending Super Admin approval. (शाळा नोंदणी यशस्वीरीत्या सादर झाली आहे. सुपर ॲडमिन मंजुरीची प्रतीक्षा आहे.)",
      school: newPendingRecord,
    });
  });

  // Redirect legacy HTML registration requests to /register (handled by SPA)
  app.get(["/register.html", "/school-register.html", "/school-register"], (_req, res) => {
    res.redirect("/register");
  });

  // AI Teacher Roleplay feedback endpoint
  app.post("/api/roleplay", async (req, res) => {
    const { situationTitle, level, messages, studentInput } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        fallback: true,
        message: "Gemini API key not configured on server, using curriculum engine.",
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `You are Teacher Anjali, a kind, encouraging, and articulate Indian English teacher with a warm tone. You are speaking with your school student Riya in Maharashtra, India.
Current Situation: "${situationTitle}" (Level: ${level}).
Student Riya just replied: "${studentInput}".
Your task:
1. Respond to Riya naturally as Teacher Anjali in 1-2 spoken English sentences suitable for this situation.
2. Provide an accurate, polite Marathi translation (मराठी अनुवाद) for your response in "teacherMarathi".
3. Provide a quick tip (1 sentence) praising good vocabulary or suggesting a polite alternative if needed.
Format response in JSON:
{
  "teacherReply": "English response...",
  "teacherMarathi": "मराठी भाषांतर...",
  "tip": "Tip...",
  "scoreBonus": 10
}`;

      const historySummary = (messages || [])
        .slice(-6)
        .map((m: { role: string; text: string }) => `${m.role === "teacher" ? "Teacher" : "Riya"}: ${m.text}`)
        .join("\n");

      const prompt = `Conversation history:\n${historySummary}\n\nRiya says: "${studentInput}"\n\nGenerate your response as Teacher Anjali, Marathi translation, and English feedback in JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({
        success: true,
        teacherReply: parsed.teacherReply || "Well done, Riya! That was very well expressed.",
        teacherMarathi: parsed.teacherMarathi || "छान, रिया! तू तुझे विचार खूप चांगल्या प्रकारे व्यक्त केलेस.",
        tip: parsed.tip || "Great grammar and clear expression!",
        scoreBonus: parsed.scoreBonus || 10,
      });
    } catch (err: unknown) {
      console.error("Gemini roleplay error:", err);
      return res.status(200).json({
        fallback: true,
        error: "Fallback to script",
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Explicit route for Super Admin Portal
    app.get(["/stc-admin-secure-2026", "/stc-admin-secure-2026/*"], (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart English Sathi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
