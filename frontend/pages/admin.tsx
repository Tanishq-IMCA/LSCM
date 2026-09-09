import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await currentUser(req as never);

  if (!user) {
    return { redirect: { destination: '/auth', permanent: false } };
  }

  if (!isAdminUser(user)) {
    return { redirect: { destination: '/', permanent: false } };
  }

  return { props: {} };
};

export default function AdminPage() {
  return (
    <main className="min-h-screen pt-24">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-8">
        <div className="glass-panel store-hero relative overflow-hidden p-8 md:p-12">
          <div className="store-hero__glow" />
          <div className="relative z-10 max-w-3xl">
            <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white/70" style={{ fontFamily: 'var(--font-mono)' }}>← Back to homepage</Link>
            <p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em] text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>LSCM // ADMINISTRATION</p>
            <GlitchyText text="ADMIN PANEL" as="h1" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" style={{ fontFamily: 'var(--font-display)' }} />
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45" style={{ fontFamily: 'var(--font-body)' }}>Restricted management space. Administrative tools will appear here when enabled.</p>
          </div>
        </div>

        <section className="mx-auto mt-10 max-w-3xl glass-panel p-10 text-center md:p-16">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>No tools enabled</p>
          <h2 className="mt-4 text-2xl uppercase tracking-[0.1em] text-white md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>Admin panel is empty</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/40" style={{ fontFamily: 'var(--font-body)' }}>This area is reserved for future LSCM management controls.</p>
        </section>
      </section>
      <Footer />
    </main>
  );
}