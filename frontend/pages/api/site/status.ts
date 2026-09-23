import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import { query } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed.' });
  const user = await currentUser(req);
  const result = await query('SELECT maintenance_mode, maintenance_message FROM lscm_site_settings WHERE id = 1');
  const settings = result.rows[0] || { maintenance_mode: false, maintenance_message: '' };
  const admin = Boolean(user && isAdminUser(user));
  return res.status(200).json({
    success: true,
    maintenanceMode: Boolean(settings.maintenance_mode) && !admin,
    maintenanceMessage: String(settings.maintenance_message || ''),
    banned: Boolean(user?.banned) && !admin,
    banReason: String(user?.banReason || ''),
  });
}