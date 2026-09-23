import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type Status = { maintenanceMode: boolean; maintenanceMessage: string; banned: boolean; banReason: string };

function GateShell({ eyebrow, title, body, children, accent }: { eyebrow: string; title: string; body: string; children?: React.ReactNode; accent: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 py-16 text-center" style={{ fontFamily: 'var(--font-display)' }}>
      <section className={`w-full max-w-2xl border p-8 shadow-2xl md:p-14 ${accent}`}>
        <p className="text-[10px] uppercase tracking-[0.45em] text-white/45" style={{ fontFamily: 'var(--font-mono)' }}>LSCM // {eyebrow}</p>
        <div className="mx-auto mt-8 h-px w-24 bg-current opacity-70" />
        <h1 className="mt-8 text-4xl uppercase tracking-[0.12em] text-white md:text-6xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/55" style={{ fontFamily: 'var(--font-body)' }}>{body}</p>
        {children}
      </section>
    </main>
  );
}

function BannedScreen({ reason }: { reason: string }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!message.trim()) return;
    setBusy(true);
    const response = await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ queryType: 'general', queryTopic: 'Ban dispute', message }) });
    setSent(response.ok);
    setBusy(false);
  };
  return (
    <GateShell eyebrow="ACCESS DENIED" title="404 // BANNED" body={reason || 'This account has been blocked from accessing the LSCM website.'} accent="border-red-300/30 shadow-[0_0_60px_rgba(248,113,113,0.12)]">
      {!sent ? <div className="mx-auto mt-8 max-w-lg"><textarea value={message} onChange={event => setMessage(event.target.value)} maxLength={2000} className="input-glass min-h-28 w-full resize-none px-4 py-3 text-left text-sm text-white" placeholder="Explain why this ban should be reviewed..." /><button type="button" disabled={busy || !message.trim()} onClick={() => void submit()} className="mt-3 w-full bg-red-300 px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-black disabled:opacity-40">{busy ? 'Sending...' : 'Open dispute ticket'}</button></div> : <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">Dispute ticket opened.</p>}
    </GateShell>
  );
}

export default function SiteGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    let active = true;
    fetch('/api/site/status').then(response => response.json()).then(value => { if (active) setStatus(value); }).catch(() => undefined);
    return () => { active = false; };
  }, [user?.id, user?.role, user?.banned]);
  if (!status || isLoading) return <>{children}</>;
  if (status.banned) return <BannedScreen reason={status.banReason} />;
  if (status.maintenanceMode) return <GateShell eyebrow="SYSTEM MAINTENANCE" title="BACK SOON" body={status.maintenanceMessage || 'The LSCM website is temporarily offline for maintenance.'} accent="border-yellow-300/50 text-yellow-200 shadow-[0_0_70px_rgba(250,204,21,0.22)]"><a href="https://discord.gg/wy5ws9vVMs" target="_blank" rel="noreferrer" className="mt-8 inline-flex border border-yellow-200/50 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-yellow-100 transition hover:bg-yellow-200/10">Open Discord</a></GateShell>;
  return <>{children}</>;
}