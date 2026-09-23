import { useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import { apiGet, apiPatch } from '@/lib/api';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await currentUser(req as never);
  if (!user) return { redirect: { destination: '/auth', permanent: false } };
  if (!isAdminUser(user)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
};

export default function AdministrationPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { void apiGet<{ maintenanceMode: boolean; maintenanceMessage: string }>('/api/admin/administration').then(result => { setMaintenanceMode(result.maintenanceMode); setMaintenanceMessage(result.maintenanceMessage); }).catch(error => setMessage(error instanceof Error ? error.message : 'Could not load settings.')); }, []);
  const save = async () => {
    setBusy(true);
    try { await apiPatch('/api/admin/administration', { maintenanceMode, maintenanceMessage }); setMessage('Administration settings saved.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save settings.'); } finally { setBusy(false); }
  };
  return <main className="min-h-screen pt-24"><Header /><section className="mx-auto max-w-5xl px-6 py-16 md:px-10"><Link href="/admin" className="text-[10px] uppercase tracking-[0.3em] text-white/35 hover:text-white/70">← Admin categories</Link><p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em] text-[var(--accent)]">LSCM // ADMINISTRATION</p><GlitchyText text="SITE CONTROL" as="h1" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" /><section className="mt-10 border border-white/10 bg-white/[0.03] p-7"><div className="flex flex-wrap items-center justify-between gap-5"><div><p className="text-[10px] uppercase tracking-[0.3em] text-yellow-200/70">Global access</p><h2 className="mt-3 text-2xl uppercase tracking-[0.1em] text-white">Maintenance mode</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/40">Visitors see a yellow maintenance screen with a Discord link. Admins keep full access.</p></div><button type="button" onClick={() => setMaintenanceMode(value => !value)} className={`border px-5 py-3 text-[10px] uppercase tracking-[0.2em] ${maintenanceMode ? 'border-yellow-200/60 bg-yellow-200/15 text-yellow-100' : 'border-white/15 text-white/55'}`}>{maintenanceMode ? 'Enabled' : 'Disabled'}</button></div><textarea value={maintenanceMessage} onChange={event => setMaintenanceMessage(event.target.value)} maxLength={500} className="input-glass mt-7 min-h-28 w-full resize-none px-4 py-3 text-sm text-white" placeholder="Optional maintenance message" /><button type="button" disabled={busy} onClick={() => void save()} className="mt-5 bg-[var(--accent)] px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-black disabled:opacity-50">{busy ? 'Saving...' : 'Save settings'}</button>{message && <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[var(--accent)]">{message}</p>}</section></section><Footer /></main>;
}