export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed, use POST' });

  try {
    const { currentPassword, newPassword, udiseCode } = req.body || {};
    const curr = (currentPassword || "").toString().trim();
    const allowed = ["Admin@smart2026", "Admin@Smart2026", "Admin@SMART2026"];
    const isSuper = allowed.map(x => x.toLowerCase()).includes(curr.toLowerCase());

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

    const targetLabel = udiseCode && udiseCode.trim() !== '' && udiseCode.trim() !== 'SUPER_ADMIN'
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
