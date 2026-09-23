import { useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import { apiGet, apiPatch } from '@/lib/api';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';

type AdminUser = { id: string; email: string; display_name: string; role: 'admin' | 'user'; created_at: string };

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await currentUser(req as never);
  if (!user) return { redirect: { destination: '/auth', permanent: false } };
  if (!isAdminUser(user)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = async (query = '') => {
    setLoading(true);
    try {
      const result = await apiGet<{ success: boolean; users: AdminUser[] }>(`/api/admin/users${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      setUsers(result.users);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(); }, []);

  const updateRole = async (user: AdminUser, role: AdminUser['role']) => {
    if (role === user.role) return;
    setBusy(user.id);
    setMessage('');
    try {
      const result = await apiPatch<{ success: boolean; user: AdminUser }>('/api/admin/users', { id: user.id, role });
      setUsers(current => current.map(item => item.id === user.id ? result.user : item));
      setMessage(`${user.display_name || user.email} is now ${role}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update user role.');
    } finally {
      setBusy('');
    }
  };

  return (
    <main className="min-h-screen pt-24"><Header /><section className="mx-auto max-w-6xl px-6 py-16 md:px-8">
      <div className="flex items-end justify-between gap-5"><div><Link href="/admin" className="text-[10px] uppercase tracking-[0.3em] text-white/35 hover:text-white/70">← Admin categories</Link><p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em] text-[var(--accent)]">LSCM // ACCESS CONTROL</p><GlitchyText text="USER MANAGEMENT" as="h1" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" /><p className="mt-5 text-sm text-white/40">Manage account access without leaving the control panel.</p></div></div>
      <form className="mt-8 flex gap-2" onSubmit={event => { event.preventDefault(); void loadUsers(search); }}><input value={search} onChange={event => setSearch(event.target.value)} className="input-glass min-w-0 flex-1 px-4 py-3 text-sm text-white" placeholder="Search name or email" /><button className="bg-[var(--accent)] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-black">Search</button></form>
      {message && <p className="mt-4 text-xs uppercase tracking-[0.12em] text-[var(--accent-2)]">{message}</p>}
      <section className="mt-8 overflow-hidden border border-white/10 bg-black/20">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 px-5 py-4 text-[9px] uppercase tracking-[0.2em] text-white/35 md:grid-cols-[1fr_220px]"><span>Member</span><span>Access</span></div>
        {loading ? <p className="p-10 text-center text-xs uppercase tracking-[0.18em] text-white/35">Loading users...</p> : users.length ? users.map(user => (
          <div key={user.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-white/[0.07] px-5 py-4 last:border-0 md:grid-cols-[1fr_220px]">
            <div className="min-w-0"><p className="truncate text-sm uppercase tracking-[0.08em] text-white">{user.display_name || 'Unnamed member'}</p><p className="mt-1 truncate text-[10px] text-white/35">{user.email}</p></div>
            <select value={user.role} disabled={busy === user.id} onChange={event => void updateRole(user, event.target.value as AdminUser['role'])} className="input-glass px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white"><option value="user" className="bg-[#100b1d]">User</option><option value="admin" className="bg-[#100b1d]">Admin</option></select>
          </div>
        )) : <p className="p-10 text-center text-xs uppercase tracking-[0.18em] text-white/35">No users found.</p>}
      </section>
    </section><Footer /></main>
  );
}