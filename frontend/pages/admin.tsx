import { useEffect, useMemo, useRef, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import { getAdminOrders, updateAdminOrder, type AdminOrder } from '@/lib/api';

type Status = 'awaiting_approval' | 'approved' | 'finished';

const STATUS_LABELS: Record<Status, string> = {
  awaiting_approval: 'Awaiting approval',
  approved: 'Being delivered',
  finished: 'Finished',
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await currentUser(req as never);
  if (!user) return { redirect: { destination: '/auth', permanent: false } };
  if (!isAdminUser(user)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
};

export default function AdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<'all' | Status>('all');
  const [loading, setLoading] = useState(true);

  const searchRef = useRef(search);
  searchRef.current = search;

  const loadOrders = async (term = '', showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await getAdminOrders(term);
      setOrders(result.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders('', true);
    const interval = window.setInterval(() => void loadOrders(searchRef.current, false), 5000);
    return () => window.clearInterval(interval);
  }, []);

  const visibleOrders = useMemo(
    () => activeStatus === 'all' ? orders : orders.filter(order => order.status === activeStatus),
    [activeStatus, orders],
  );
  const grouped = useMemo(() => {
    const groups = new Map<string, AdminOrder[]>();
    visibleOrders.forEach(order => {
      const key = `${order.display_name} · ${order.email}`;
      groups.set(key, [...(groups.get(key) || []), order]);
    });
    return Array.from(groups.entries());
  }, [visibleOrders]);

  const transition = async (order: AdminOrder, status: Status) => {
    const label = STATUS_LABELS[status];
    if (!window.confirm(`Move order ${order.order_number.slice(0, 8)} to "${label}"?`)) return;
    try {
      await updateAdminOrder(order.id, status);
      await loadOrders(search);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Order update failed.');
    }
  };

  return (
    <main className="min-h-screen pt-24">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="glass-panel store-hero relative overflow-hidden p-8 md:p-12">
          <div className="store-hero__glow" />
          <div className="relative z-10">
            <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-white/35 transition hover:text-white/70" style={{ fontFamily: 'var(--font-mono)' }}>← Back to homepage</Link>
            <p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em] text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>LSCM // ADMINISTRATION</p>
            <GlitchyText text="ORDER CONTROL" as="h1" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" style={{ fontFamily: 'var(--font-display)' }} />
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45" style={{ fontFamily: 'var(--font-body)' }}>Search by order number or user, approve incoming requests, mark delivery complete, or revive a misclicked order.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <form className="flex flex-1 gap-2" onSubmit={event => { event.preventDefault(); void loadOrders(search); }}>
            <input value={search} onChange={event => setSearch(event.target.value)} className="input-glass min-w-0 flex-1 px-4 py-3 text-sm text-white" placeholder="Search order number, name or email" />
            <button className="bg-[var(--accent)] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-black">Search</button>
          </form>
          <select value={activeStatus} onChange={event => setActiveStatus(event.target.value as 'all' | Status)} className="input-glass px-4 py-3 text-xs uppercase tracking-[0.16em] text-white">
            <option value="all" className="bg-[#100b1d]">All orders</option>
            {(Object.keys(STATUS_LABELS) as Status[]).map(status => <option key={status} value={status} className="bg-[#100b1d]">{STATUS_LABELS[status]}</option>)}
          </select>
        </div>

        {loading ? <p className="py-16 text-center text-xs uppercase tracking-[0.2em] text-white/35">Loading orders...</p> : grouped.length === 0 ? (
          <section className="mt-8 glass-panel p-12 text-center"><p className="text-sm uppercase tracking-[0.2em] text-white/40">No orders found.</p></section>
        ) : grouped.map(([userLabel, userOrders]) => (
          <section key={userLabel} className="mt-8 glass-panel p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
              <div><p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>Customer</p><h2 className="mt-2 text-xl uppercase tracking-[0.08em] text-white">{userLabel}</h2></div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">{userOrders.length} item{userOrders.length === 1 ? '' : 's'}</span>
            </div>
            <div className="mt-5 space-y-3">
              {userOrders.map(order => (
                <article key={order.id} className={`border border-white/[0.08] p-4 ${order.status === 'finished' ? 'bg-white/[0.015] text-white/45 grayscale' : 'bg-white/[0.035]'}`}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3"><h3 className="text-sm uppercase tracking-[0.08em] text-white">{order.product_name || order.productName}</h3><span className="border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-[var(--accent)]">{STATUS_LABELS[order.status as Status] || order.status}</span></div>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/30">Order {order.order_number} · Qty {order.quantity} · {order.category}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select defaultValue={order.status} onChange={event => void transition(order, event.target.value as Status)} className="input-glass px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-white">
                        {(Object.keys(STATUS_LABELS) as Status[]).map(status => <option key={status} value={status} className="bg-[#100b1d]">{STATUS_LABELS[status]}</option>)}
                      </select>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
      <Footer />
    </main>
  );
}