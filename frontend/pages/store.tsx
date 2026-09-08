'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';

type Product = {
  code: string;
  name: string;
  type: string;
  price: number;
  summary: string;
  includes: string[];
  featured?: boolean;
};

const PRODUCTS: Product[] = [
  {
    code: 'LSCM-ACC-010',
    name: 'Starter Account Boost',
    type: 'Account Boosting',
    price: 10,
    summary: 'A clean jumpstart for a stacked, playable account.',
    includes: ['KD boost', '8M career unlocks + career cars', 'Maxed stats', '5 modded outfits', 'Few businesses'],
  },
  {
    code: 'LSCM-ACC-025',
    name: 'Premium Account Boost',
    type: 'Account Boosting',
    price: 25,
    summary: 'The full starter package, expanded with premium unlocks.',
    includes: ['Everything in Starter', 'All bunker research', 'All guns and clothes', '10 modded outfits', 'Modded run'],
    featured: true,
  },
  {
    code: 'LSCM-ACC-050',
    name: 'Deluxe Account Boost',
    type: 'Account Boosting',
    price: 50,
    summary: 'The highest account tier for players who want the complete setup.',
    includes: ['Everything in Premium', 'All businesses and properties', 'Panther Cayo + Casino Diamonds prepped', '20 modded outfits', 'Modded jets'],
  },
  {
    code: 'LSCM-MOD-005',
    name: 'Fully Modded Car Garage',
    type: 'Custom Services',
    price: 5,
    summary: 'One custom garage prepared around your preferred builds.',
    includes: ['1 fully modded car garage', 'Custom vehicle direction', 'Delivery through management'],
  },
  {
    code: 'LSCM-HST-010',
    name: 'Heist Preparation',
    type: 'Custom Services',
    price: 10,
    summary: 'Get a modded heist prepared and ready to run.',
    includes: ['1 modded heist', 'Prep assistance', 'Diamond or Panther options'],
  },
  {
    code: 'LSCM-VIP-015',
    name: 'VIP Membership · 1 Month',
    type: 'VIP Membership',
    price: 15,
    summary: 'Priority community access and member-only benefits for one month.',
    includes: ['VIP treatment', '5% account boosting discount', 'Priority service queue'],
  },
  {
    code: 'LSCM-VIP-035',
    name: 'VIP Membership · 2 Months',
    type: 'VIP Membership',
    price: 35,
    summary: 'Two months of VIP access plus one month free.',
    includes: ['2 months access', '1 month free', 'Upgrade to next tier for 10% off'],
    featured: true,
  },
  {
    code: 'LSCM-MTH-125',
    name: 'LSCM Method Access',
    type: 'Methods & Access',
    price: 125,
    summary: 'Access the methods and guided setup used to run premium heists.',
    includes: ['Premium mod menu included', 'Full heist method', '1-on-1 installation help', 'Private support'],
  },
  {
    code: 'LSCM-ADD-001',
    name: 'Modded Outfit Add-on',
    type: 'Add-ons',
    price: 1,
    summary: 'Add one custom modded outfit to an account service.',
    includes: ['1 modded outfit', 'Preference-based styling', 'Limited warranty'],
  },
  {
    code: 'LSCM-ADD-050',
    name: 'Panther + Diamonds Prep',
    type: 'Add-ons',
    price: 10,
    summary: 'A full Panther Cayo gold and Casino Diamonds preparation add-on.',
    includes: ['Panther Cayo full gold + art', 'Casino Diamonds prepped', 'Priority completion'],
  },
];

const FILTER_PAGES = [
  { label: 'ALL SERVICES', value: 'All' },
  { label: 'ACCOUNT + VIP', value: 'Account' },
  { label: 'CUSTOM + ADD-ONS', value: 'Custom' },
] as const;

function matchesPage(product: Product, page: string) {
  if (page === 'Account') return product.type === 'Account Boosting' || product.type === 'VIP Membership';
  if (page === 'Custom') return product.type === 'Custom Services' || product.type === 'Add-ons' || product.type === 'Methods & Access';
  return true;
}

export default function StorePage() {
  const [activePage, setActivePage] = useState('All');
  const [activeType, setActiveType] = useState('All types');
  const [query, setQuery] = useState('');

  const types = useMemo(
    () => ['All types', ...Array.from(new Set(PRODUCTS.map((product) => product.type)))],
    [],
  );
  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const searchable = `${product.code} ${product.name} ${product.type} ${product.summary} ${product.includes.join(' ')}`.toLowerCase();
      return matchesPage(product, activePage)
        && (activeType === 'All types' || product.type === activeType)
        && (!normalized || searchable.includes(normalized));
    });
  }, [activePage, activeType, query]);

  return (
    <main className="min-h-screen pt-24">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="glass-panel store-hero relative overflow-hidden p-8 md:p-12">
          <div className="store-hero__glow" />
          <div className="relative z-10 max-w-3xl">
            <p className="mb-4 text-[10px] uppercase tracking-[0.44em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
              LSCM // SERVICE STORE
            </p>
            <GlitchyText text="CHOOSE YOUR LOADOUT" as="h1" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" style={{ fontFamily: 'var(--font-display)' }} />
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45" style={{ fontFamily: 'var(--font-body)' }}>
              Browse account boosts, custom builds, VIP access, methods and add-ons. Every listing has a unique service code for quick lookup.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-white/[0.08] pb-5">
          {FILTER_PAGES.map((page) => (
            <button
              key={page.value}
              type="button"
              onClick={() => setActivePage(page.value)}
              className={`store-filter ${activePage === page.value ? 'store-filter--active' : ''}`}
            >
              {page.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="glass-panel flex items-center gap-3 px-4 py-3">
            <span className="text-xs text-white/30">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              style={{ fontFamily: 'var(--font-mono)' }}
              placeholder="Search code, product name, type..."
              aria-label="Search services"
            />
          </label>
          <select
            value={activeType}
            onChange={(event) => setActiveType(event.target.value)}
            className="glass-panel min-w-[190px] px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/65 outline-none"
            style={{ fontFamily: 'var(--font-mono)' }}
            aria-label="Filter by product type"
          >
            {types.map((type) => <option key={type} value={type} className="bg-[#100b1d]">{type}</option>)}
          </select>
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>Current catalogue</p>
            <h2 className="mt-2 text-2xl uppercase tracking-[0.1em] text-white" style={{ fontFamily: 'var(--font-display)' }}>Service tracks</h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>{visibleProducts.length} listings</span>
        </div>

        <motion.div layout className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <motion.article layout key={product.code} className={`store-card ${product.featured ? 'store-card--featured' : ''}`}>
              <div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[9px] uppercase tracking-[0.26em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{product.type}</span>
                  {product.featured && <span className="store-card__badge">Featured</span>}
                </div>
                <h3 className="mt-6 text-xl uppercase tracking-[0.08em] text-white" style={{ fontFamily: 'var(--font-display)' }}>{product.name}</h3>
                <p className="mt-3 text-sm leading-6 text-white/40" style={{ fontFamily: 'var(--font-body)' }}>{product.summary}</p>
                <ul className="mt-5 space-y-2 border-t border-white/[0.08] pt-5">
                  {product.includes.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-white/55"><span style={{ color: 'var(--accent)' }}>+</span>{item}</li>)}
                </ul>
              </div>
              <div className="mt-8 flex items-end justify-between border-t border-white/[0.08] pt-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.22em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>Service code</p>
                  <p className="mt-1 text-[10px] tracking-[0.16em] text-white/55" style={{ fontFamily: 'var(--font-mono)' }}>{product.code}</p>
                </div>
                <p className="text-3xl text-white" style={{ fontFamily: 'var(--font-display)' }}>${product.price}<span className="ml-1 text-xs text-white/30">USD</span></p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {visibleProducts.length === 0 && (
          <div className="glass-panel mt-6 p-12 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-white/45" style={{ fontFamily: 'var(--font-mono)' }}>No service matches that search.</p>
          </div>
        )}

        <p className="mt-10 max-w-2xl text-[11px] leading-6 text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>
          Payments are handled manually through management. Join the community Discord to confirm availability, delivery timing and support before ordering.
        </p>
      </section>
      <Footer />
    </main>
  );
}