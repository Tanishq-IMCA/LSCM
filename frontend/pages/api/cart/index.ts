import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { currentUser } from '@/server/auth';
import { query } from '@/server/db';

const MAX_CART_QUANTITY = 20;

function serializeItem(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    productCode: String(row.product_code),
    productName: String(row.product_name),
    category: String(row.category),
    unitPrice: Number(row.unit_price),
    imagePath: String(row.image_path || '/grayscalemini.png'),
    quantity: Number(row.quantity),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

async function getCartForUser(userId: string) {
  const result = await query(
    `SELECT id, product_code, product_name, category, unit_price, image_path, quantity, created_at, updated_at
     FROM lscm_cart_items WHERE user_id = $1 ORDER BY category, created_at DESC`,
    [userId],
  );
  const items = result.rows.map(row => serializeItem(row));
  return {
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, ...(await getCartForUser(user.id)) });
    }

    if (req.method === 'POST') {
      const productCode = String(req.body?.productCode || '').trim().slice(0, 80);
      const productName = String(req.body?.productName || '').trim().slice(0, 160);
      const category = String(req.body?.category || '').trim().slice(0, 100);
      const unitPrice = Number(req.body?.unitPrice);
      const imagePath = String(req.body?.imagePath || '/grayscalemini.png').trim().slice(0, 240);
      if (!productCode || !productName || !category || !Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({ success: false, message: 'Invalid cart item.' });
      }

      const total = await query<{ total_quantity: string }>(
        'SELECT COALESCE(SUM(quantity), 0)::int AS total_quantity FROM lscm_cart_items WHERE user_id = $1',
        [user.id],
      );
      if (Number(total.rows[0]?.total_quantity || 0) >= MAX_CART_QUANTITY) {
        return res.status(400).json({ success: false, message: 'Your cart is limited to 20 items.' });
      }

      await query(
        `INSERT INTO lscm_cart_items (id, user_id, product_code, product_name, category, unit_price, image_path, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
         ON CONFLICT (user_id, product_code)
         DO UPDATE SET quantity = lscm_cart_items.quantity + 1, updated_at = CURRENT_TIMESTAMP`,
        [randomUUID(), user.id, productCode, productName, category, unitPrice, imagePath],
      );
      const cart = await getCartForUser(user.id);
      if (cart.totalQuantity > MAX_CART_QUANTITY) {
        await query('UPDATE lscm_cart_items SET quantity = quantity - 1 WHERE user_id = $1 AND product_code = $2', [user.id, productCode]);
        return res.status(400).json({ success: false, message: 'Your cart is limited to 20 items.' });
      }
      return res.status(200).json({ success: true, ...cart });
    }

    if (req.method === 'PATCH') {
      const id = String(req.body?.id || '').trim();
      const quantity = Number(req.body?.quantity);
      if (!id || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
      const others = await query<{ total_quantity: string }>(
        'SELECT COALESCE(SUM(quantity), 0)::int AS total_quantity FROM lscm_cart_items WHERE user_id = $1 AND id <> $2',
        [user.id, id],
      );
      if (Number(others.rows[0]?.total_quantity || 0) + quantity > MAX_CART_QUANTITY) {
        return res.status(400).json({ success: false, message: 'Your cart is limited to 20 items.' });
      }
      await query('UPDATE lscm_cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3', [quantity, id, user.id]);
      return res.status(200).json({ success: true, ...(await getCartForUser(user.id)) });
    }

    if (req.method === 'DELETE') {
      const id = String(req.query.id || '').trim();
      if (!id) return res.status(400).json({ success: false, message: 'Cart item is required.' });
      await query('DELETE FROM lscm_cart_items WHERE id = $1 AND user_id = $2', [id, user.id]);
      return res.status(200).json({ success: true, ...(await getCartForUser(user.id)) });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cart request failed.';
    return res.status(500).json({ success: false, message });
  }
}