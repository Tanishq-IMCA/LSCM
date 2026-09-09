import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import { query } from '@/server/db';

function ticketAccess(userId: string, admin: boolean) {
  return admin ? { clause: '', values: [] as string[] } : { clause: 'AND t.user_id = $2', values: [userId] };
}

async function getTicket(id: string, userId: string, admin: boolean) {
  const access = ticketAccess(userId, admin);
  const ticket = await query(
    `SELECT t.id, t.user_id, t.query_type, t.query_topic, t.status, t.typing_user_id, t.typing_at,
            t.updated_at, t.created_at, u.display_name, u.email, o.order_number
     FROM lscm_support_tickets t
     JOIN lscm_users u ON u.id = t.user_id
     LEFT JOIN lscm_requested_items o ON o.id = t.order_id
     WHERE t.id = $1 ${access.clause}`,
    [id, ...access.values],
  );
  return ticket.rows[0] || null;
}

function serializeMessage(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    senderId: String(row.sender_id),
    senderRole: String(row.sender_role),
    body: String(row.body),
    deliveredAt: new Date(String(row.delivered_at)).toISOString(),
    readAt: row.read_at ? new Date(String(row.read_at)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function typingIsActive(value: unknown) {
  return Boolean(value && new Date(String(value)).getTime() > Date.now() - 8000);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  const admin = isAdminUser(user);
  const id = String(req.query.id || '');
  const ticket = await getTicket(id, user.id, admin);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

  if (req.method === 'GET') {
    await query(
      'UPDATE lscm_support_messages SET read_at = CURRENT_TIMESTAMP WHERE ticket_id = $1 AND sender_id <> $2 AND read_at IS NULL',
      [id, user.id],
    );
    const messages = await query(
      `SELECT id, sender_id, sender_role, body, delivered_at, read_at, created_at
       FROM lscm_support_messages WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [id],
    );
    return res.status(200).json({
      success: true,
      ticket: {
        id: String(ticket.id),
        userId: String(ticket.user_id),
        customerName: String(ticket.display_name || ''),
        customerEmail: String(ticket.email || ''),
        orderNumber: ticket.order_number ? String(ticket.order_number) : null,
        queryType: String(ticket.query_type),
        queryTopic: String(ticket.query_topic),
        status: String(ticket.status),
        typing: Boolean(ticket.typing_user_id && String(ticket.typing_user_id) !== user.id && typingIsActive(ticket.typing_at)),
      },
      messages: messages.rows.map(serializeMessage),
    });
  }

  if (req.method === 'POST') {
    if (ticket.status === 'closed') return res.status(409).json({ success: false, message: 'Reopen this ticket before replying.' });
    const body = String(req.body?.message || '').trim().slice(0, 2000);
    if (!body) return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    await query(
      `INSERT INTO lscm_support_messages (id, ticket_id, sender_id, sender_role, body)
       VALUES ($1, $2, $3, $4, $5)`,
      [randomUUID(), id, user.id, admin ? 'admin' : 'customer', body],
    );
    await query(
      'UPDATE lscm_support_tickets SET typing_user_id = NULL, typing_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id],
    );
    return res.status(201).json({ success: true });
  }

  if (req.method !== 'PATCH') return res.status(405).json({ success: false, message: 'Method not allowed.' });
  const action = String(req.body?.action || '');
  if (action === 'typing') {
    const typing = Boolean(req.body?.typing);
    await query(
      `UPDATE lscm_support_tickets
       SET typing_user_id = ${typing ? '$2' : 'NULL'}, typing_at = ${typing ? 'CURRENT_TIMESTAMP' : 'NULL'}
       WHERE id = $1`,
      typing ? [id, user.id] : [id],
    );
    return res.status(200).json({ success: true });
  }

  if (action === 'close') {
    if (ticket.status === 'closed') return res.status(200).json({ success: true });
    await query(
      `UPDATE lscm_support_tickets SET status = 'closed', closed_by = $2, closed_at = CURRENT_TIMESTAMP,
       typing_user_id = NULL, typing_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id, user.id],
    );
    await query(
      `INSERT INTO lscm_support_messages (id, ticket_id, sender_id, sender_role, body)
       VALUES ($1, $2, $3, 'system', $4)`,
      [randomUUID(), id, user.id, `LSCM SYSTEM — Ticket closed by ${user.displayName}.`],
    );
    return res.status(200).json({ success: true });
  }

  if (action === 'reopen') {
    const reason = String(req.body?.reason || '').trim().slice(0, 500);
    if (!reason) return res.status(400).json({ success: false, message: 'Add a reason for reopening.' });
    await query(
      `UPDATE lscm_support_tickets SET status = 'open', closed_by = NULL, closed_at = NULL,
       typing_user_id = NULL, typing_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id],
    );
    await query(
      `INSERT INTO lscm_support_messages (id, ticket_id, sender_id, sender_role, body)
       VALUES ($1, $2, $3, 'system', $4)`,
      [randomUUID(), id, user.id, `LSCM SYSTEM — Ticket reopened by ${user.displayName}. Reason: ${reason}`],
    );
    return res.status(200).json({ success: true });
  }

  return res.status(400).json({ success: false, message: 'Unknown ticket action.' });
}