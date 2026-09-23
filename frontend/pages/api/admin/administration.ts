import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import { query } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  if (!isAdminUser(user)) return res.status(403).json({ success: false, message: 'Admin access required.' });
  if (req.method === 'GET') {
    const result = await query('SELECT maintenance_mode, maintenance_message FROM lscm_site_settings WHERE id = 1');
    const row = result.rows[0] || {};
    return res.status(200).json({ success: true, maintenanceMode: Boolean(row.maintenance_mode), maintenanceMessage: String(row.maintenance_message || '') });
  }
  if (req.method !== 'PATCH') return res.status(405).json({ success: false, message: 'Method not allowed.' });
  const maintenanceMode = Boolean(req.body?.maintenanceMode);
  const maintenanceMessage = String(req.body?.maintenanceMessage || '').trim().slice(0, 500);
  const result = await query(
    `UPDATE lscm_site_settings SET maintenance_mode = $1, maintenance_message = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = 1 RETURNING maintenance_mode, maintenance_message`,
    [maintenanceMode, maintenanceMessage],
  );
  return res.status(200).json({ success: true, maintenanceMode: Boolean(result.rows[0]?.maintenance_mode), maintenanceMessage: String(result.rows[0]?.maintenance_message || '') });
}