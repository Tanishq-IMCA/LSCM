import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import { CartPanel } from '@/components/store/CartPanel';
import { useCart } from '@/contexts/CartContext';
import { showNotice } from '@/components/ui/NexusNotice';

type Outfit = {
  code: string;
  name: string;
  summary: string;
  image?: string;
};

const MALE_OUTFITS: Outfit[] = [
  { code: 'LSCM-OUT-M-001', name: 'SpongeBob Street Set', summary: 'A yellow-coded statement piece for crews that refuse to blend in.' },
  { code: 'LSCM-OUT-M-002', name: 'Redline', summary: 'Clean red layers with enough attitude to start a lobby incident.' },
  { code: 'LSCM-OUT-M-003', name: 'Purple Sweat', summary: 'Soft on the outside, suspiciously competitive on the inside.' },
  { code: 'LSCM-OUT-M-004', name: 'Pony Jugg', summary: 'A playful custom fit with an unexpectedly serious finish.' },
  { code: 'LSCM-OUT-M-005', name: 'Blue FBI Sweat', summary: 'Federal energy, unofficial credentials and excellent lobby presence.' },
  { code: 'LSCM-OUT-M-006', name: 'Demon', summary: 'Dark, sharp and built for making an entrance without an introduction.' },
  { code: 'LSCM-OUT-M-007', name: 'Noose', summary: 'A severe monochrome look for players who take the dress code personally.' },
  { code: 'LSCM-OUT-M-008', name: 'Chris · Resident Evil', summary: 'Tactical survival style, ready for another very long night.' },
  { code: 'LSCM-OUT-M-009', name: 'Pink Galaxy', summary: 'Cosmic colour and clean lines for an orbit above the ordinary.' },
  { code: 'LSCM-OUT-M-010', name: 'Blue Galaxy', summary: 'Deep-space blues with a cool finish and zero gravitational pull.' },
  { code: 'LSCM-OUT-M-011', name: 'Black Sweat', summary: 'A stealthy essential for low-profile missions and high-profile exits.' },
  { code: 'LSCM-OUT-M-012', name: 'Red Tryhard', summary: 'Maximum competitive posture. Results may vary; confidence will not.' },
  { code: 'LSCM-OUT-M-013', name: 'Blue-White Tryhard', summary: 'A crisp two-tone loadout for those who came to win the fit check.' },
  { code: 'LSCM-OUT-M-014', name: 'Pink Flippers', summary: 'Unreasonably cheerful, surprisingly rare and ready for the shoreline.' },
  { code: 'LSCM-OUT-M-015', name: "Neo's First Sweat Outfit", summary: 'The original chapter. A little nostalgic, still dangerously comfortable.', image: '/neo.png' },
];

export default function MaleOutfitsPage() {
  const { addItem } = useCart();

  const addOutfitToCart = async (outfit: Outfit) => {
    try {
      await addItem({
        productCode: outfit.code,
        productName: outfit.name,
        category: 'Male Outfits',
        unitPrice: 1,
        imagePath: outfit.image,
      });
      showNotice('ADDED TO CART', `${outfit.name} is ready for your request.`, 'success');
    } catch (error) {
      showNotice('CART UPDATE FAILED', error instanceof Error ? error.message : 'Sign in to save your cart.', 'error');
    }
  };

  return (
    <main className="min-h-screen pt-24">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="glass-panel store-hero relative overflow-hidden p-8 md:p-12">
          <div className="store-hero__glow" />
          <div className="relative z-10 max-w-3xl">
            <Link href="/store" className="text-[10px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white/70" style={{ fontFamily: 'var(--font-mono)' }}>← Back to catalogue</Link>
            <p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>LSCM // MALE WARDROBE</p>
            <GlitchyText text="MALE OUTFITS" as="h1" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" style={{ fontFamily: 'var(--font-display)' }} />
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45" style={{ fontFamily: 'var(--font-body)' }}>Fifteen sample fits for players who want their character to arrive before they do. Each listing is currently priced at $1 USD.</p>
          </div>
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>Current collection</p>
            <h2 className="mt-2 text-2xl uppercase tracking-[0.1em] text-white" style={{ fontFamily: 'var(--font-display)' }}>Available fits</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>{MALE_OUTFITS.length} listings</span>
            <CartPanel />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MALE_OUTFITS.map((outfit) => (
            <article key={outfit.code} className="store-card overflow-hidden">
              <div className="flex h-40 items-center justify-center border-b border-white/[0.08] bg-white/[0.025]">
                <img src={outfit.image || '/grayscalemini.png'} alt="" className="max-h-24 w-auto opacity-60 grayscale" />
              </div>
              <div className="pt-6">
                <p className="text-[9px] uppercase tracking-[0.26em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>Modded outfit</p>
                <h3 className="mt-4 text-xl uppercase tracking-[0.08em] text-white" style={{ fontFamily: 'var(--font-display)' }}>{outfit.name}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-white/40" style={{ fontFamily: 'var(--font-body)' }}>{outfit.summary}</p>
                <button
                  type="button"
                  onClick={() => void addOutfitToCart(outfit)}
                  className="mt-6 w-full border border-[var(--accent)]/40 px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-white/70 transition hover:bg-[var(--accent)]/15 hover:text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Add to cart · $1
                </button>
                <div className="mt-6 flex items-end justify-between border-t border-white/[0.08] pt-4">
                  <p className="text-[10px] tracking-[0.16em] text-white/45" style={{ fontFamily: 'var(--font-mono)' }}>{outfit.code}</p>
                  <p className="text-3xl text-white" style={{ fontFamily: 'var(--font-display)' }}>$1<span className="ml-1 text-xs text-white/30">USD</span></p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-[11px] leading-6 text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>
          Payments and delivery are confirmed manually through management. Join the official Discord to check availability and request a fit.
        </p>
      </section>
      <Footer />
    </main>
  );
}