import { useEffect, useMemo, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import EmojiField from '@/components/ui/EmojiField';
import { apiGet, apiPatch, apiPost } from '@/lib/api';
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
  lastError: string;
};

type ModuleName = 'discord' | 'announcements' | 'moderator';
type DiscordChannel = { id: string; name: string; guildName: string };
type AnnouncementPayload = {
  channelId: string;
  header: string;
  iconUrl: string;
  title: string;
  description: string;
  footer: string;
  imageUrl: string;
  color: string;
  footerIconUrl: string;
};
type AnnouncementHistory = {
  id: string;
  channel_name: string;
  payload: AnnouncementPayload;
  created_at: string;
};

const DEFAULT_ANNOUNCEMENT: AnnouncementPayload = {
  channelId: '',
  header: 'LSCM NETWORK',
  iconUrl: '/logo-dark-semi-colourised.png',
  title: '',
  description: '',
  footer: 'Los Santos Car Modders',
  imageUrl: '/lscmgeneric-banner.png',
  color: '#a855f7',
  footerIconUrl: '',
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
  const [activeModule, setActiveModule] = useState<ModuleName>('discord');
  const [announcement, setAnnouncement] = useState<AnnouncementPayload>(DEFAULT_ANNOUNCEMENT);
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [history, setHistory] = useState<AnnouncementHistory[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sending, setSending] = useState(false);

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
    void apiGet<{ success: boolean; channels: DiscordChannel[]; history: AnnouncementHistory[] }>('/api/admin/announcements')
      .then(result => {
        if (!mounted) return;
        setChannels(result.channels);
        setHistory(result.history);
        setAnnouncement(current => ({ ...current, channelId: current.channelId || result.channels[0]?.id || '' }));
      })
      .catch(error => mounted && setMessage(error instanceof Error ? error.message : 'Could not load Discord channels.'));
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

  const updateAnnouncement = <K extends keyof AnnouncementPayload>(key: K, value: AnnouncementPayload[K]) => {
    setAnnouncement(current => ({ ...current, [key]: value }));
  };

  const selectImage = (key: 'iconUrl' | 'imageUrl' | 'footerIconUrl', value: string) => {
    updateAnnouncement(key, value);
  };

  const sendPayload = {
    ...announcement,
    iconUrl: announcement.iconUrl === '__custom__' ? '' : announcement.iconUrl,
    imageUrl: announcement.imageUrl === '__custom__' ? '' : announcement.imageUrl,
    footerIconUrl: announcement.footerIconUrl === '__custom__' ? '' : announcement.footerIconUrl,
  };

  const sendAnnouncement = async () => {
    setSending(true);
    setMessage('');
    try {
      const result = await apiPost<{ success: boolean; message: string }>('/api/admin/announcements', sendPayload);
      setHistory(current => [{
        id: `local-${Date.now()}`,
        channel_name: channels.find(channel => channel.id === announcement.channelId)?.name || 'Discord channel',
        payload: announcement,
        created_at: new Date().toISOString(),
      }, ...current]);
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not send announcement.');
    } finally {
      setSending(false);
    }
  };

  const restoreAnnouncement = (item: AnnouncementHistory) => {
    setAnnouncement({ ...DEFAULT_ANNOUNCEMENT, ...item.payload });
    setHistoryOpen(false);
    setMessage('Announcement scaffold restored.');
  };

  const openModule = (module: ModuleName) => {
    setActiveModule(module);
    setHistoryOpen(false);
    setMessage('');
  };

  return (
    <main className="min-h-screen pt-24">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10">
         <div className="flex items-end justify-between gap-5">
          <div>
            <Link href="/admin" className="text-[10px] uppercase tracking-[0.3em] text-white/35 hover:text-white/70">← Admin categories</Link>
            <p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.44em] text-[var(--accent)]">Category 04 · Network</p>
            <GlitchyText text="NETWORK MANAGER" as="h2" className="text-4xl uppercase tracking-[0.08em] text-white md:text-7xl" />
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">Control the LSCM Discord presence while this app is awake.</p>
          </div>
        </div>
         <div className="mt-8 flex flex-col gap-5 border border-[var(--accent)]/25 bg-[var(--accent)]/[0.06] p-5 shadow-[0_0_35px_rgba(168,85,247,0.08)] md:flex-row md:items-center md:justify-between md:p-6">
           <div>
             <p className="text-[9px] uppercase tracking-[0.34em] text-[var(--accent)]">LSCM // NETWORK MANAGER</p>
             <h3 className="mt-2 text-xl uppercase tracking-[0.1em] text-white md:text-2xl">LSCM NETWORK || IMCA</h3>
             <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
               {loading ? 'Connecting to network service...' : state?.connected ? `Connected${state.botUsername ? ` · @${state.botUsername}` : ''}` : 'Offline · awaiting bot connection'}
             </p>
           </div>
           <div className={`border px-4 py-3 md:min-w-36 md:text-right ${state?.connected ? 'border-emerald-300/30' : 'border-white/10'}`}>
             <p className="text-[9px] uppercase tracking-[0.24em] text-white/35">Gateway</p>
             <p className={`mt-2 text-xs uppercase tracking-[0.16em] ${state?.connected ? 'text-emerald-300' : 'text-white/45'}`}>{state?.connected ? 'Live' : 'Offline'}</p>
           </div>
         </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section key={activeModule} className="glass-panel card-fade-in p-7 md:p-9">
            {activeModule === 'discord' && (
              <>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">Presence controls</p>
                <h3 className="mt-4 text-2xl uppercase tracking-[0.08em] text-white">Discord activity</h3>
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Status type</span>
                    <select value={draft.statusType || 'online'} onChange={event => updateDraft('statusType', event.target.value as NetworkState['statusType'])} className="input-glass mt-2 w-full px-4 py-3 text-sm uppercase tracking-[0.08em] text-white">
                      <option value="online" className="bg-[#100b1d]">Online</option>
                      <option value="idle" className="bg-[#100b1d]">Idle</option>
                      <option value="dnd" className="bg-[#100b1d]">Do not disturb</option>
                      <option value="invisible" className="bg-[#100b1d]">Invisible</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Activity type</span>
                    <select value={draft.activityType || 'playing'} onChange={event => updateDraft('activityType', event.target.value as NetworkState['activityType'])} className="input-glass mt-2 w-full px-4 py-3 text-sm uppercase tracking-[0.08em] text-white">
                      <option value="playing" className="bg-[#100b1d]">Playing</option>
                      <option value="listening" className="bg-[#100b1d]">Listening</option>
                      <option value="watching" className="bg-[#100b1d]">Watching</option>
                      <option value="competing" className="bg-[#100b1d]">Competing</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Activity title</span>
                     <EmojiField value={draft.activityTitle || ''} onChange={value => updateDraft('activityTitle', value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white placeholder:text-white/25" placeholder="LSCM Network" maxLength={128} />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Status description</span>
                     <EmojiField value={draft.statusDescription || ''} onChange={value => updateDraft('statusDescription', value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white placeholder:text-white/25" placeholder="Los Santos Car Modders Community" maxLength={128} />
                  </label>
                  <label className="flex items-center justify-between border border-white/10 bg-white/[0.025] px-4 py-4">
                    <span><span className="block text-[10px] uppercase tracking-[0.18em] text-white/70">Live presence</span><span className="mt-1 block text-xs text-white/35">Keep the bot visible on Discord.</span></span>
                    <input type="checkbox" checked={draft.enabled ?? true} onChange={event => updateDraft('enabled', event.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
                  </label>
                  <button type="button" onClick={() => void save()} disabled={saving || cooldown > 0 || loading} className="bg-[var(--accent)] px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
                    {saving ? 'Updating...' : cooldown > 0 ? `Cooldown ${cooldown}s` : 'Apply state'}
                  </button>
                </div>
              </>
            )}
            {activeModule === 'announcements' && (
              <AnnouncementPanel
                announcement={announcement}
                channels={channels}
                history={history}
                historyOpen={historyOpen}
                sending={sending}
                onChange={updateAnnouncement}
                onSelectImage={selectImage}
                onSend={() => void sendAnnouncement()}
                onToggleHistory={() => setHistoryOpen(current => !current)}
                onRestore={restoreAnnouncement}
              />
            )}
            {activeModule === 'moderator' && (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--accent)]">Moderator module</p>
                <h3 className="mt-4 text-3xl uppercase tracking-[0.08em] text-white">Coming soon</h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/40">Moderation tools will be added here.</p>
              </div>
            )}
            {message && <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[var(--accent-2)]">{message}</p>}
            {state?.lastError && <p className="mt-3 text-xs leading-6 text-red-300/75">{state.lastError}</p>}
          </section>
          <section className="glass-panel min-h-[260px] border-dashed border-white/15 p-7 md:p-9">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Network modules</p>
            <div className="mt-6 grid gap-3">
              {([
                ['announcements', 'Announcements'],
                ['moderator', 'Moderator'],
                ['discord', 'LSCM Config'],
              ] as const).map(([module, label]) => (
                <button key={module} type="button" onClick={() => openModule(module)} className={`border px-4 py-4 text-left text-xs uppercase tracking-[0.16em] transition ${activeModule === module ? 'border-[var(--accent)]/60 bg-[var(--accent)]/[0.1] text-white' : 'border-white/10 bg-white/[0.025] text-white/65 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/[0.06] hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function AnnouncementPanel({
  announcement,
  channels,
  history,
  historyOpen,
  sending,
  onChange,
  onSelectImage,
  onSend,
  onToggleHistory,
  onRestore,
}: {
  announcement: AnnouncementPayload;
  channels: DiscordChannel[];
  history: AnnouncementHistory[];
  historyOpen: boolean;
  sending: boolean;
  onChange: <K extends keyof AnnouncementPayload>(key: K, value: AnnouncementPayload[K]) => void;
  onSelectImage: (key: 'iconUrl' | 'imageUrl' | 'footerIconUrl', value: string) => void;
  onSend: () => void;
  onToggleHistory: () => void;
  onRestore: (item: AnnouncementHistory) => void;
}) {
  const imageChoice = (value: string) => value.startsWith('/') ? value : value ? '__custom__' : '';
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">Discord announcements</p>
          <h3 className="mt-4 text-2xl uppercase tracking-[0.08em] text-white">Build an embed</h3>
        </div>
        <button type="button" onClick={onToggleHistory} className="border border-white/15 px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/65 transition hover:border-[var(--accent)]/50 hover:text-white">
          {historyOpen ? 'Close history' : 'History'}
        </button>
      </div>
      {historyOpen ? (
        <div className="mt-8 space-y-3">
          {history.length ? history.map(item => (
            <button key={item.id} type="button" onClick={() => onRestore(item)} className="block w-full border border-white/10 bg-white/[0.025] px-4 py-4 text-left transition hover:border-[var(--accent)]/50">
              <span className="block text-xs uppercase tracking-[0.14em] text-white/75">{item.payload.title || 'Untitled announcement'}</span>
              <span className="mt-2 block text-[10px] uppercase tracking-[0.12em] text-white/35">{item.channel_name} · {new Date(item.created_at).toLocaleString()}</span>
            </button>
          )) : <p className="border border-white/10 p-5 text-xs text-white/35">No previous announcements yet.</p>}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Send to Discord channel</span>
            <select value={announcement.channelId} onChange={event => onChange('channelId', event.target.value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white">
              <option value="" className="bg-[#100b1d]">Select a channel</option>
              {channels.map(channel => <option key={channel.id} value={channel.id} className="bg-[#100b1d]">#{channel.name} · {channel.guildName}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Embed header</span>
             <EmojiField value={announcement.header} onChange={value => onChange('header', value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white" placeholder="LSCM NETWORK" />
          </label>
          <ImageField label="Embed icon" value={announcement.iconUrl} asset="/logo-dark-semi-colourised.png" assetLabel="LSCM logo" onSelect={value => onSelectImage('iconUrl', value)} />
          <label className="block md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Title</span>
             <EmojiField value={announcement.title} onChange={value => onChange('title', value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white" placeholder="Announcement title" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Description</span>
             <EmojiField multiline value={announcement.description} onChange={value => onChange('description', value)} className="input-glass mt-2 min-h-32 w-full px-4 py-3 text-sm leading-6 text-white" placeholder="Write the announcement..." />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Embed footer</span>
             <EmojiField value={announcement.footer} onChange={value => onChange('footer', value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white" placeholder="Los Santos Car Modders" />
          </label>
          <ImageField label="Embed footer icon" value={announcement.footerIconUrl} asset="/logo-dark-semi-colourised.png" assetLabel="LSCM logo" onSelect={value => onSelectImage('footerIconUrl', value)} />
          <ImageField label="Embed banner / image" value={announcement.imageUrl} asset="/lscmgeneric-banner.png" assetLabel="LSCM generic banner" onSelect={value => onSelectImage('imageUrl', value)} />
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Embed colour</span>
            <div className="mt-2 flex gap-3">
              <input type="color" value={announcement.color} onChange={event => onChange('color', event.target.value)} className="h-11 w-14 cursor-pointer border border-white/10 bg-transparent p-1" />
               <EmojiField value={announcement.color} onChange={value => onChange('color', value)} className="input-glass w-full px-4 py-3 text-sm uppercase text-white" placeholder="#A855F7" />
            </div>
          </label>
          <button type="button" onClick={onSend} disabled={sending || !announcement.channelId} className="md:col-span-2 bg-[var(--accent)] px-4 py-4 text-[10px] uppercase tracking-[0.2em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
            {sending ? 'Sending announcement...' : 'Announce'}
          </button>
        </div>
      )}
    </>
  );
}

function ImageField({
  label,
  value,
  asset,
  assetLabel,
  onSelect,
}: {
  label: string;
  value: string;
  asset: string;
  assetLabel: string;
  onSelect: (value: string) => void;
}) {
  const choice = value.startsWith('/') ? value : value ? '__custom__' : '';
  const customValue = value === '__custom__' ? '' : value;
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">{label}</span>
      <select value={choice} onChange={event => onSelect(event.target.value)} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white">
        <option value="" className="bg-[#100b1d]">No image</option>
        <option value={asset} className="bg-[#100b1d]">{assetLabel}</option>
        <option value="__custom__" className="bg-[#100b1d]">Custom image URL</option>
      </select>
       {choice === '__custom__' && <EmojiField value={customValue} onChange={onSelect} className="input-glass mt-2 w-full px-4 py-3 text-sm text-white placeholder:text-white/25" placeholder="https://..." />}
    </label>
  );
}