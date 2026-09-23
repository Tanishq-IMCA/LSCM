import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import { deleteProductImages, ensureProductSchema, getProduct, listProducts, makeProductCode, saveProductImages } from '@/server/products';
import { query } from '@/server/db';

export const config = { api: { bodyParser: { sizeLimit: '25mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await ensureProductSchema();
  if (req.method === 'GET') return res.status(200).json({ success: true, products: await listProducts(String(req.query.page || '').trim() || undefined) });
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  if (!isAdminUser(user)) return res.status(403).json({ success: false, message: 'Admin access required.' });

  if (req.method === 'POST') {
    const body = (req.body || {}) as Record<string, unknown>;
    const page = String(body.page || '') as 'services' | 'cars' | 'outfits';
    const name = String(body.name || '').trim().slice(0, 160);
    const subtype = String(body.subtype || '').trim().slice(0, 100);
    const description = String(body.description || '').trim().slice(0, 2000);
    const price = Number(body.price);
    const stock = body.infiniteStock ? null : Math.max(0, Math.floor(Number(body.stock)));
    if (!['services', 'cars', 'outfits'].includes(page) || !name || !subtype || !description || !Number.isFinite(price) || price < 0 || (stock !== null && !Number.isFinite(stock))) {
      return res.status(400).json({ success: false, message: 'Complete the product fields.' });
    }
    let code = makeProductCode(page);
    while ((await query('SELECT 1 FROM lscm_products WHERE code = $1', [code])).rows[0]) code = makeProductCode(page);
    const id = randomUUID();
    await query(
      `INSERT INTO lscm_products (id, code, name, page, subtype, description, price, stock, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, code, name, page, subtype, description, price, stock, Boolean(body.featured)],
    );
    await saveProductImages(id, Array.isArray(body.images) ? body.images as Array<{ name?: unknown; data?: unknown }> : []);
    return res.status(201).json({ success: true, product: await getProduct(id) });
  }

  if (req.method === 'PATCH') {
    const body = (req.body || {}) as Record<string, unknown>;
    const id = String(body.id || '').trim();
    const name = String(body.name || '').trim().slice(0, 160);
    const subtype = String(body.subtype || '').trim().slice(0, 100);
    const description = String(body.description || '').trim().slice(0, 2000);
    const price = Number(body.price);
    const stock = body.infiniteStock ? null : Math.max(0, Math.floor(Number(body.stock)));
    if (!id || !name || !subtype || !description || !Number.isFinite(price) || price < 0 || (stock !== null && !Number.isFinite(stock))) return res.status(400).json({ success: false, message: 'Complete the product fields.' });
    const result = await query(
      `UPDATE lscm_products SET name=$1, subtype=$2, description=$3, price=$4, stock=$5, featured=$6, updated_at=CURRENT_TIMESTAMP
       WHERE id=$7 RETURNING id`,
      [name, subtype, description, price, stock, Boolean(body.featured), id],
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (Array.isArray(body.images) && body.images.length) await saveProductImages(id, body.images as Array<{ name?: unknown; data?: unknown }>);
    return res.status(200).json({ success: true, product: await getProduct(id) });
  }

  if (req.method === 'DELETE') {
    const id = String(req.body?.id || req.query.id || '').trim();
    if (!id || !(await getProduct(id))) return res.status(404).json({ success: false, message: 'Product not found.' });
    await deleteProductImages(id);
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}