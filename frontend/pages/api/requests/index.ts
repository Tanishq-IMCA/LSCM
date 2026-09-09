import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { query } from '@/server/db';

function serializeItem(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    orderNumber: String(row.order_number || row.id),
    productCode: String(row.product_code),
    productName: String(row.product_name),
    category: String(row.category),
    unitPrice: Number(row.unit_price),
    imagePath: String(row.image_path || '/grayscalemini.png'),
    quantity: Number(row.quantity),
    status: String(row.status),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });

    if (req.method === 'GET') {
      const result = await query(
        `SELECT id, order_number, product_code, product_name, category, unit_price, image_path, quantity,
                COALESCE(NULLIF(status, 'requested'), 'awaiting_approval') AS status, created_at, updated_at
         FROM lscm_requested_items WHERE user_id = $1 ORDER BY created_at DESC`,
        [user.id],
      );
      return res.status(200).json({ success: true, items: result.rows.map(row => serializeItem(row)) });
    }

    if (req.method === 'PATCH') {
      const id = String(req.body?.id || '').trim();
      const quantity = Number(req.body?.quantity);
      if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return res.status(400).json({ success: false, message: 'Quantity must be between 1 and 20.' });
      }
      const result = await query(
        `UPDATE lscm_requested_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3
         RETURNING id, product_code, product_name, category, unit_price, image_path, quantity, status, created_at, updated_at`,
        [quantity, id, user.id],
      );
      if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Requested item not found.' });
      return res.status(200).json({ success: true, item: serializeItem(result.rows[0]) });
    }

    if (req.method === 'DELETE') {
      const id = String(req.query.id || '').trim();
      if (!id) return res.status(400).json({ success: false, message: 'Requested item is required.' });
      await query('DELETE FROM lscm_requested_items WHERE id = $1 AND user_id = $2', [id, user.id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Requested items request failed.';
    return res.status(500).json({ success: false, message });
  }
}