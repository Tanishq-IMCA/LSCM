import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import { apiGet } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { showNotice } from '@/components/ui/NexusNotice';
import { ProductGallery } from '@/components/store/ProductGallery';

type FemaleProduct = { code: string; name: string; subtype: string; description: string; price: number; images: string[] };

export default function FemaleOutfitsPage() {
  const [outfits, setOutfits] = useState<FemaleProduct[]>([]);
  const { addItem } = useCart();
  useEffect(() => {
    void apiGet<{ products: FemaleProduct[] }>('/api/products?page=outfits')
      .then(result => setOutfits(result.products.filter(product => product.subtype === 'Female Outfits')))
      .catch(() => undefined);
  }, []);
  return (
    <main className="min-h-screen pt-24">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="glass-panel store-hero relative overflow-hidden p-8 md:p-12">
          <div className="store-hero__glow" />
          <div className="relative z-10 max-w-3xl">
            <Link href="/store" className="text-[10px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white/70" style={{ fontFamily: 'var(--font-mono)' }}>← Back to catalogue</Link>
            <p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>LSCM // FEMALE WARDROBE</p>
            <GlitchyText text="FEMALE OUTFITS" as="h1" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" style={{ fontFamily: 'var(--font-display)' }} />
          </div>
        </div>

        {outfits.length === 0 ? <div className="mx-auto mt-12 max-w-3xl glass-panel p-8 text-center md:p-14">
          <img src="/grayscalemini.png" alt="" className="mx-auto h-16 w-auto opacity-35 grayscale" />
          <p className="mt-8 text-[10px] uppercase tracking-[0.38em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>Collection in preparation</p>
          <h2 className="mt-4 text-2xl uppercase tracking-[0.1em] text-white md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>Female wardrobe coming soon</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/45" style={{ fontFamily: 'var(--font-body)' }}>
            Our female outfit collection is currently being curated. We are preparing a polished first release with distinctive looks, reliable delivery and the same LSCM standard applied across the catalogue.
          </p>
          <Link href="https://discord.gg/wy5ws9vVMs" target="_blank" rel="noreferrer" className="mt-8 inline-flex border border-[var(--accent)]/50 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-white/70 transition hover:bg-[var(--accent)]/15 hover:text-white" style={{ fontFamily: 'var(--font-display)' }}>Ask about availability</Link>
        </div> : <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{outfits.map(outfit => <article key={outfit.code} className="store-card overflow-hidden"><ProductGallery images={outfit.images} name={outfit.name} className="h-40 w-full border-0" /><p className="mt-6 text-[9px] uppercase tracking-[0.26em] text-[var(--accent)]">Female outfit</p><h2 className="mt-3 text-xl uppercase tracking-[0.08em] text-white">{outfit.name}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-white/40">{outfit.description}</p><button type="button" onClick={() => void addItem({ productCode: outfit.code, productName: outfit.name, category: 'Female Outfits', unitPrice: outfit.price, imagePath: outfit.images?.[0] }) .then(() => showNotice('ADDED TO CART', `${outfit.name} is ready for your request.`, 'success')).catch(error => showNotice('CART UPDATE FAILED', error instanceof Error ? error.message : 'Sign in to save your cart.', 'error'))} className="mt-6 w-full border border-[var(--accent)]/40 px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-white/70">Add to cart · ${outfit.price}</button><p className="mt-5 border-t border-white/[0.08] pt-4 text-[10px] text-white/45">{outfit.code}</p></article>)}</div>}
      </section>
      <Footer />
    </main>
  );
}