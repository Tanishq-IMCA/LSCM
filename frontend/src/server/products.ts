import { randomUUID } from 'crypto';
import { mkdir, unlink } from 'fs/promises';
import path from 'path';
import { query } from './db';

export type ProductPage = 'services' | 'cars' | 'outfits';

export type Product = {
  id: string;
  code: string;
  name: string;
  page: ProductPage;
  subtype: string;
  description: string;
  price: number;
  stock: number | null;
  featured: boolean;
  images: string[];
  createdAt: string;
};

const SEED_PRODUCTS = [
  ['LSCM-ACC-010', 'Starter Account Boost', 'services', 'Account Boosting', 'A clean jumpstart for a stacked, playable account.', 10, null, false],
  ['LSCM-ACC-025', 'Premium Account Boost', 'services', 'Account Boosting', 'The full starter package, expanded with premium unlocks.', 25, null, true],
  ['LSCM-ACC-050', 'Deluxe Account Boost', 'services', 'Account Boosting', 'The highest account tier for players who want the complete setup.', 50, null, false],
  ['LSCM-MOD-005', 'Fully Modded Car Garage', 'services', 'Custom Services', 'One custom garage prepared around your preferred builds.', 5, null, false],
  ['LSCM-HST-010', 'Heist Preparation', 'services', 'Custom Services', 'Get a modded heist prepared and ready to run.', 10, null, false],
  ['LSCM-VIP-015', 'VIP Membership · 1 Month', 'services', 'VIP Membership', 'Priority community access and member-only benefits for one month.', 15, null, false],
  ['LSCM-VIP-035', 'VIP Membership · 2 Months', 'services', 'VIP Membership', 'Two months of VIP access plus one month free.', 35, null, true],
  ['LSCM-MTH-125', 'LSCM Method Access', 'services', 'Methods & Access', 'Access the methods and guided setup used to run premium heists.', 125, null, false],
  ['LSCM-ADD-001', 'Modded Outfit Add-on', 'services', 'Add-ons', 'Add one custom modded outfit to an account service.', 1, null, false],
  ['LSCM-ADD-050', 'Panther + Diamonds Prep', 'services', 'Add-ons', 'A full Panther Cayo gold and Casino Diamonds preparation add-on.', 10, null, false],
  ['LSCM-OUT-M-001', 'SpongeBob Street Set', 'outfits', 'Male Outfits', 'A yellow-coded statement piece for crews that refuse to blend in.', 1, null, false],
  ['LSCM-OUT-M-002', 'Redline', 'outfits', 'Male Outfits', 'Clean red layers with enough attitude to start a lobby incident.', 1, null, false],
  ['LSCM-OUT-M-003', 'Purple Sweat', 'outfits', 'Male Outfits', 'Soft on the outside, suspiciously competitive on the inside.', 1, null, false],
  ['LSCM-OUT-M-004', 'Pony Jugg', 'outfits', 'Male Outfits', 'A playful custom fit with an unexpectedly serious finish.', 1, null, false],
  ['LSCM-OUT-M-005', 'Blue FBI Sweat', 'outfits', 'Male Outfits', 'Federal energy, unofficial credentials and excellent lobby presence.', 1, null, false],
  ['LSCM-OUT-M-006', 'Demon', 'outfits', 'Male Outfits', 'Dark, sharp and built for making an entrance without an introduction.', 1, null, false],
  ['LSCM-OUT-M-007', 'Noose', 'outfits', 'Male Outfits', 'A severe monochrome look for players who take the dress code personally.', 1, null, false],
  ['LSCM-OUT-M-008', 'Chris · Resident Evil', 'outfits', 'Male Outfits', 'Tactical survival style, ready for another very long night.', 1, null, false],
  ['LSCM-OUT-M-009', 'Pink Galaxy', 'outfits', 'Male Outfits', 'Cosmic colour and clean lines for an orbit above the ordinary.', 1, null, false],
  ['LSCM-OUT-M-010', 'Blue Galaxy', 'outfits', 'Male Outfits', 'Deep-space blues with a cool finish and zero gravitational pull.', 1, null, false],
  ['LSCM-OUT-M-011', 'Black Sweat', 'outfits', 'Male Outfits', 'A stealthy essential for low-profile missions and high-profile exits.', 1, null, false],
  ['LSCM-OUT-M-012', 'Red Tryhard', 'outfits', 'Male Outfits', 'Maximum competitive posture. Confidence will not vary.', 1, null, false],
  ['LSCM-OUT-M-013', 'Blue-White Tryhard', 'outfits', 'Male Outfits', 'A crisp two-tone loadout for those who came to win the fit check.', 1, null, false],
  ['LSCM-OUT-M-014', 'Pink Flippers', 'outfits', 'Male Outfits', 'Unreasonably cheerful, surprisingly rare and ready for the shoreline.', 1, null, false],
  ['LSCM-OUT-M-015', "Neo's First Sweat Outfit", 'outfits', 'Male Outfits', 'The original chapter. A little nostalgic, still dangerously comfortable.', 1, null, false],
] as const;

let schemaReady: Promise<void> | null = null;

export function ensureProductSchema() {
  if (!schemaReady) schemaReady = createProductSchema();
  return schemaReady;
}

async function createProductSchema() {
  await query(`CREATE TABLE IF NOT EXISTS lscm_products (
    id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    page TEXT NOT NULL CHECK (page IN ('services', 'cars', 'outfits')),
    subtype TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock INTEGER CHECK (stock IS NULL OR stock >= 0), featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS lscm_product_images (
    id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES lscm_products(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS lscm_product_images_product_idx ON lscm_product_images (product_id, sort_order);`);
  for (const product of SEED_PRODUCTS) {
    await query(
      `INSERT INTO lscm_products (id, code, name, page, subtype, description, price, stock, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (code) DO NOTHING`,
      [randomUUID(), ...product],
    );
  }
}

export async function listProducts(page?: string) {
  await ensureProductSchema();
  const selection = productSelect(page ? 'WHERE p.page = $1' : '');
  const result = await query(selection.text, page ? [page] : []);
  return result.rows.map(toProduct);
}

export async function getProduct(id: string) {
  await ensureProductSchema();
  const selection = productSelect('WHERE p.id = $1');
  const result = await query(selection.text, [id]);
  return result.rows[0] ? toProduct(result.rows[0]) : null;
}

export async function getProductByCode(code: string) {
  await ensureProductSchema();
  const selection = productSelect('WHERE p.code = $1');
  const result = await query(selection.text, [code]);
  return result.rows[0] ? toProduct(result.rows[0]) : null;
}

function productSelect(where: string) {
  return {
    text: `SELECT p.id, p.code, p.name, p.page, p.subtype, p.description, p.price, p.stock, p.featured, p.created_at,
      COALESCE((SELECT json_agg(i.image_path ORDER BY i.sort_order) FROM lscm_product_images i WHERE i.product_id = p.id), '[]'::json) AS images
      FROM lscm_products p ${where} ORDER BY p.created_at DESC`,
  };
}

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id), code: String(row.code), name: String(row.name),
    page: row.page as ProductPage, subtype: String(row.subtype), description: String(row.description || ''),
    price: Number(row.price), stock: row.stock === null ? null : Number(row.stock), featured: Boolean(row.featured),
    images: Array.isArray(row.images) ? row.images.map(String) : [], createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export async function saveProductImages(productId: string, images: Array<{ name?: unknown; data?: unknown }>) {
  const dir = path.join(process.cwd(), 'public', 'uploads', 'products');
  await mkdir(dir, { recursive: true });
  const paths: string[] = [];
  for (const image of images.slice(0, 8)) {
    const data = String(image.data || '');
    const match = data.match(/^data:(image\/(?:png|jpe?g|webp|gif));base64,([A-Za-z0-9+/=]+)$/i);
    if (!match) continue;
    const ext = match[1].split('/')[1].replace('jpeg', 'jpg').toLowerCase();
    const file = `${randomUUID()}.${ext}`;
    await import('fs/promises').then(fs => fs.writeFile(path.join(dir, file), Buffer.from(match[2], 'base64')));
    paths.push(`/uploads/products/${file}`);
  }
  for (const [index, imagePath] of paths.entries()) {
    await query('INSERT INTO lscm_product_images (id, product_id, image_path, sort_order) VALUES ($1, $2, $3, $4)', [randomUUID(), productId, imagePath, index]);
  }
}

export async function deleteProductImages(id: string) {
  const result = await query<{ image_path: string }>('SELECT image_path FROM lscm_product_images WHERE product_id = $1', [id]);
  await query('DELETE FROM lscm_products WHERE id = $1', [id]);
  await Promise.all(result.rows.map(async row => {
    if (!row.image_path.startsWith('/uploads/products/')) return;
    await unlink(path.join(process.cwd(), 'public', row.image_path)).catch(() => undefined);
  }));
}

export function makeProductCode(page: ProductPage) {
  const prefix = page === 'services' ? 'SVC' : page === 'cars' ? 'CAR' : 'OUT';
  return `LSCM-${prefix}-${Math.floor(100 + Math.random() * 900)}`;
}