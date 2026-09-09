import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import { pool, query } from '@/server/db';

const TOPICS = ['Order status', 'Delivery issue', 'Payment question', 'Account help', 'General question', 'Other'];

function serializeTicket(row: Record<string, unknown>, viewerId: string) {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    customerName: String(row.display_name || ''),
    customerEmail: String(row.email || ''),
    orderNumber: row.order_number ? String(row.order_number) : null,
    queryType: String(row.query_type),
    queryTopic: String(row.query_topic),
    status: String(row.status),
    unreadCount: Number(row.unread_count || 0),
    typing: Boolean(row.typing_user_id && String(row.typing_user_id) !== viewerId && row.typing_at && new Date(String(row.typing_at)).getTime() > Date.now() - 8000),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  const admin = Boolean(isAdminUser(user));

  if (req.method === 'GET') {
    const result = await query(
      `SELECT t.id, t.user_id, t.query_type, t.query_topic, t.status, t.typing_user_id, t.typing_at,
              t.updated_at, t.created_at, u.display_name, u.email, o.order_number,
              (SELECT COUNT(*) FROM lscm_support_messages m
               WHERE m.ticket_id = t.id
                 AND ${admin ? "m.sender_role = 'customer'" : 'm.sender_id <> $1'}
                 AND m.read_at IS NULL) AS unread_count
       FROM lscm_support_tickets t
       JOIN lscm_users u ON u.id = t.user_id
       LEFT JOIN lscm_requested_items o ON o.id = t.order_id
       ${admin ? '' : 'WHERE t.user_id = $1'}
       ORDER BY t.updated_at DESC`,
      [user.id],
    );
    const preference = await query(
      'SELECT support_read_receipts_enabled FROM lscm_users WHERE id = $1',
      [user.id],
    );
    return res.status(200).json({
      success: true,
      tickets: result.rows.map(row => serializeTicket(row, user.id)),
      readReceiptsEnabled: Boolean(preference.rows[0]?.support_read_receipts_enabled ?? true),
    });
  }

  if (req.method === 'PATCH') {
    if (!admin) return res.status(403).json({ success: false, message: 'Admin access required.' });
    if (String(req.body?.action || '') !== 'read_receipts') {
      return res.status(400).json({ success: false, message: 'Unknown support setting.' });
    }
    const enabled = Boolean(req.body?.readReceiptsEnabled);
    await query(
      'UPDATE lscm_users SET support_read_receipts_enabled = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id, enabled],
    );
    return res.status(200).json({ success: true, readReceiptsEnabled: enabled });
  }

  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' });
  if (admin) return res.status(403).json({ success: false, message: 'Only customers can open tickets.' });

  const queryType = String(req.body?.queryType || '');
  const queryTopic = String(req.body?.queryTopic || '').trim();
  const orderId = String(req.body?.orderId || '').trim() || null;
  const message = String(req.body?.message || '').trim().slice(0, 2000);
  if (!['order', 'general'].includes(queryType) || !TOPICS.includes(queryTopic) || !message) {
    return res.status(400).json({ success: false, message: 'Choose a valid ticket type, topic and message.' });
  }
  if (queryType === 'order' && !orderId) return res.status(400).json({ success: false, message: 'Choose an order for this ticket.' });
  if (orderId) {
    const order = await query('SELECT id FROM lscm_requested_items WHERE id = $1 AND user_id = $2', [orderId, user.id]);
    if (!order.rows[0]) return res.status(400).json({ success: false, message: 'That order is not available.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ticketId = randomUUID();
    await client.query(
      `INSERT INTO lscm_support_tickets (id, user_id, order_id, query_type, query_topic)
       VALUES ($1, $2, $3, $4, $5)`,
      [ticketId, user.id, orderId, queryType, queryTopic],
    );
    await client.query(
      `INSERT INTO lscm_support_messages (id, ticket_id, sender_id, sender_role, body)
       VALUES ($1, $2, $3, 'customer', $4)`,
      [randomUUID(), ticketId, user.id, message],
    );
    await client.query('COMMIT');
    return res.status(201).json({ success: true, ticketId });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    const text = error instanceof Error ? error.message : 'Could not open ticket.';
    return res.status(500).json({ success: false, message: text });
  } finally {
    client.release();
  }
}