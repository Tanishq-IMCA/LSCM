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
          <Link href="/admin/users" className="glass-panel p-8 transition hover:border-[var(--accent)]/50 hover:bg-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">Category 05 · Access</p>
            <h2 className="mt-4 text-3xl uppercase tracking-[0.08em] text-white">User management</h2>
            <p className="mt-4 text-sm leading-7 text-white/40">Search members and switch account access between user and admin.</p>
            <span className="mt-7 inline-block text-[10px] uppercase tracking-[0.2em] text-white/60">Manage users →</span>
          </Link>
          <div className="glass-panel relative h-fit self-start overflow-hidden p-8 transition hover:border-[var(--accent)]/40 hover:bg-white/[0.06]">
            <div className="store-hero__glow opacity-40" />
            <div className="relative z-10 md:flex md:items-start md:justify-between md:gap-10">
              <div className="max-w-xl">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">Category 03 · Incoming</p>
                <h2 className="mt-4 text-3xl uppercase tracking-[0.08em] text-white">Product manager</h2>
                <p className="mt-4 text-sm leading-7 text-white/40">A complete catalogue command center is being built for the next phase of LSCM.</p>
                <p className="mt-3 text-sm leading-7 text-white/35">Soon you will be able to create, edit and delete products across services, vehicles, outfits and every future store page from one controlled workspace.</p>
              </div>
              <div className="mt-7 shrink-0 border border-[var(--accent)]/35 bg-[var(--accent)]/[0.06] px-5 py-4 md:mt-0">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">Status</p>
                <p className="mt-2 text-xl uppercase tracking-[0.12em] text-white">Coming soon</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/30">Built for the full catalogue</p>
              </div>
            </div>
          </div>
          <Link href="/admin/network" className="glass-panel relative h-fit self-start overflow-hidden p-8 transition hover:border-[var(--accent)]/50 hover:bg-white/[0.06]">
            <div className="store-hero__glow opacity-30" />
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">Category 04 · Network</p>
              <h2 className="mt-4 text-3xl uppercase tracking-[0.08em] text-white">Network manager</h2>
              <p className="mt-4 text-sm leading-7 text-white/40">Manage the LSCM Discord gateway, presence, activity title and live bot state.</p>
              <span className="mt-7 inline-block text-[10px] uppercase tracking-[0.2em] text-white/60">Open network manager →</span>
            </div>
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}