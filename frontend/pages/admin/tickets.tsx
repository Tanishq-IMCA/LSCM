import { useEffect, useRef, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import { getSupportTicket, getSupportTickets, sendSupportMessage, updateSupportSettings, updateSupportTicket, type SupportMessage, type SupportTicket } from '@/lib/api';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await currentUser(req as never);
  if (!user) return { redirect: { destination: '/auth', permanent: false } };
  if (!isAdminUser(user)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);
  const typingTimer = useRef<number | null>(null);

  const refreshList = async () => {
    const result = await getSupportTickets();
    setTickets(result.tickets || []);
    if (typeof result.readReceiptsEnabled === 'boolean') setReadReceiptsEnabled(result.readReceiptsEnabled);
    if (!selectedId && result.tickets?.[0]) setSelectedId(result.tickets[0].id);
  };
  const refreshThread = async (id: string) => {
    const result = await getSupportTicket(id);
    setTicket(result.ticket);
    setMessages(result.messages || []);
  };
  useEffect(() => {
    void refreshList();
    const interval = window.setInterval(() => {
      void refreshList();
      if (selectedId) void refreshThread(selectedId);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [selectedId]);
  useEffect(() => { if (selectedId) void refreshThread(selectedId); }, [selectedId]);
  useEffect(() => {
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    if (!selectedId || ticket?.status === 'closed') return;
    typingTimer.current = window.setTimeout(() => {
      void updateSupportTicket(selectedId, { action: 'typing', typing: Boolean(draft.trim()) });
    }, 350);
    return () => {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    };
  }, [draft, selectedId, ticket?.status]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedId || !draft.trim()) return;
    setBusy(true);
    try { await sendSupportMessage(selectedId, draft); setDraft(''); await refreshThread(selectedId); await refreshList(); } finally { setBusy(false); }
  };
  const transition = async (action: 'close' | 'reopen') => {
    if (!selectedId || (action === 'reopen' && !reason.trim())) return;
    if (!window.confirm(action === 'close' ? 'Close this ticket?' : 'Reopen this ticket?')) return;
    setBusy(true);
    try { await updateSupportTicket(selectedId, { action, reason }); setReason(''); await refreshThread(selectedId); await refreshList(); } finally { setBusy(false); }
  };
  const toggleReadReceipts = async (enabled: boolean) => {
    setReadReceiptsEnabled(enabled);
    try {
      await updateSupportSettings(enabled);
    } catch {
      setReadReceiptsEnabled(!enabled);
    }
  };

  return (
    <main className="min-h-screen pt-24"><Header /><section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><Link href="/admin" className="text-[10px] uppercase tracking-[0.3em] text-white/35 hover:text-white/70">← Admin categories</Link><p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em] text-[var(--accent)]">LSCM // CUSTOMER SUPPORT</p><h1 className="text-5xl uppercase tracking-[0.08em] text-white md:text-7xl">Tickets.</h1><p className="mt-5 text-sm text-white/40">Live inbox and chat updates every 5 seconds.</p></div><div className="flex items-center gap-3"><label className="flex items-center gap-2 border border-white/15 px-3 py-3 text-[9px] uppercase tracking-[0.12em] text-white/60"><input type="checkbox" checked={readReceiptsEnabled} onChange={event => void toggleReadReceipts(event.target.checked)} className="accent-[var(--accent)]" /> Show read to customers</label><Link href="/admin/orders" className="border border-white/15 px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-white/60 hover:text-white">Orders →</Link></div></div>
      <div className="mt-10 grid min-h-[560px] gap-5 lg:grid-cols-[0.35fr_0.65fr]"><aside className="border border-white/[0.08] bg-white/[0.035] p-4"><div className="mb-4 border-b border-white/[0.08] pb-4 text-[10px] uppercase tracking-[0.25em] text-white/40">Incoming tickets</div><div className="space-y-2">{tickets.map(item => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full border p-3 text-left ${item.id === selectedId ? 'border-[var(--accent)]/50 bg-[var(--accent)]/[0.08]' : 'border-white/[0.08] bg-white/[0.02]'}`}><div className="flex justify-between gap-2"><span className="truncate text-xs uppercase text-white">{item.customerName}</span><span className="text-[9px] uppercase text-white/35">{item.status}</span></div><p className="mt-2 text-[10px] text-white/40">{item.queryTopic} {item.unreadCount ? `· ${item.unreadCount} new` : ''}</p></button>)}</div></aside><section className="flex flex-col border border-white/[0.08] bg-white/[0.035]">{!ticket ? <div className="flex flex-1 items-center justify-center text-sm text-white/35">No tickets yet.</div> : <><header className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">{ticket.customerName} · {ticket.queryTopic}</p><h2 className="mt-2 text-xl uppercase text-white">{ticket.orderNumber ? `Order ${ticket.orderNumber.slice(0, 8)}` : 'General query'}</h2></div>{ticket.status === 'open' ? <button type="button" onClick={() => void transition('close')} className="border border-red-300/30 px-3 py-2 text-[9px] uppercase text-red-200/70">Close ticket</button> : <span className="text-[10px] uppercase text-white/35">Closed</span>}</header><div className="flex-1 space-y-3 overflow-y-auto p-5">{messages.map(message => <div key={message.id} className={message.senderRole === 'system' ? 'mx-auto max-w-xl border border-yellow-200/15 bg-yellow-100/[0.04] p-3 text-center' : `max-w-[85%] border border-white/[0.08] p-3 ${message.senderRole === 'admin' ? 'ml-auto bg-[var(--accent)]/[0.1]' : 'bg-white/[0.03]'}`}><p className="whitespace-pre-wrap text-sm leading-6 text-white/75">{message.body}</p><p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-white/30">{message.readAt ? 'Read' : 'Delivered'} · {new Date(message.createdAt).toLocaleTimeString()}</p></div>)}{draft.trim() && <div className="ml-auto max-w-[85%] border border-dashed border-[var(--accent)]/60 bg-[var(--accent)]/[0.04] p-3"><p className="whitespace-pre-wrap text-sm leading-6 text-white/60">{draft}</p><p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[var(--accent)]/70">Draft · not sent</p></div>}{ticket.typing && <p className="text-xs italic text-white/35">Customer is typing...</p>}</div>{ticket.status === 'closed' ? <div className="border-t border-white/[0.08] p-5"><div className="flex gap-2"><input value={reason} onChange={event => setReason(event.target.value)} className="input-glass min-w-0 flex-1 px-4 py-3 text-sm text-white" placeholder="Reason for reopening" /><button disabled={busy} type="button" onClick={() => void transition('reopen')} className="bg-[var(--accent)] px-4 py-3 text-[10px] uppercase text-black">Reopen</button></div></div> : <form onSubmit={send} className="border-t border-white/[0.08] p-5"><div className="flex gap-2"><input value={draft} onChange={event => setDraft(event.target.value)} className="input-glass min-w-0 flex-1 px-4 py-3 text-sm text-white" placeholder="Reply to customer..." /><button disabled={busy || !draft.trim()} className="bg-[var(--accent)] px-4 py-3 text-[10px] uppercase text-black">Send</button></div></form>}</>}</section></div>
    </section><Footer /></main>
  );
}