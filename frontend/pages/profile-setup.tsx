import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { saveProfile } from '@/lib/api';
import { showNotice } from '@/components/ui/NexusNotice';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [rockstarTag, setRockstarTag] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await saveProfile({ profile: { fullName: name, bio, rockstarTag } });
      updateUser({ name, bio, rockstarTag });
      if (!result.success) throw new Error('Profile could not be saved.');
      router.push('/account');
    } catch (error) {
      showNotice('PROFILE FAILED', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20">
      <form onSubmit={submit} className="w-full max-w-xl border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-2xl md:p-12">
        <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>LSCM // INITIAL PROFILE</p>
        <h1 className="mt-6 text-4xl uppercase tracking-[0.1em] text-white">Get Your Role.</h1>
        <p className="mt-4 text-sm leading-7 text-white/40" style={{ fontFamily: 'var(--font-body)' }}>Set up the profile the community will see. You can change this later.</p>
        <div className="mt-8 space-y-5">
          <input className="input-glass w-full px-4 py-3.5 text-sm text-white" placeholder="Display name" value={name} onChange={event => setName(event.target.value)} minLength={2} required />
          <textarea className="input-glass min-h-32 w-full resize-none px-4 py-3.5 text-sm text-white" placeholder="About me" value={bio} onChange={event => setBio(event.target.value)} maxLength={500} />
          <input className="input-glass w-full px-4 py-3.5 text-sm text-white" placeholder="Rockstar Social tag" value={rockstarTag} onChange={event => setRockstarTag(event.target.value)} maxLength={80} />
        </div>
        <button disabled={saving} className="mt-8 w-full bg-[var(--accent)] px-5 py-4 text-[10px] uppercase tracking-[0.28em] text-black disabled:opacity-50">{saving ? 'Saving...' : 'Enter LSCM'}</button>
      </form>
    </main>
  );
}