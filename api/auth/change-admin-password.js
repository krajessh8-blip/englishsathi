import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const SECURITY_STORE_PATH = path.join(DATA_DIR, 'admin-security-audit.json');

async function hash(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getSecurityStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(SECURITY_STORE_PATH)) {
      const initial = { auditLogs: [] };
      fs.writeFileSync(SECURITY_STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(SECURITY_STORE_PATH, 'utf-8');
    if (!raw || !raw.trim()) return { auditLogs: [] };
    return JSON.parse(raw);
  } catch {
    return { auditLogs: [] };
  }
}

async function saveSecurityStore(store) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SECURITY_STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving security store:', e);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed, use POST' });

  try {
    const { currentPassword, newPassword, udiseCode } = req.body || {};
    const curr = (currentPassword || "").toString().trim();
    const MASTER_PASSWORDS = [process.env.ADMIN_MASTER_PASSWORD];
    const securityStore = getSecurityStore();
    const currHash = curr ? await hash(curr) : '';

    const isSuper =
      MASTER_PASSWORDS.filter(Boolean).map(x => (x || "").toLowerCase()).includes(curr.toLowerCase()) ||
      (securityStore.customAdminPassword && securityStore.customAdminPassword === curr) ||
      (securityStore.adminPasswordHash && securityStore.adminPasswordHash === currHash);

    if (!curr || !isSuper) {
      return res.status(401).json({
        success: false,
        message: 'Current Super Admin master password verification failed.',
      });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long with numbers, letters, or symbols.',
      });
    }

    const cleanNewPass = newPassword.trim();
    const isSchool = udiseCode && udiseCode.trim() !== '' && udiseCode.trim() !== 'SUPER_ADMIN';

    if (isSchool) {
      const cleanUdise = udiseCode.trim();
      if (!securityStore.schoolPasswords) securityStore.schoolPasswords = {};
      securityStore.schoolPasswords[cleanUdise] = cleanNewPass;
    } else {
      securityStore.adminPasswordHash = await hash(cleanNewPass);
      securityStore.customAdminPassword = cleanNewPass;
    }

    await saveSecurityStore(securityStore);

    const targetLabel = isSchool
      ? `school (UDISE: ${udiseCode.trim()})`
      : 'Super Admin master';

    return res.status(200).json({
      success: true,
      message: `Admin password for ${targetLabel} updated successfully! New password is now active.`,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
