import { useEffect, useMemo, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import EmojiField from '@/components/ui/EmojiField';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
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

type ModuleName = 'discord' | 'announcements' | 'moderator' | 'cockpit';
type DiscordChannel = { id: string; name: string; guildId: string; guildName: string };
type DiscordChatChannel = DiscordChannel & {
  type: 'text' | 'announcement';
  messageCount: number;
  updatedAt: string;
};
type DiscordChatMessage = {
  id: string;
  channelId: string;
  guildId: string;
  guildName: string;
  channelName: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string;
  content: string;
  isBot: boolean;
  createdAt: string;
};
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
type ModeratorMember = {
  guildId: string;
  guildName: string;
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  joinedAt: string | null;
  roles: string[];
  status: 'online' | 'idle' | 'dnd' | 'offline';
  messageCount: number;
  lastMessageAt: string | null;
  recentlyActive: boolean;
  isBot: boolean;
  muted: boolean;
  timeoutUntil: string | null;
};
type ModeratorSnapshot = {
  generatedAt: string;
  members: ModeratorMember[];
  channels: {
    guildId: string;
    guildName: string;
    id: string;
    name: string;
    type: 'text' | 'announcement' | 'voice' | 'stage';
    memberCount: number;
    messageCount: number;
    lastMessageAt: string | null;
    active: boolean;
  }[];
  activity: {
    guildId: string;
    guildName: string;
    channelId: string;
    channelName: string;
    authorId: string;
    authorName: string;
    createdAt: string;
  }[];
};
type ModeratorActionPayload = {
  guildId: string;
  memberId: string;
  action: 'mute' | 'unmute' | 'nickname' | 'ban';
  nickname?: string;
  muteMinutes?: number;
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
  const [moderator, setModerator] = useState<ModeratorSnapshot | null>(null);
  const [moderatorLoading, setModeratorLoading] = useState(false);
  const [moderatorProgress, setModeratorProgress] = useState(0);
  const [moderatorTab, setModeratorTab] = useState<'overview' | 'members'>('overview');
  const [moderatorBusy, setModeratorBusy] = useState('');
  const [chatChannels, setChatChannels] = useState<DiscordChatChannel[]>([]);
  const [chatMessages, setChatMessages] = useState<DiscordChatMessage[]>([]);
  const [selectedChatChannelId, setSelectedChatChannelId] = useState('');
  const [chatDraft, setChatDraft] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [operatorName, setOperatorName] = useState('Admin');
  const [botUsername, setBotUsername] = useState('');

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

  const loadModerator = async (forceRefresh = false) => {
    setModeratorLoading(true);
    setModeratorProgress(8);
    const progressTimer = window.setInterval(() => {
      setModeratorProgress(current => Math.min(92, current + (current < 55 ? 9 : 4)));
    }, 450);
    try {
      const result = await apiGet<{ success: boolean; snapshot: ModeratorSnapshot }>(`/api/admin/moderator${forceRefresh ? '?refresh=1' : ''}`);
      setModerator(result.snapshot);
      setModeratorProgress(100);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load moderation data.');
    } finally {
      window.clearInterval(progressTimer);
      setModeratorLoading(false);
    }
  };

  const loadCockpit = async (channelId = selectedChatChannelId, sync = false) => {
    setChatLoading(true);
    try {
      const params = new URLSearchParams();
      if (channelId) params.set('channelId', channelId);
      if (sync) params.set('sync', '1');
      const result = await apiGet<{
        success: boolean;
        channels: DiscordChatChannel[];
        messages: DiscordChatMessage[];
        selectedChannelId: string;
        operatorName: string;
        botUsername: string;
      }>(`/api/admin/cockpit${params.toString() ? `?${params.toString()}` : ''}`);
      setChatChannels(result.channels);
      setChatMessages(result.messages);
      setSelectedChatChannelId(result.selectedChannelId);
      setOperatorName(result.operatorName);
      setBotUsername(result.botUsername);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load Bot Cockpit.');
    } finally {
      setChatLoading(false);
    }
  };

  const runModeratorAction = async (payload: ModeratorActionPayload) => {
    const busyKey = `${payload.memberId}:${payload.action}`;
    setModeratorBusy(busyKey);
    setMessage('');
    try {
      const result = await apiPatch<{ success: boolean; message: string; snapshot: ModeratorSnapshot }>('/api/admin/moderator', payload);
      setModerator(result.snapshot);
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Moderation action failed.');
    } finally {
      setModeratorBusy('');
    }
  };

  const sendChatMessage = async () => {
    const content = chatDraft.trim();
    if (!selectedChatChannelId || !content || chatSending || cooldown > 0) return;
    setChatSending(true);
    setMessage('');
    setChatDraft('');
    try {
      const result = await apiPost<{
        success: boolean;
        message: string;
        messages: DiscordChatMessage[];
        selectedChannelId: string;
        operatorName: string;
        botUsername: string;
      }>('/api/admin/cockpit', { channelId: selectedChatChannelId, content });
      setChatMessages(result.messages);
      setSelectedChatChannelId(result.selectedChannelId);
      setOperatorName(result.operatorName);
      setBotUsername(result.botUsername);
      setCooldownUntil(Date.now() + 5000);
      setMessage(result.message);
    } catch (error) {
      setChatDraft(content);
      setMessage(error instanceof Error ? error.message : 'Could not send the message.');
    } finally {
      setChatSending(false);
    }
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
    if (module === 'moderator' && !moderator && !moderatorLoading) void loadModerator();
    if (module === 'cockpit' && !chatChannels.length && !chatLoading) void loadCockpit();
  };

  return (
    <main className="min-h-screen pt-24">
      <Header />
      <section className="mx-auto max-w-[1700px] px-6 py-12 md:px-10 xl:px-14">
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
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.28fr)]">
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
              <ModeratorPanel
                snapshot={moderator}
                loading={moderatorLoading}
                progress={moderatorProgress}
                tab={moderatorTab}
                busy={moderatorBusy}
                onTabChange={setModeratorTab}
                onRefresh={() => void loadModerator(true)}
                onAction={payload => void runModeratorAction(payload)}
              />
            )}
            {activeModule === 'cockpit' && (
              <BotCockpitPanel
                channels={chatChannels}
                messages={chatMessages}
                selectedChannelId={selectedChatChannelId}
                draft={chatDraft}
                loading={chatLoading}
                sending={chatSending}
                operatorName={operatorName}
                botUsername={botUsername}
                cooldown={cooldown}
                onSelectChannel={channelId => {
                  setSelectedChatChannelId(channelId);
                  void loadCockpit(channelId);
                }}
                onDraftChange={setChatDraft}
                onSync={() => void loadCockpit(selectedChatChannelId, true)}
                onSend={() => void sendChatMessage()}
              />
            )}
            {message && <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[var(--accent-2)]">{message}</p>}
            {state?.lastError && <p className="mt-3 text-xs leading-6 text-red-300/75">{state.lastError}</p>}
          </section>
          <section className="glass-panel min-h-[260px] border-dashed border-white/15 p-7 md:p-9">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Network modules</p>
            <div className="mt-6 grid gap-3">
              {([
                ['discord', 'LSCM Config'],
                ['announcements', 'Announcements'],
                ['moderator', 'Moderator'],
                  ['cockpit', 'Bot Cockpit'],
              ] as const).map(([module, label]) => (
                <button key={module} type="button" onClick={() => openModule(module)} className={`border px-4 py-4 text-left text-xs uppercase tracking-[0.16em] transition ${module === 'discord' ? 'border-[var(--accent)]/75 shadow-[0_0_18px_rgba(168,85,247,0.24)]' : ''} ${activeModule === module ? 'bg-[var(--accent)]/[0.1] text-white' : 'bg-white/[0.025] text-white/65 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/[0.06] hover:text-white'}`}>
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

function BotCockpitPanel({
  channels,
  messages,
  selectedChannelId,
  draft,
  loading,
  sending,
  operatorName,
  botUsername,
  cooldown,
  onSelectChannel,
  onDraftChange,
  onSync,
  onSend,
}: {
  channels: DiscordChatChannel[];
  messages: DiscordChatMessage[];
  selectedChannelId: string;
  draft: string;
  loading: boolean;
  sending: boolean;
  operatorName: string;
  botUsername: string;
  cooldown: number;
  onSelectChannel: (channelId: string) => void;
  onDraftChange: (value: string) => void;
  onSync: () => void;
  onSend: () => void;
}) {
  const selectedChannel = channels.find(channel => channel.id === selectedChannelId);
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">Bot cockpit</p>
          <h3 className="mt-4 text-2xl uppercase tracking-[0.08em] text-white">Discord relay</h3>
          <p className="mt-3 max-w-2xl text-xs leading-6 text-white/40">A cached chat view for the channels this bot can write to. Reads stay local until you explicitly sync.</p>
        </div>
        <button type="button" onClick={onSync} disabled={loading} className="border border-white/15 px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/65 transition hover:border-[var(--accent)]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-35">
          {loading ? 'Syncing...' : 'Sync current channel'}
        </button>
      </div>

      <div className="mt-8 grid min-h-[620px] overflow-hidden border border-white/10 bg-black/20 lg:grid-cols-[230px_1fr]">
        <aside className="border-b border-white/10 bg-white/[0.025] lg:border-b-0 lg:border-r">
          <div className="border-b border-white/10 px-4 py-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Bot-accessible channels</p>
            <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-white/25">{channels.length} cached channels</p>
          </div>
          <div className="max-h-64 overflow-y-auto p-2 lg:max-h-[550px]">
            {channels.map(channel => (
              <button
                key={channel.id}
                type="button"
                onClick={() => onSelectChannel(channel.id)}
                className={`mb-1 flex w-full items-center gap-2 px-3 py-3 text-left transition ${channel.id === selectedChannelId ? 'bg-[var(--accent)]/[0.14] text-white' : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'}`}
              >
                <span className="text-sm text-white/30">#</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] uppercase tracking-[0.12em]">{channel.name}</span>
                  <span className="mt-1 block truncate text-[8px] uppercase tracking-[0.1em] text-white/25">{channel.guildName}</span>
                </span>
                {channel.messageCount > 0 && <span className="text-[9px] text-white/25">{channel.messageCount}</span>}
              </button>
            ))}
            {!channels.length && (
              <div className="p-4 text-[10px] uppercase leading-5 tracking-[0.12em] text-white/30">
                {loading ? 'Loading channels...' : 'No cached channels. Sync to connect.'}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-[620px] min-w-0 flex-col">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg text-white/30">#</span>
              <div className="min-w-0">
                <p className="truncate text-xs uppercase tracking-[0.14em] text-white">{selectedChannel?.name || 'Select a channel'}</p>
                <p className="mt-1 truncate text-[9px] uppercase tracking-[0.1em] text-white/30">{selectedChannel?.guildName || 'No channel selected'}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-5">
            {loading && !messages.length && <p className="py-10 text-center text-[10px] uppercase tracking-[0.18em] text-white/30">Loading cached messages...</p>}
            {!loading && selectedChannel && !messages.length && (
              <div className="py-10 text-center">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">No cached messages</p>
                <p className="mt-3 text-xs leading-6 text-white/25">Use Sync current channel to fetch the latest 50 messages once.</p>
              </div>
            )}
            {!selectedChannel && !loading && <p className="py-10 text-center text-[10px] uppercase tracking-[0.18em] text-white/30">Sync channels to begin.</p>}
            {messages.map(item => (
              <div key={item.id} className="flex gap-3 border-b border-white/[0.05] py-3">
                <img src={item.authorAvatarUrl} alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded-full border border-white/10 bg-white/5" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className={`text-xs ${item.isBot ? 'text-[var(--accent)]' : 'text-white/80'}`}>{item.authorName}</span>
                    <span className="text-[8px] uppercase tracking-[0.12em] text-white/25">@{item.authorUsername} · {item.isBot ? 'Bot' : 'Member'}</span>
                    <span className="text-[8px] uppercase tracking-[0.08em] text-white/20">{formatModeratorDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-6 text-white/65">{item.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={event => {
              event.preventDefault();
              onSend();
            }}
            className="border-t border-white/10 bg-white/[0.025] p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[9px] uppercase tracking-[0.1em] text-white/30">
              <span>Admin: {operatorName}</span>
              <span>Discord relay: @{botUsername || 'LSCM bot'}</span>
            </div>
            <div className="flex gap-2">
              <EmojiField
                multiline
                value={draft}
                onChange={onDraftChange}
                className="input-glass min-h-12 flex-1 px-3 py-3 text-xs leading-5 text-white placeholder:text-white/25"
                placeholder={selectedChannel ? `Message #${selectedChannel.name}` : 'Select a channel first'}
                maxLength={2000}
              />
              <button type="submit" disabled={!selectedChannel || !draft.trim() || sending || cooldown > 0} className="self-end bg-[var(--accent)] px-4 py-3 text-[9px] uppercase tracking-[0.16em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35">
                {sending ? 'Sending...' : cooldown > 0 ? `${cooldown}s` : 'Send'}
              </button>
            </div>
            <p className="mt-2 text-[8px] uppercase tracking-[0.1em] text-white/20">Messages are rate-limited to protect the bot.</p>
          </form>
        </section>
      </div>
    </>
  );
}

function ModeratorPanel({
  snapshot,
  loading,
  progress,
  tab,
  busy,
  onTabChange,
  onRefresh,
  onAction,
}: {
  snapshot: ModeratorSnapshot | null;
  loading: boolean;
  progress: number;
  tab: 'overview' | 'members';
  busy: string;
  onTabChange: (tab: 'overview' | 'members') => void;
  onRefresh: () => void;
  onAction: (payload: ModeratorActionPayload) => void;
}) {
  const [search, setSearch] = useState('');
  const [memberPage, setMemberPage] = useState(1);
  const activeMembers = snapshot?.members.filter(member => member.recentlyActive).length || 0;
  const activeChannels = snapshot?.channels.filter(channel => channel.active).length || 0;
  const visibleMembers = snapshot?.members.filter(member => {
    const query = search.trim().toLowerCase();
    return !query || `${member.displayName} ${member.username} ${member.guildName}`.toLowerCase().includes(query);
  }) || [];
  const memberPageCount = Math.max(1, Math.ceil(visibleMembers.length / 12));
  const activePage = Math.min(memberPage, memberPageCount);
  const pageMembers = visibleMembers.slice((activePage - 1) * 12, activePage * 12);
  const activeRatio = snapshot?.members.length ? Math.round((activeMembers / snapshot.members.length) * 100) : 0;
  const channelBars = [...(snapshot?.channels || [])].sort((a, b) => b.messageCount - a.messageCount).slice(0, 6);
  const maxChannelMessages = Math.max(1, ...channelBars.map(channel => channel.messageCount));
  const activityBuckets = getActivityBuckets(snapshot?.activity || [], snapshot?.generatedAt || new Date(0).toISOString());

  if (loading && !snapshot) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-center">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--accent)]">Moderator module</p>
          <p className="mt-4 text-sm uppercase tracking-[0.12em] text-white/40">Scanning Discord server activity...</p>
          <ScanProgressBar progress={progress} />
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-center">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-red-300/75">Moderator module offline</p>
          <p className="mt-4 text-sm leading-7 text-white/40">The Discord bot must be connected with member and presence access enabled.</p>
          <button type="button" onClick={onRefresh} className="mt-6 border border-[var(--accent)]/50 px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white hover:bg-[var(--accent)]/[0.1]">Retry scan</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">Moderator module</p>
          <h3 className="mt-4 text-2xl uppercase tracking-[0.08em] text-white">Server intelligence</h3>
          <p className="mt-3 max-w-xl text-xs leading-6 text-white/40">Members, live channel activity, presence state and recent message activity across the connected Discord servers.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="border border-white/15 px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/65 transition hover:border-[var(--accent)]/50 hover:text-white disabled:opacity-40">
          {loading ? 'Scanning...' : 'Refresh scan'}
        </button>
      </div>
      {loading && <ScanProgressBar progress={progress} />}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Members', snapshot.members.length, 'Total server members'],
          ['Recently active', activeMembers, 'Presence or messages'],
          ['Active channels', activeChannels, 'Last 24 hours / live'],
          ['Activity events', snapshot.activity.length, 'Recent messages scanned'],
        ].map(([label, value, detail]) => (
          <div key={label} className="border border-white/10 bg-white/[0.025] p-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{label}</p>
            <p className="mt-3 text-2xl uppercase tracking-[0.08em] text-white">{value}</p>
            <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-white/30">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="flex items-center gap-5 border border-white/10 bg-white/[0.02] p-5">
          <CircularMetric value={activeRatio} label="active" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Member pulse</p>
            <p className="mt-2 text-sm uppercase tracking-[0.08em] text-white">{activeMembers} recently active</p>
            <p className="mt-2 text-[10px] leading-5 text-white/35">Presence or message activity observed in the current scan.</p>
          </div>
        </div>
        <div className="border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Message flow by channel</p>
            <span className="text-[9px] uppercase tracking-[0.12em] text-white/25">Recent scan</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {channelBars.map(channel => (
              <div key={`${channel.guildId}:${channel.id}`} className="min-w-0">
                <div className="flex justify-between gap-3 text-[9px] uppercase tracking-[0.08em] text-white/45">
                  <span className="truncate">#{channel.name}</span>
                  <span>{channel.messageCount}</span>
                </div>
                <div className="mt-2 h-1.5 bg-white/10">
                  <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${Math.max(4, (channel.messageCount / maxChannelMessages) * 100)}%` }} />
                </div>
              </div>
            ))}
            {!channelBars.length && <p className="text-xs text-white/35">No channel activity available.</p>}
          </div>
        </div>
      </div>
      <div className="mt-5 border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Activity trend</p>
          <span className="text-[9px] uppercase tracking-[0.12em] text-white/25">Last 7 days</span>
        </div>
        <ActivityTrend values={activityBuckets} />
      </div>

      <div className="mt-8 flex border-b border-white/10">
        {([
          ['overview', 'Server overview'],
          ['members', 'Member management'],
        ] as const).map(([value, label]) => (
          <button key={value} type="button" onClick={() => onTabChange(value)} className={`border-b-2 px-4 py-3 text-[10px] uppercase tracking-[0.16em] transition ${tab === value ? 'border-[var(--accent)] text-white' : 'border-transparent text-white/35 hover:text-white/70'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="mt-7 space-y-8">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">Channel activity</p>
                <p className="mt-2 text-xs text-white/35">Messages scanned per text channel and live voice occupancy.</p>
              </div>
              <span className="text-[9px] uppercase tracking-[0.14em] text-white/25">{snapshot.channels.length} channels</span>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {snapshot.channels.map(channel => (
                <div key={`${channel.guildId}:${channel.id}`} className="flex items-center gap-3 border border-white/10 bg-white/[0.02] px-4 py-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${channel.active ? 'bg-emerald-300' : 'bg-white/20'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs uppercase tracking-[0.08em] text-white/75">#{channel.name}</p>
                    <p className="mt-1 truncate text-[9px] uppercase tracking-[0.12em] text-white/30">{channel.guildName} · {channel.type}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-white/65">{channel.type === 'voice' || channel.type === 'stage' ? `${channel.memberCount} live` : `${channel.messageCount} scanned`}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-white/25">{channel.active ? 'Active' : 'Quiet'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">Recent server activity</p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {snapshot.activity.length ? snapshot.activity.map((item, index) => (
                <div key={`${item.channelId}:${item.createdAt}:${item.authorId}:${index}`} className="border border-white/10 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-xs text-white/75">{item.authorName}</p>
                    <span className="shrink-0 text-[9px] uppercase tracking-[0.08em] text-white/25">{formatModeratorDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-2 truncate text-[9px] uppercase tracking-[0.12em] text-[var(--accent)]">#{item.channelName}</p>
                  <p className="mt-1 truncate text-[9px] uppercase tracking-[0.1em] text-white/30">{item.guildName} · Message event</p>
                </div>
              )) : <p className="border border-white/10 p-5 text-xs text-white/35">No recent message activity found.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">Member management</p>
              <p className="mt-2 text-xs text-white/35">Mute, rename or ban members directly from the connected server.</p>
            </div>
            <div className="w-full sm:w-72">
              <EmojiField value={search} onChange={value => { setSearch(value); setMemberPage(1); }} className="input-glass w-full px-4 py-3 text-xs text-white placeholder:text-white/25" placeholder="Search members..." />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {pageMembers.map(member => (
              <ModeratorMemberRow key={`${member.guildId}:${member.id}:${member.displayName}`} member={member} busy={busy} onAction={onAction} />
            ))}
            {!visibleMembers.length && <p className="border border-white/10 p-6 text-center text-xs text-white/35">No members match this search.</p>}
          </div>
          {visibleMembers.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-white/[0.08] pt-5">
              <button type="button" disabled={activePage === 1} onClick={() => setMemberPage(page => Math.max(1, page - 1))} className="border border-white/15 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-white/55 transition hover:border-[var(--accent)]/50 hover:text-white disabled:opacity-25">Previous</button>
              {Array.from({ length: memberPageCount }, (_, index) => index + 1).slice(Math.max(0, activePage - 3), Math.max(0, activePage - 3) + 5).map(page => (
                <button key={page} type="button" onClick={() => setMemberPage(page)} className={`h-8 min-w-8 border px-2 text-[9px] uppercase tracking-[0.1em] transition ${page === activePage ? 'border-[var(--accent)] bg-[var(--accent)]/[0.12] text-white' : 'border-white/15 text-white/45 hover:border-[var(--accent)]/50 hover:text-white'}`}>{page}</button>
              ))}
              <button type="button" disabled={activePage === memberPageCount} onClick={() => setMemberPage(page => Math.min(memberPageCount, page + 1))} className="border border-white/15 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-white/55 transition hover:border-[var(--accent)]/50 hover:text-white disabled:opacity-25">Next</button>
              <span className="ml-2 text-[9px] uppercase tracking-[0.12em] text-white/25">Page {activePage} / {memberPageCount}</span>
            </div>
          )}
        </div>
      )}
      <p className="mt-6 text-[9px] uppercase tracking-[0.12em] text-white/25">Last scan: {formatModeratorDate(snapshot.generatedAt)} · message totals reflect the recent history scanned per channel.</p>
    </>
  );
}

function ScanProgressBar({ progress }: { progress: number }) {
  const value = Math.max(0, Math.min(100, progress));
  return (
    <div className="mt-6 w-full max-w-xl">
      <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-white/35">
        <span>Scanning members, channels and activity</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden bg-white/10">
        <div className="h-full bg-[var(--accent)] shadow-[0_0_14px_rgba(168,85,247,0.75)] transition-all duration-300" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CircularMetric({ value, label }: { value: number; label: string }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--accent)" strokeLinecap="square" strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm text-white">{value}%</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}

function ActivityTrend({ values }: { values: number[] }) {
  const width = 700;
  const height = 150;
  const padding = 12;
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => {
    const x = padding + (index / Math.max(1, values.length - 1)) * (width - padding * 2);
    const y = height - padding - (value / max) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-32 w-full overflow-visible">
        {[0, 1, 2, 3].map(line => {
          const y = padding + (line / 3) * (height - padding * 2);
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
        })}
        <polyline points={points} fill="none" stroke="var(--accent)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="3" />
        {values.map((value, index) => {
          const x = padding + (index / Math.max(1, values.length - 1)) * (width - padding * 2);
          const y = height - padding - (value / max) * (height - padding * 2);
          return <circle key={index} cx={x} cy={y} r="4" fill="#100b1d" stroke="var(--accent)" strokeWidth="2" />;
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[9px] uppercase tracking-[0.12em] text-white/25">
        {['6d ago', '5d', '4d', '3d', '2d', 'Yesterday', 'Now'].map(label => <span key={label}>{label}</span>)}
      </div>
    </div>
  );
}

function getActivityBuckets(activity: ModeratorSnapshot['activity'], generatedAt: string) {
  const buckets = Array.from({ length: 7 }, () => 0);
  const generatedTimestamp = Date.parse(generatedAt);
  for (const item of activity) {
    const age = Math.max(0, generatedTimestamp - Date.parse(item.createdAt));
    const bucket = Math.min(6, Math.floor(age / 86400000));
    buckets[6 - bucket] += 1;
  }
  return buckets;
}

function ModeratorMemberRow({
  member,
  busy,
  onAction,
}: {
  member: ModeratorMember;
  busy: string;
  onAction: (payload: ModeratorActionPayload) => void;
}) {
  const [nickname, setNickname] = useState(member.displayName);
  const busyFor = (action: ModeratorActionPayload['action']) => busy === `${member.id}:${action}`;
  const basePayload = { guildId: member.guildId, memberId: member.id };

  return (
    <div className="border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="flex min-w-0 items-center gap-3 xl:w-[35%]">
          <img src={member.avatarUrl} alt="" className="h-10 w-10 rounded-full border border-white/10 bg-white/5" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm text-white">{member.displayName}</p>
              <span className={`h-2 w-2 shrink-0 rounded-full ${member.status === 'online' ? 'bg-emerald-300' : member.status === 'idle' ? 'bg-amber-300' : member.status === 'dnd' ? 'bg-red-300' : 'bg-white/20'}`} />
            </div>
            <p className="mt-1 truncate text-[9px] uppercase tracking-[0.1em] text-white/30">@{member.username} · {member.guildName}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-white/35">{member.recentlyActive ? 'Recently active' : 'Not recently active'} · {member.messageCount} messages scanned</p>
          </div>
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_auto]">
          <EmojiField value={nickname} onChange={setNickname} className="input-glass w-full px-3 py-2 text-xs text-white" placeholder="Nickname" maxLength={32} />
          <button type="button" disabled={busyFor('nickname') || nickname.trim() === member.displayName} onClick={() => onAction({ ...basePayload, action: 'nickname', nickname })} className="border border-white/15 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-white/65 transition hover:border-[var(--accent)]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-35">
            {busyFor('nickname') ? 'Saving...' : 'Save nickname'}
          </button>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {member.muted ? (
            <button type="button" disabled={busyFor('unmute')} onClick={() => onAction({ ...basePayload, action: 'unmute' })} className="border border-amber-300/25 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-amber-100/75 transition hover:border-amber-300/60 hover:text-amber-100 disabled:opacity-35">
              {busyFor('unmute') ? 'Working...' : 'Unmute'}
            </button>
          ) : (
            <ConfirmButton
              onConfirm={() => onAction({ ...basePayload, action: 'mute', muteMinutes: 60 })}
              confirmText="Are you sure?"
              timeout={3000}
              lineColor="#fbbf24"
              disabled={busyFor('mute')}
              className="border border-amber-300/25 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-amber-100/75 transition hover:border-amber-300/60 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {busyFor('mute') ? 'Working...' : 'Mute 1h'}
            </ConfirmButton>
          )}
          <ConfirmButton
            onConfirm={() => onAction({ ...basePayload, action: 'ban' })}
            confirmText="Are you sure?"
            timeout={3000}
            lineColor="#f87171"
            disabled={busyFor('ban')}
            className="border border-red-300/25 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-red-200/75 transition hover:border-red-300/60 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {busyFor('ban') ? 'Banning...' : 'Ban'}
          </ConfirmButton>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/[0.07] pt-3 text-[9px] uppercase tracking-[0.1em] text-white/25">
        <span>Last message: {member.lastMessageAt ? formatModeratorDate(member.lastMessageAt) : 'Never observed'}</span>
        {member.timeoutUntil && <span>Muted until: {formatModeratorDate(member.timeoutUntil)}</span>}
        {member.roles.length > 0 && <span>Roles: {member.roles.join(', ')}</span>}
        {member.isBot && <span>Bot account</span>}
      </div>
    </div>
  );
}

function formatModeratorDate(value: string) {
  return new Date(value).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
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