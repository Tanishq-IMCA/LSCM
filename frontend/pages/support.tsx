import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getRequestedItems, getSupportTicket, getSupportTickets, createSupportTicket, sendSupportMessage, updateSupportTicket, type RequestedItem, type SupportMessage, type SupportTicket } from '@/lib/api';
import { showNotice } from '@/components/ui/NexusNotice';

const TOPICS = ['Order status', 'Delivery issue', 'Payment question', 'Account help', 'General question', 'Other'];

function messageStatus(message: SupportMessage) {
  return message.readAt ? 'Read' : 'Delivered';
}

export default function SupportPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<RequestedItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [queryType, setQueryType] = useState<'order' | 'general'>('order');
  const [queryTopic, setQueryTopic] = useState(TOPICS[0]);
  const [orderId, setOrderId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [draft, setDraft] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const typingTimer = useRef<number | null>(null);

  const refreshTickets = async () => {
    const result = await getSupportTickets();
    setTickets(result.tickets || []);
    if (!selectedId && result.tickets?.[0]) setSelectedId(result.tickets[0].id);
  };

  const refreshDetail = async (id: string) => {
    const result = await getSupportTicket(id);
    setTicket(result.ticket);
    setMessages(result.messages || []);
  };

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
    if (!user) return;
    let active = true;
    void Promise.all([refreshTickets(), getRequestedItems().then(result => setOrders(result.items || []))]);
    const interval = window.setInterval(() => {
      if (!active) return;
      void refreshTickets();
      if (selectedId) void refreshDetail(selectedId);
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isLoading, user, router, selectedId]);

  useEffect(() => {
    if (selectedId) void refreshDetail(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId || ticket?.status === 'closed') return;
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      void updateSupportTicket(selectedId, { action: 'typing', typing: Boolean(draft.trim()) });
    }, 350);
    return () => {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    };
  }, [draft, selectedId, ticket?.status]);

  if (!user) return null;

  const openTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await createSupportTicket({ queryType, queryTopic, orderId: queryType === 'order' ? orderId : undefined, message: newMessage });
      setNewMessage('');
      setShowNew(false);
      await refreshTickets();
      setSelectedId(result.ticketId);
      showNotice('TICKET OPENED', 'Your support ticket is now live.', 'success');
    } catch (error) {
      showNotice('TICKET FAILED', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedId || !draft.trim()) return;
    setBusy(true);
    try {
      await sendSupportMessage(selectedId, draft);
      setDraft('');
      await Promise.all([refreshDetail(selectedId), refreshTickets()]);
    } catch (error) {
      showNotice('MESSAGE FAILED', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const transition = async (action: 'close' | 'reopen') => {
    if (!selectedId) return;
    if (action === 'reopen' && !reopenReason.trim()) {
      showNotice('REOPEN REASON REQUIRED', 'Tell us why this ticket should reopen.', 'error');
      return;
    }
    setBusy(true);
    try {
      await updateSupportTicket(selectedId, { action, reason: reopenReason });
      setReopenReason('');
      await Promise.all([refreshDetail(selectedId), refreshTickets()]);
    } catch (error) {
      showNotice('TICKET UPDATE FAILED', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen pt-24">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-[10px] uppercase tracking-[0.42em] text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>LSCM // CUSTOMER SUPPORT</p><h1 className="mt-5 text-5xl uppercase tracking-[0.08em] text-white md:text-7xl">Support.</h1><p className="mt-4 max-w-xl text-sm leading-7 text-white/40">Open a ticket for an order or a general question. Replies update live.</p></div>
          <button type="button" onClick={() => setShowNew(true)} className="bg-[var(--accent)] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-black">Open ticket</button>
        </div>
        <div className="mt-10 grid min-h-[560px] gap-5 lg:grid-cols-[0.35fr_0.65fr]">
          <aside className="border border-white/[0.08] bg-white/[0.035] p-4">
            <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-4"><span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Your tickets</span><span className="text-[10px] text-[var(--accent)]">LIVE</span></div>
            <div className="space-y-2">{tickets.length === 0 ? <p className="py-8 text-center text-xs text-white/30">No tickets yet.</p> : tickets.map(item => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full border p-3 text-left ${item.id === selectedId ? 'border-[var(--accent)]/50 bg-[var(--accent)]/[0.08]' : 'border-white/[0.08] bg-white/[0.02]'}`}><div className="flex items-center justify-between gap-2"><span className="truncate text-xs uppercase tracking-[0.08em] text-white">{item.queryTopic}</span><span className="text-[9px] uppercase text-white/35">{item.status}</span></div><p className="mt-2 text-[10px] text-white/35">{item.orderNumber ? `Order ${item.orderNumber.slice(0, 8)}` : 'General query'} {item.unreadCount ? `· ${item.unreadCount} new` : ''}</p></button>)}</div>
          </aside>
          <section className="flex flex-col border border-white/[0.08] bg-white/[0.035]">
            {!ticket ? <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-white/35">Select a ticket or open a new one.</div> : <>
              <header className="border-b border-white/[0.08] p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent)]">{ticket.queryType} · {ticket.queryTopic}</p><h2 className="mt-2 text-xl uppercase tracking-[0.08em] text-white">{ticket.orderNumber ? `Order ${ticket.orderNumber.slice(0, 8)}` : 'General support'}</h2></div><div className="flex items-center gap-3"><span className="text-[10px] uppercase text-white/35">{ticket.status}</span>{ticket.status === 'open' && <button type="button" onClick={() => void transition('close')} className="border border-red-300/30 px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-red-200/70">Close</button>}</div></div></header>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">{messages.map(message => <div key={message.id} className={message.senderRole === 'system' ? 'mx-auto max-w-xl border border-yellow-200/15 bg-yellow-100/[0.04] p-3 text-center' : `max-w-[85%] border border-white/[0.08] p-3 ${message.senderId === user.id ? 'ml-auto bg-[var(--accent)]/[0.1]' : 'bg-white/[0.03]'}`}><p className="whitespace-pre-wrap text-sm leading-6 text-white/75">{message.body}</p><p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-white/30">{message.senderRole === 'system' ? 'LSCM system' : message.senderId === user.id ? messageStatus(message) : 'Delivered'} · {new Date(message.createdAt).toLocaleTimeString()}</p></div>)}{ticket.typing && <p className="text-xs italic text-white/35">Support is typing...</p>}</div>
              {ticket.status === 'closed' ? <div className="border-t border-white/[0.08] p-5"><p className="text-xs text-white/40">This ticket is closed. Reopen it to continue the conversation.</p><div className="mt-3 flex gap-2"><input value={reopenReason} onChange={event => setReopenReason(event.target.value)} className="input-glass min-w-0 flex-1 px-4 py-3 text-sm text-white" placeholder="Reason for reopening" /><button type="button" disabled={busy} onClick={() => void transition('reopen')} className="bg-[var(--accent)] px-4 py-3 text-[10px] uppercase text-black">Reopen</button></div></div> : <form onSubmit={send} className="border-t border-white/[0.08] p-5"><div className="flex gap-2"><input value={draft} onChange={event => setDraft(event.target.value)} className="input-glass min-w-0 flex-1 px-4 py-3 text-sm text-white" placeholder="Write a message..." /><button disabled={busy || !draft.trim()} className="bg-[var(--accent)] px-4 py-3 text-[10px] uppercase text-black">Send</button></div></form>}
            </>}
          </section>
        </div>
      </section>
      {showNew && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-6 backdrop-blur-md"><form onSubmit={openTicket} className="w-full max-w-lg border border-white/10 bg-[#0b0812] p-7"><div className="flex items-center justify-between"><h2 className="text-2xl uppercase tracking-[0.1em] text-white">Open ticket</h2><button type="button" onClick={() => setShowNew(false)} className="text-2xl text-white/40">×</button></div><div className="mt-6 space-y-4"><select value={queryType} onChange={event => setQueryType(event.target.value as 'order' | 'general')} className="input-glass w-full px-4 py-3 text-sm text-white"><option value="order" className="bg-[#100b1d]">Order support</option><option value="general" className="bg-[#100b1d]">General query</option></select>{queryType === 'order' && <select value={orderId} onChange={event => setOrderId(event.target.value)} required className="input-glass w-full px-4 py-3 text-sm text-white"><option value="" className="bg-[#100b1d]">Select your order</option>{orders.map(order => <option key={order.id} value={order.id} className="bg-[#100b1d]">{order.orderNumber?.slice(0, 8) || order.id.slice(0, 8)} · {order.productName}</option>)}</select>}<select value={queryTopic} onChange={event => setQueryTopic(event.target.value)} className="input-glass w-full px-4 py-3 text-sm text-white">{TOPICS.map(topic => <option key={topic} className="bg-[#100b1d]">{topic}</option>)}</select><textarea value={newMessage} onChange={event => setNewMessage(event.target.value)} required maxLength={2000} className="input-glass min-h-32 w-full resize-none px-4 py-3 text-sm text-white" placeholder="Describe your question..." /><button disabled={busy} className="w-full bg-[var(--accent)] px-5 py-4 text-[10px] uppercase tracking-[0.24em] text-black">{busy ? 'Opening...' : 'Open ticket'}</button></div></form></div>}
      <Footer />
    </main>
  );
}