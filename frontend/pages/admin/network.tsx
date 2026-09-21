import { useEffect, useMemo, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import { apiGet, apiPatch } from '@/lib/api';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';

type NetworkState = {
  botName: string;
  botUsername: string;
  connected: boolean;
  enabled: boolean;
  statusType: 'online' | 'idle' | 'dnd' | 'invisible';
  statusDescription: string;
  activityType: 'playing' | 'listening' | 'watching' | 'competing';
  activityTitle: string;
  buttons: { label: string; url: string }[];
  lastError: string;
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await currentUser(req as never);
  if (!user) return { redirect: { destination: '/auth', permanent: false } };
  if (!isAdminUser(user)) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
};

export default function NetworkManagerPage() {
  const [state, setState] = useState<NetworkState | null>(null);
  const [draft, setDraft] = useState<Partial<NetworkState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState('');

  const cooldown = useMemo(() => Math.max(0, Math.ceil((cooldownUntil - now) / 1000)), [cooldownUntil, now]);

  useEffect(() => {
    let mounted = true;
    void apiGet<{ success: boolean; state: NetworkState }>('/api/admin/network')
      .then(result => {
        if (!mounted) return;
        setState(result.state);
        setDraft(result.state);
      })
      .catch(error => mounted && setMessage(error instanceof Error ? error.message : 'Could not load network state.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!cooldownUntil) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= cooldownUntil) {
        setCooldownUntil(0);
        window.clearInterval(timer);
      } else {
        setNow(Date.now());
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const result = await apiPatch<{ success: boolean; state: NetworkState }>('/api/admin/network', {
        enabled: draft.enabled,
        statusType: draft.statusType,
        statusDescription: draft.statusDescription,
        activityType: draft.activityType,
        activityTitle: draft.activityTitle,
        buttons: draft.buttons || [],
      });
      setState(result.state);
      setDraft(result.state);
      setCooldownUntil(Date.now() + 5000);
      setMessage('Network presence updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update network presence.');
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = <K extends keyof NetworkState>(key: K, value: NetworkState[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const addButton = () => {
    const buttons = draft.buttons || [];
    if (buttons.length >= 3) return;
    updateDraft('buttons', [...buttons, { label: 'Open network', url: 'https://discord.com' }]);
  };

  const removeButton = (index: number) => {
    updateDraft('buttons', (draft.buttons || []).filter((_, buttonIndex) => buttonIndex !== index));
  };

  const updateButton = (index: number, key: 'label' | 'url', value: string) => {
    updateDraft('buttons', (draft.buttons || []).map((button, buttonIndex) => buttonIndex === index ? { ...button, [key]: value } : button));
  };

  return (
    <main className="min-h-screen pt-24">
      <Header />
      <section className="w-full border-y border-[var(--accent)]/20 bg-black/30 px-6 py-5 shadow-[0_0_40px_rgba(168,85,247,0.12)] md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.34em] text-[var(--accent)]">LSCM // NETWORK MANAGER</p>
            <h1 className="mt-2 text-2xl uppercase tracking-[0.1em] text-white md:text-3xl">LSCM NETWORK || IMCA</h1>
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
              {loading ? 'Connecting to network service...' : state?.connected ? `Connected${state.botUsername ? ` · @${state.botUsername}` : ''}` : 'Offline · awaiting bot connection'}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:min-w-[620px] lg:grid-cols-4">
            <select value={draft.statusType || 'online'} onChange={event => updateDraft('statusType', event.target.value as NetworkState['statusType'])} className="input-glass px-3 py-3 text-[10px] uppercase tracking-[0.12em] text-white">
              <option value="online" className="bg-[#100b1d]">Online</option>
              <option value="idle" className="bg-[#100b1d]">Idle</option>
              <option value="dnd" className="bg-[#100b1d]">Do not disturb</option>
              <option value="invisible" className="bg-[#100b1d]">Invisible</option>
            </select>
            <select value={draft.activityType || 'playing'} onChange={event => updateDraft('activityType', event.target.value as NetworkState['activityType'])} className="input-glass px-3 py-3 text-[10px] uppercase tracking-[0.12em] text-white">
              <option value="playing" className="bg-[#100b1d]">Playing</option>
              <option value="listening" className="bg-[#100b1d]">Listening</option>
              <option value="watching" className="bg-[#100b1d]">Watching</option>
              <option value="competing" className="bg-[#100b1d]">Competing</option>
            </select>
            <input value={draft.activityTitle || ''} onChange={event => updateDraft('activityTitle', event.target.value)} className="input-glass px-3 py-3 text-[10px] uppercase tracking-[0.12em] text-white placeholder:text-white/25" placeholder="Activity title" maxLength={128} />
            <button type="button" onClick={() => void save()} disabled={saving || cooldown > 0 || loading} className="bg-[var(--accent)] px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
              {saving ? 'Updating...' : cooldown > 0 ? `Cooldown ${cooldown}s` : 'Apply state'}
            </button>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <div className="flex items-end justify-between gap-5">
          <div>
            <Link href="/admin" className="text-[10px] uppercase tracking-[0.3em] text-white/35 hover:text-white/70">← Admin categories</Link>
            <p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em] text-[var(--accent)]">Category 04 · Network</p>
            <GlitchyText text="NETWORK MANAGER" as="h2" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" />
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">Control the LSCM Discord presence while this app is awake.</p>
          </div>
          <div className={`hidden border px-4 py-3 text-right md:block ${state?.connected ? 'border-emerald-300/30' : 'border-white/10'}`}>
            <p className="text-[9px] uppercase tracking-[0.24em] text-white/35">Gateway</p>
            <p className={`mt-2 text-xs uppercase tracking-[0.16em] ${state?.connected ? 'text-emerald-300' : 'text-white/45'}`}>{state?.connected ? 'Live' : 'Offline'}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel p-7 md:p-9">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">Presence controls</p>
            <h3 className="mt-4 text-2xl uppercase tracking-[0.08em] text-white">Discord activity</h3>
            <label className="mt-8 flex items-center justify-between border border-white/10 bg-white/[0.025] px-4 py-4">
              <span><span className="block text-[10px] uppercase tracking-[0.18em] text-white/70">Bot presence</span><span className="mt-1 block text-xs text-white/35">Toggle the visible Discord presence without disconnecting the gateway.</span></span>
              <input type="checkbox" checked={draft.enabled ?? true} onChange={event => updateDraft('enabled', event.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
            </label>
            <label className="mt-4 block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Status description</span>
              <input value={draft.statusDescription || ''} onChange={event => updateDraft('statusDescription', event.target.value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white placeholder:text-white/25" placeholder="Los Santos Car Modders Community" maxLength={128} />
            </label>
            <div className="mt-7 border-t border-white/[0.08] pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Bot button presets</p>
                  <p className="mt-1 text-xs text-white/30">Saved for future bot messages · up to 3 links.</p>
                </div>
                <button type="button" onClick={addButton} disabled={(draft.buttons || []).length >= 3} className="border border-[var(--accent)]/40 px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-[var(--accent)] disabled:opacity-30">+ Add button</button>
              </div>
              <div className="mt-4 space-y-3">
                {(draft.buttons || []).map((button, index) => (
                  <div key={`${index}-${button.label}`} className="grid gap-2 md:grid-cols-[0.8fr_1.2fr_auto]">
                    <input value={button.label} onChange={event => updateButton(index, 'label', event.target.value)} className="input-glass px-3 py-3 text-xs text-white placeholder:text-white/25" placeholder="Button label" maxLength={32} />
                    <input value={button.url} onChange={event => updateButton(index, 'url', event.target.value)} className="input-glass px-3 py-3 text-xs text-white placeholder:text-white/25" placeholder="https://..." maxLength={512} />
                    <button type="button" onClick={() => removeButton(index)} className="border border-red-300/20 px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-red-200/60 hover:text-red-200">Remove</button>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10px] leading-5 text-white/25">Discord does not render custom images or clickable buttons on a bot gateway presence. These link presets are stored for bot message actions.</p>
            </div>
            {message && <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[var(--accent-2)]">{message}</p>}
            {state?.lastError && <p className="mt-3 text-xs leading-6 text-red-300/75">{state.lastError}</p>}
          </section>
          <section className="glass-panel min-h-[260px] border-dashed border-white/15 p-7 md:p-9">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Network modules</p>
            <div className="flex min-h-[190px] items-center justify-center text-center">
              <p className="max-w-xs text-xs uppercase leading-7 tracking-[0.18em] text-white/25">Reserved for upcoming network tools.</p>
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}