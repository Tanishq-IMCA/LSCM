import { useEffect, useMemo, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import { apiFetch, apiGet, apiPatch, apiPost } from '@/lib/api';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';

type Product = {
  id: string; code: string; name: string; page: 'services' | 'cars' | 'outfits';
  subtype: string; description: string; price: number; stock: number | null; featured: boolean; images: string[];
};
type Draft = { name: string; page: Product['page']; subtype: string; description: string; price: string; stock: string; infiniteStock: boolean; featured: boolean };
const EMPTY: Draft = { name: '', page: 'services', subtype: 'Custom Services', description: '', price: '', stock: '', infiniteStock: true, featured: false };
const PAGE_LABELS = { services: 'Services', cars: 'Cars', outfits: 'Outfits' };
const SUBTYPES = { services: ['Account Boosting', 'Custom Services', 'VIP Membership', 'Methods & Access', 'Add-ons'], cars: ['Heavy Vehicles', 'Light Vehicles', 'Motorbikes', 'Others'], outfits: ['Male Outfits', 'Female Outfits'] };

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await currentUser(req as never);
  if (!user) return { redirect: { destination: '/auth', permanent: false } };
  if (!isAdminUser(user)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
};

async function readFiles(files: FileList | null) {
  if (!files) return [];
  return Promise.all(Array.from(files).slice(0, 8).map(file => new Promise<{ name: string; data: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, data: String(reader.result) });
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  })));
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState<Product | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try { setProducts((await apiGet<{ products: Product[] }>('/api/products')).products || []); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load products.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const subtypes = useMemo(() => SUBTYPES[draft.page], [draft.page]);
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(current => ({ ...current, [key]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      const images = await readFiles(files);
      const body = { ...draft, price: Number(draft.price), stock: Number(draft.stock), images };
      const result = editing
        ? await apiPatch<{ product: Product }>('/api/products', { ...body, id: editing.id })
        : await apiPost<{ product: Product }>('/api/products', body);
      setProducts(current => editing ? current.map(item => item.id === editing.id ? result.product : item) : [result.product, ...current]);
      setDraft(EMPTY); setEditing(null); setFiles(null); setMessage(editing ? 'Product updated.' : 'Product created.');
      const input = document.getElementById('product-images') as HTMLInputElement | null; if (input) input.value = '';
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save product.'); }
    finally { setBusy(false); }
  };

  const edit = (product: Product) => {
    setEditing(product);
    setDraft({ name: product.name, page: product.page, subtype: product.subtype, description: product.description, price: String(product.price), stock: String(product.stock ?? ''), infiniteStock: product.stock === null, featured: product.featured });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const remove = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}" and all of its pictures?`)) return;
    setBusy(true);
    try { await apiFetch('/api/products', { method: 'DELETE', body: JSON.stringify({ id: product.id }) }); setProducts(current => current.filter(item => item.id !== product.id)); setMessage('Product and pictures deleted.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not delete product.'); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen pt-24"><Header /><section className="mx-auto max-w-[1700px] px-6 py-16 md:px-10 xl:px-14">
    <Link href="/admin" className="text-[10px] uppercase tracking-[0.3em] text-white/35 hover:text-white/70">← Admin categories</Link>
    <p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em] text-[var(--accent)]">LSCM // CATALOGUE CONTROL</p>
    <GlitchyText text="PRODUCT MANAGER" as="h1" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" />
    <p className="mt-5 max-w-3xl text-sm leading-7 text-white/40">Build clean catalogue entries and place them directly into the correct storefront collection.</p>
    <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.7fr)]">
      <section className="glass-panel p-6 md:p-8">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">{editing ? 'Edit listing' : 'New listing'}</p><h2 className="mt-3 text-2xl uppercase tracking-[0.08em] text-white">{editing ? editing.code : 'Create product'}</h2></div>{editing && <button type="button" onClick={() => { setEditing(null); setDraft(EMPTY); }} className="text-[10px] uppercase tracking-[0.16em] text-white/40 hover:text-white">Cancel edit</button>}</div>
        <form onSubmit={save} className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="md:col-span-2"><span className="field-label">Product title</span><input required value={draft.name} onChange={e => update('name', e.target.value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white" placeholder="Midnight Street Build" /></label>
          <label><span className="field-label">Store page</span><select value={draft.page} onChange={e => { const page = e.target.value as Draft['page']; setDraft(current => ({ ...current, page, subtype: SUBTYPES[page][0] })); }} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white">{Object.entries(PAGE_LABELS).map(([value, label]) => <option key={value} value={value} className="bg-[#100b1d]">{label}</option>)}</select></label>
          <label><span className="field-label">Collection / type</span><select value={draft.subtype} onChange={e => update('subtype', e.target.value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white">{subtypes.map(item => <option key={item} className="bg-[#100b1d]">{item}</option>)}</select></label>
          <label><span className="field-label">Price · USD</span><input required min="0" step="0.01" type="number" value={draft.price} onChange={e => update('price', e.target.value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white" placeholder="25.00" /></label>
          <label><span className="field-label">Stock available</span><input disabled={draft.infiniteStock} min="0" step="1" type="number" value={draft.stock} onChange={e => update('stock', e.target.value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white disabled:opacity-30" placeholder="0" /></label>
          <label className="flex items-end gap-3 pb-3"><input type="checkbox" checked={draft.infiniteStock} onChange={e => update('infiniteStock', e.target.checked)} className="accent-[var(--accent)]" /><span className="field-label">Infinite stock</span></label>
          <label className="flex items-end gap-3 pb-3"><input type="checkbox" checked={draft.featured} onChange={e => update('featured', e.target.checked)} className="accent-[var(--accent)]" /><span className="field-label">Featured listing</span></label>
          <label className="md:col-span-2"><span className="field-label">Description</span><textarea required value={draft.description} onChange={e => update('description', e.target.value)} className="input-glass mt-2 min-h-32 w-full px-4 py-3 text-sm leading-6 text-white" placeholder="What does the customer receive?" /></label>
          <label className="md:col-span-2"><span className="field-label">Product pictures · up to 8</span><input id="product-images" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={e => setFiles(e.target.files)} className="mt-2 block w-full text-xs text-white/60 file:mr-4 file:border file:border-white/15 file:bg-white/[0.04] file:px-4 file:py-3 file:text-[10px] file:uppercase file:tracking-[0.16em] file:text-white/70" /><span className="mt-2 block text-[9px] uppercase tracking-[0.12em] text-white/25">New pictures are added to this listing. Existing pictures stay in place when editing.</span></label>
          <button disabled={busy} className="md:col-span-2 bg-[var(--accent)] px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-black disabled:opacity-40">{busy ? 'Saving...' : editing ? 'Save changes' : 'Create product'}</button>
        </form>
        {message && <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[var(--accent-2)]">{message}</p>}
      </section>
      <section className="glass-panel p-6 md:p-8"><p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">Publishing flow</p><div className="mt-6 space-y-5">{[['01', 'Choose placement', 'Services, cars or outfits controls where the product appears.'], ['02', 'Set commercial details', 'Add pricing and choose a fixed quantity or infinite stock.'], ['03', 'Add the visual set', 'Multiple pictures are stored on disk and shown as an auto-rotating gallery.']].map(([number, title, body]) => <div key={number} className="border-l border-[var(--accent)]/50 pl-4"><span className="text-[9px] tracking-[0.2em] text-[var(--accent)]">{number}</span><h3 className="mt-2 text-sm uppercase tracking-[0.1em] text-white">{title}</h3><p className="mt-2 text-xs leading-6 text-white/35">{body}</p></div>)}</div></section>
    </div>
    <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">Live catalogue</p><h2 className="mt-3 text-2xl uppercase tracking-[0.08em] text-white">Existing products</h2></div><span className="text-[10px] uppercase tracking-[0.16em] text-white/30">{products.length} listings</span></div>
      {loading ? <p className="py-16 text-center text-xs uppercase tracking-[0.18em] text-white/35">Loading catalogue...</p> : <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{products.map(product => <article key={product.id} className="glass-panel overflow-hidden p-5"><MiniGallery images={product.images} name={product.name} /><div className="mt-5 flex items-start justify-between gap-3"><div><p className="text-[9px] uppercase tracking-[0.2em] text-[var(--accent)]">{PAGE_LABELS[product.page]} · {product.subtype}</p><h3 className="mt-2 text-lg uppercase tracking-[0.06em] text-white">{product.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-white/35">{product.description}</p></div><span className="text-lg text-white">${product.price}</span></div><div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4"><span className="text-[9px] uppercase tracking-[0.12em] text-white/30">{product.stock === null ? 'Infinite stock' : `${product.stock} in stock`} · {product.code}</span><div className="flex gap-3"><button type="button" onClick={() => edit(product)} className="text-[9px] uppercase tracking-[0.16em] text-white/55 hover:text-white">Edit</button><button type="button" disabled={busy} onClick={() => void remove(product)} className="text-[9px] uppercase tracking-[0.16em] text-red-300/60 hover:text-red-200">Delete</button></div></div></article>)}</div>}
    </section>
  </section><Footer /></main>;
}

function MiniGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const items = images.length ? images : ['/grayscalemini.png'];
  useEffect(() => { if (items.length < 2) return; const timer = window.setInterval(() => setActive(current => (current + 1) % items.length), 2600); return () => window.clearInterval(timer); }, [items.length]);
  return <div className="relative h-44 overflow-hidden border border-white/[0.08] bg-white/[0.025]">{items.map((image, index) => <img key={`${image}-${index}`} src={image} alt={index === active % items.length ? name : ''} aria-hidden={index !== active % items.length} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === active % items.length ? 'opacity-80' : 'opacity-0'}`} />)}<div className="absolute bottom-2 left-3 right-3 flex h-px gap-0.5">{items.map((_, index) => <span key={index} className={`h-px flex-1 ${index === active % items.length ? 'bg-[var(--accent)]' : 'bg-white/20'}`} />)}</div></div>;
}