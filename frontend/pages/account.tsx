import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import { useAuth } from '@/hooks/useAuth';
import { saveProfile } from '@/lib/api';
import { showNotice } from '@/components/ui/NexusNotice';

export default function AccountPage() {
  const router = useRouter();
  const { user, updateUser, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [rockstarTag, setRockstarTag] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setRockstarTag(user.rockstarTag || '');
    }
  }, [isLoading, user, router]);

  if (!user) return null;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await saveProfile({ profile: { fullName: name, bio, rockstarTag } });
      if (!result.success) throw new Error('Profile save failed.');
      updateUser({ name, bio, rockstarTag });
      showNotice('PROFILE UPDATED', 'Your LSCM account is current.', 'success');
    } catch (error) {
      showNotice('PROFILE FAILED', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-display)' }}>
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-36 md:px-10">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>LSCM // ACCOUNT DASHBOARD</p>
          <h1 className="mt-5 text-5xl uppercase tracking-[0.08em] text-white md:text-7xl">Your Profile.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/40" style={{ fontFamily: 'var(--font-body)' }}>Your community identity, account details and Rockstar tag in one place.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="border border-white/[0.08] bg-white/[0.035] p-7">
            <div className="flex items-center gap-5 border-b border-white/[0.08] pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-2xl text-white">{user.name[0]?.toUpperCase()}</div>
              <div><h2 className="text-xl uppercase tracking-[0.12em] text-white">{user.name}</h2><p className="mt-1 text-xs text-white/35" style={{ fontFamily: 'var(--font-mono)' }}>{user.email}</p></div>
            </div>
            <div className="mt-6 space-y-4 text-xs uppercase tracking-[0.18em] text-white/50">
              <p>Member since <strong className="ml-2 text-white/80">{new Date(user.createdAt).toLocaleDateString()}</strong></p>
              <p>Rockstar tag <strong className="ml-2 text-[var(--accent)]">{user.rockstarTag || 'Not added'}</strong></p>
            </div>
          </section>
          <form onSubmit={save} className="border border-white/[0.08] bg-white/[0.035] p-7">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/35" style={{ fontFamily: 'var(--font-mono)' }}>Edit identity</p>
            <div className="mt-6 space-y-5">
              <input className="input-glass w-full px-4 py-3.5 text-sm text-white" value={name} onChange={event => setName(event.target.value)} placeholder="Display name" required />
              <textarea className="input-glass min-h-36 w-full resize-none px-4 py-3.5 text-sm text-white" value={bio} onChange={event => setBio(event.target.value)} placeholder="About me" maxLength={500} />
              <input className="input-glass w-full px-4 py-3.5 text-sm text-white" value={rockstarTag} onChange={event => setRockstarTag(event.target.value)} placeholder="Rockstar Social tag" maxLength={80} />
            </div>
            <button disabled={saving} className="mt-6 bg-[var(--accent)] px-6 py-3.5 text-[10px] uppercase tracking-[0.24em] text-black disabled:opacity-50">{saving ? 'Saving...' : 'Save profile'}</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}