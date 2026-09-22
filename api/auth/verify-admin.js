import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const SECURITY_STORE_PATH = path.join(DATA_DIR, 'admin-security-audit.json');

function hash(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getSecurityStore() {
  try {
    if (!fs.existsSync(SECURITY_STORE_PATH)) return {};
    const raw = fs.readFileSync(SECURITY_STORE_PATH, 'utf-8');
    if (!raw || !raw.trim()) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  const p = (req.body?.password || "").toString().trim();
  const MASTER_PASSWORDS = [process.env.ADMIN_MASTER_PASSWORD];
  const securityStore = getSecurityStore();
  const pHash = p ? hash(p) : '';

  const isMatch =
    MASTER_PASSWORDS.filter(Boolean).map(x => (x || "").toLowerCase()).includes(p.toLowerCase()) ||
    (securityStore.customAdminPassword && securityStore.customAdminPassword === p) ||
    (securityStore.adminPasswordHash && securityStore.adminPasswordHash === pHash);

  if (isMatch) {
    return res.status(200).json({
      success: true,
      user: {
        role: "admin",
        roleType: "super_admin",
        isSuperAdmin: true,
        name: "Super Admin (System Owner)",
        marathiName: "सुपर ॲडमिन (प्रणाली मालक)",
        identifier: "SUPER-ADMIN-2026",
        title: "Super Administrator & Multi-School Authority",
        avatar: "👑",
        loginTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    });
  }
  return res.status(401).json({ success: false, error: "Invalid password" });
}
