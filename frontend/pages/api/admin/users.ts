import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import { query } from '@/server/db';

const ROLES = new Set(['user', 'admin']);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  if (!isAdminUser(user)) return res.status(403).json({ success: false, message: 'Admin access required.' });

  if (req.method === 'GET') {
    const search = String(req.query.q || '').trim();
    const values = search ? [`%${search}%`] : [];
    const result = await query(
      `SELECT id, email, display_name, role, created_at
       FROM lscm_users
       ${search ? 'WHERE display_name ILIKE $1 OR email ILIKE $1' : ''}
       ORDER BY created_at DESC`,
      values,
    );
    return res.status(200).json({ success: true, users: result.rows });
  }

  if (req.method !== 'PATCH') return res.status(405).json({ success: false, message: 'Method not allowed.' });
  const id = String(req.body?.id || '').trim();
  const role = String(req.body?.role || '').trim().toLowerCase();
  if (!id || !ROLES.has(role)) return res.status(400).json({ success: false, message: 'Choose a valid user role.' });
  if (id === user.id && role !== 'admin') {
    return res.status(400).json({ success: false, message: 'Keep your own account as an admin.' });
  }

  const result = await query(
    `UPDATE lscm_users SET role = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, email, display_name, role, created_at`,
    [role, id],
  );
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.status(200).json({ success: true, user: result.rows[0] });
}