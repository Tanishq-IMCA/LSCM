import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await currentUser(req as never);
  if (!user) return { redirect: { destination: '/auth', permanent: false } };
  if (!isAdminUser(user)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
};

export default function AdminHomePage() {
  return (
    <main className="min-h-screen pt-24">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-8">
        <div className="glass-panel store-hero relative overflow-hidden p-8 md:p-12">
          <div className="store-hero__glow" />
          <div className="relative z-10">
            <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white/70" style={{ fontFamily: 'var(--font-mono)' }}>← Back to homepage</Link>
            <p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em] text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>LSCM // ADMINISTRATION</p>
            <GlitchyText text="ADMIN PANEL" as="h1" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" style={{ fontFamily: 'var(--font-display)' }} />
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">Choose a workspace.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link href="/admin/tickets" className="glass-panel p-8 transition hover:border-[var(--accent)]/50 hover:bg-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">Category 01</p>
            <h2 className="mt-4 text-3xl uppercase tracking-[0.08em] text-white">Tickets</h2>
            <p className="mt-4 text-sm leading-7 text-white/40">Live customer conversations, unread replies, typing indicators, and ticket state controls.</p>
            <span className="mt-7 inline-block text-[10px] uppercase tracking-[0.2em] text-white/60">Open tickets →</span>
          </Link>
          <Link href="/admin/orders" className="glass-panel p-8 transition hover:border-[var(--accent)]/50 hover:bg-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">Category 02</p>
            <h2 className="mt-4 text-3xl uppercase tracking-[0.08em] text-white">Order control</h2>
            <p className="mt-4 text-sm leading-7 text-white/40">Search customers and move orders through approval, delivery, and finished states.</p>
            <span className="mt-7 inline-block text-[10px] uppercase tracking-[0.2em] text-white/60">Open orders →</span>
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}