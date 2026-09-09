import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import { query } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  if (!isAdminUser(user)) return res.status(403).json({ success: false, message: 'Admin access required.' });

  if (req.method === 'GET') {
    const search = String(req.query.q || '').trim();
    const status = String(req.query.status || '').trim();
    const allowedStatuses = ['awaiting_approval', 'approved', 'finished'];
    const values: string[] = [];
    const clauses: string[] = [];
    if (search) {
      values.push(`%${search}%`);
      clauses.push(`(r.order_number ILIKE $${values.length} OR r.id ILIKE $${values.length} OR u.display_name ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
    }
    if (allowedStatuses.includes(status)) {
      values.push(status);
      clauses.push(`COALESCE(NULLIF(r.status, 'requested'), 'awaiting_approval') = $${values.length}`);
    }
    const result = await query(
      `SELECT r.id, COALESCE(r.order_number, r.id) AS order_number, r.product_code, r.product_name,
              r.category, r.unit_price, r.image_path, r.quantity,
              COALESCE(NULLIF(r.status, 'requested'), 'awaiting_approval') AS status,
              r.created_at, r.updated_at, u.display_name, u.email
       FROM lscm_requested_items r
       JOIN lscm_users u ON u.id = r.user_id
       ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
       ORDER BY r.created_at DESC`,
      values,
    );
    return res.status(200).json({ success: true, orders: result.rows });
  }

  if (req.method === 'PATCH') {
    const id = String(req.body?.id || '').trim();
    const status = String(req.body?.status || '').trim();
    if (!id || !['awaiting_approval', 'approved', 'finished'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order transition.' });
    }
    const result = await query(
      `UPDATE lscm_requested_items SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, COALESCE(order_number, id) AS order_number, status, updated_at`,
      [status, id],
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Order not found.' });
    return res.status(200).json({ success: true, order: result.rows[0] });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}