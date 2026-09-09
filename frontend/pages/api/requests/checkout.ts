import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { currentUser } from '@/server/auth';
import { pool } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' });

  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cart = await client.query(
      `SELECT product_code, product_name, category, unit_price, image_path, quantity
       FROM lscm_cart_items WHERE user_id = $1 ORDER BY created_at ASC FOR UPDATE`,
      [user.id],
    );
    if (!cart.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const requested = [];
    for (const row of cart.rows) {
      const result = await client.query(
        `INSERT INTO lscm_requested_items
          (id, user_id, product_code, product_name, category, unit_price, image_path, quantity, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'requested')
         RETURNING id, product_code, product_name, category, unit_price, image_path, quantity, status, created_at, updated_at`,
        [randomUUID(), user.id, row.product_code, row.product_name, row.category, row.unit_price, row.image_path, row.quantity],
      );
      requested.push(result.rows[0]);
    }
    await client.query('DELETE FROM lscm_cart_items WHERE user_id = $1', [user.id]);
    await client.query('COMMIT');
    return res.status(200).json({ success: true, items: requested, message: 'Request submitted.' });
  } catch (error: unknown) {
    await client.query('ROLLBACK').catch(() => undefined);
    const message = error instanceof Error ? error.message : 'Checkout failed.';
    return res.status(500).json({ success: false, message });
  } finally {
    client.release();
  }
}