import { ActivityType, ChannelType, Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import type { ColorResolvable, SendableChannels } from 'discord.js';
import { query } from './db';

export const DISCORD_NETWORK_NAME = 'LSCM NETWORK || IMCA';
export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'invisible';
export type DiscordActivity = 'playing' | 'listening' | 'watching' | 'competing';
export type DiscordButton = { label: string; url: string };
export type DiscordChannel = { id: string; name: string; guildName: string };
export type DiscordAnnouncementPayload = {
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
export type DiscordModeratorMember = {
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
export type DiscordModeratorChannel = {
  guildId: string;
  guildName: string;
  id: string;
  name: string;
  type: 'text' | 'announcement' | 'voice' | 'stage';
  memberCount: number;
  messageCount: number;
  lastMessageAt: string | null;
  active: boolean;
};
export type DiscordModeratorActivity = {
  guildId: string;
  guildName: string;
  channelId: string;
  channelName: string;
  authorId: string;
  authorName: string;
  createdAt: string;
};
export type DiscordModeratorSnapshot = {
  generatedAt: string;
  members: DiscordModeratorMember[];
  channels: DiscordModeratorChannel[];
  activity: DiscordModeratorActivity[];
};
export type DiscordModeratorAction = 'mute' | 'unmute' | 'nickname' | 'ban';

const ACTIVITY_TYPES: Record<DiscordActivity, ActivityType> = {
  playing: ActivityType.Playing,
  listening: ActivityType.Listening,
  watching: ActivityType.Watching,
  competing: ActivityType.Competing,
};

type DiscordRuntime = {
  client: Client | null;
  loginPromise: Promise<string> | null;
  enabled: boolean;
  statusType: DiscordStatus;
  statusDescription: string;
  activityType: DiscordActivity;
  activityTitle: string;
  buttons: DiscordButton[];
  username: string;
  connected: boolean;
  lastError: string;
  lastMutationAt: number;
  settingsLoaded: boolean;
  moderatorSnapshot: DiscordModeratorSnapshot | null;
  moderatorSnapshotAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var lscmDiscordRuntime: DiscordRuntime | undefined;
}

const runtime: DiscordRuntime = global.lscmDiscordRuntime || {
  client: null,
  loginPromise: null,
  enabled: true,
  statusType: 'online',
  statusDescription: 'Los Santos Car Modders Community',
  activityType: 'playing',
  activityTitle: 'LSCM Network',
  buttons: [],
  username: '',
  connected: false,
  lastError: '',
  lastMutationAt: 0,
  settingsLoaded: false,
  moderatorSnapshot: null,
  moderatorSnapshotAt: 0,
};

if (!global.lscmDiscordRuntime) global.lscmDiscordRuntime = runtime;

async function loadSettings() {
  if (runtime.settingsLoaded) return;
  const result = await query<{
    enabled: boolean;
    status_type: DiscordStatus;
    status_description: string;
    activity_type: DiscordActivity;
    activity_title: string;
    buttons: DiscordButton[] | null;
  }>(
    `SELECT enabled, status_type, status_description, activity_type, activity_title, buttons
     FROM lscm_discord_settings WHERE id = 1`,
  );
  const row = result.rows[0];
  if (row) {
    runtime.enabled = row.enabled;
    runtime.statusType = row.status_type;
    runtime.statusDescription = row.status_description;
    runtime.activityType = row.activity_type;
    runtime.activityTitle = row.activity_title;
    runtime.buttons = Array.isArray(row.buttons) ? row.buttons : [];
  }
  runtime.settingsLoaded = true;
}

function applyPresence() {
  if (!runtime.client?.user) return;
  runtime.client.user.setPresence({
    status: runtime.enabled ? runtime.statusType : 'invisible',
    activities: runtime.activityTitle
      ? [{
          name: runtime.activityTitle,
          type: ACTIVITY_TYPES[runtime.activityType],
          state: runtime.statusDescription || undefined,
        }]
      : [],
  });
}

export async function ensureDiscordBot() {
  if (runtime.connected || runtime.loginPromise) return runtime.loginPromise;
  await loadSettings().catch(error => {
    runtime.lastError = error instanceof Error ? error.message : 'Could not load Discord settings.';
  });
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    runtime.lastError = 'DISCORD_BOT_TOKEN is not configured.';
    return null;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessages,
    ],
  });
  runtime.client = client;
  client.once('clientReady', readyClient => {
    runtime.connected = true;
    runtime.username = readyClient.user.username;
    runtime.lastError = '';
    applyPresence();
  });
  client.on('error', error => {
    runtime.connected = false;
    runtime.lastError = error.message;
  });
  runtime.loginPromise = client.login(token).catch(error => {
    runtime.connected = false;
    runtime.lastError = error instanceof Error ? error.message : 'Discord login failed.';
    runtime.client = null;
    runtime.loginPromise = null;
    return '';
  });
  await runtime.loginPromise;
  return runtime.loginPromise;
}

export function getDiscordBotState() {
  return {
    botName: DISCORD_NETWORK_NAME,
    botUsername: runtime.username,
    connected: runtime.connected,
    enabled: runtime.enabled,
    statusType: runtime.statusType,
    statusDescription: runtime.statusDescription,
    activityType: runtime.activityType,
    activityTitle: runtime.activityTitle,
    buttons: runtime.buttons,
    lastError: runtime.lastError,
  };
}

export async function updateDiscordBot(input: {
  enabled?: boolean;
  statusType?: DiscordStatus;
  statusDescription?: string;
  activityType?: DiscordActivity;
  activityTitle?: string;
  buttons?: DiscordButton[];
}) {
  await ensureDiscordBot();
  if (typeof input.enabled === 'boolean') runtime.enabled = input.enabled;
  if (input.statusType) runtime.statusType = input.statusType;
  if (input.statusDescription !== undefined) runtime.statusDescription = input.statusDescription.slice(0, 128);
  if (input.activityType) runtime.activityType = input.activityType;
  if (input.activityTitle !== undefined) runtime.activityTitle = input.activityTitle.slice(0, 128);
  if (input.buttons) runtime.buttons = input.buttons.slice(0, 3);
  await query(
    `INSERT INTO lscm_discord_settings
      (id, enabled, status_type, status_description, activity_type, activity_title, buttons, updated_at)
     VALUES (1, $1, $2, $3, $4, $5, $6::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       enabled = EXCLUDED.enabled,
       status_type = EXCLUDED.status_type,
       status_description = EXCLUDED.status_description,
       activity_type = EXCLUDED.activity_type,
       activity_title = EXCLUDED.activity_title,
       buttons = EXCLUDED.buttons,
       updated_at = CURRENT_TIMESTAMP`,
    [
      runtime.enabled,
      runtime.statusType,
      runtime.statusDescription,
      runtime.activityType,
      runtime.activityTitle,
      JSON.stringify(runtime.buttons),
    ],
  );
  applyPresence();
  return getDiscordBotState();
}

export function discordMutationAllowed() {
  const retryAfter = Math.max(0, 5000 - (Date.now() - runtime.lastMutationAt));
  if (retryAfter > 0) return { allowed: false, retryAfter };
  runtime.lastMutationAt = Date.now();
  return { allowed: true, retryAfter: 0 };
}

export async function getDiscordChannels(): Promise<DiscordChannel[]> {
  await ensureDiscordBot();
  if (!runtime.client) return [];
  const channels: DiscordChannel[] = [];
  for (const guild of runtime.client.guilds.cache.values()) {
    const fetched = await guild.channels.fetch();
    for (const channel of fetched.values()) {
      if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) continue;
      channels.push({ id: channel.id, name: channel.name, guildName: guild.name });
    }
  }
  return channels.sort((a, b) => `${a.guildName}/${a.name}`.localeCompare(`${b.guildName}/${b.name}`));
}

export async function getDiscordModeratorSnapshot(forceRefresh = false): Promise<DiscordModeratorSnapshot> {
  await ensureDiscordBot();
  if (!runtime.client) throw new Error('Discord bot is not connected.');
  if (!forceRefresh && runtime.moderatorSnapshot && Date.now() - runtime.moderatorSnapshotAt < 30000) {
    return runtime.moderatorSnapshot;
  }

  const members: DiscordModeratorMember[] = [];
  const channels: DiscordModeratorChannel[] = [];
  const activity: DiscordModeratorActivity[] = [];
  const messageCounts = new Map<string, number>();
  const lastMessages = new Map<string, number>();
  const now = Date.now();

  for (const guild of runtime.client.guilds.cache.values()) {
    let guildMembers;
    try {
      guildMembers = await guild.members.fetch();
    } catch {
      guildMembers = guild.members.cache;
    }

    let fetchedChannels;
    try {
      fetchedChannels = await guild.channels.fetch();
    } catch {
      fetchedChannels = guild.channels.cache;
    }

    for (const channel of fetchedChannels.values()) {
      if (!channel) continue;
      const isText = channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement;
      const isVoice = channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;
      if (!isText && !isVoice) continue;

      let messageCount = 0;
      let lastMessageAt: string | null = null;
      if (isText && channel.isTextBased()) {
        try {
          const messages = await channel.messages.fetch({ limit: 100 });
          messageCount = messages.size;
          const latest = messages.first();
          lastMessageAt = latest?.createdAt.toISOString() || null;
          for (const message of messages.values()) {
            messageCounts.set(message.author.id, (messageCounts.get(message.author.id) || 0) + 1);
            const timestamp = message.createdTimestamp;
            if (!lastMessages.has(message.author.id) || timestamp > (lastMessages.get(message.author.id) || 0)) {
              lastMessages.set(message.author.id, timestamp);
            }
            if (!message.author.bot && activity.length < 60) {
              activity.push({
                guildId: guild.id,
                guildName: guild.name,
                channelId: channel.id,
                channelName: channel.name,
                authorId: message.author.id,
                authorName: message.member?.displayName || message.author.username,
                createdAt: message.createdAt.toISOString(),
              });
            }
          }
        } catch {
          // A channel without message history permission still appears in the channel overview.
        }
      }

      const memberCount = isVoice && 'members' in channel ? channel.members.size : 0;
      channels.push({
        guildId: guild.id,
        guildName: guild.name,
        id: channel.id,
        name: channel.name,
        type: channel.type === ChannelType.GuildAnnouncement
          ? 'announcement'
          : channel.type === ChannelType.GuildVoice
            ? 'voice'
            : channel.type === ChannelType.GuildStageVoice
              ? 'stage'
              : 'text',
        memberCount,
        messageCount,
        lastMessageAt,
        active: memberCount > 0 || Boolean(lastMessageAt && now - new Date(lastMessageAt).getTime() < 86400000),
      });
    }

    for (const member of guildMembers.values()) {
      const lastMessageTimestamp = lastMessages.get(member.id) || 0;
      const presence = guild.presences.cache.get(member.id);
      const timeoutTimestamp = member.communicationDisabledUntilTimestamp || null;
      members.push({
        guildId: guild.id,
        guildName: guild.name,
        id: member.id,
        username: member.user.username,
        displayName: member.displayName,
        avatarUrl: member.displayAvatarURL({ extension: 'png', size: 128 }),
        joinedAt: member.joinedAt?.toISOString() || null,
        roles: member.roles.cache.filter(role => role.id !== guild.id).map(role => role.name).slice(0, 5),
        status: presence?.status === 'online' || presence?.status === 'idle' || presence?.status === 'dnd'
          ? presence.status
          : 'offline',
        messageCount: messageCounts.get(member.id) || 0,
        lastMessageAt: lastMessageTimestamp ? new Date(lastMessageTimestamp).toISOString() : null,
        recentlyActive: Boolean(presence?.status && presence.status !== 'offline') || now - lastMessageTimestamp < 604800000,
        isBot: member.user.bot,
        muted: Boolean(timeoutTimestamp && timeoutTimestamp > now),
        timeoutUntil: timeoutTimestamp ? new Date(timeoutTimestamp).toISOString() : null,
      });
    }
  }

  activity.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  members.sort((a, b) => b.messageCount - a.messageCount || a.displayName.localeCompare(b.displayName));
  channels.sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));
  const snapshot = { generatedAt: new Date().toISOString(), members, channels, activity: activity.slice(0, 40) };
  runtime.moderatorSnapshot = snapshot;
  runtime.moderatorSnapshotAt = Date.now();
  return snapshot;
}

export async function moderateDiscordMember(input: {
  guildId: string;
  memberId: string;
  action: DiscordModeratorAction;
  nickname?: string;
  muteMinutes?: number;
}) {
  await ensureDiscordBot();
  if (!runtime.client) throw new Error('Discord bot is not connected.');
  const guild = runtime.client.guilds.cache.get(input.guildId);
  if (!guild) throw new Error('Discord server not found.');
  if (input.memberId === runtime.client.user?.id) throw new Error('The bot cannot moderate itself.');
  if (input.memberId === guild.ownerId && input.action === 'ban') throw new Error('The server owner cannot be banned.');

  const member = await guild.members.fetch(input.memberId);
  if (!member.manageable && input.action !== 'nickname') throw new Error('The bot cannot manage this member.');

  if (input.action === 'mute' || input.action === 'unmute') {
    const minutes = Math.max(1, Math.min(40320, Math.round(input.muteMinutes || 60)));
    await member.timeout(input.action === 'mute' ? minutes * 60000 : null, `LSCM moderator ${input.action}`);
  } else if (input.action === 'nickname') {
    await member.setNickname((input.nickname || '').trim().slice(0, 32) || null, 'LSCM moderator nickname update');
  } else {
    if (!member.bannable) throw new Error('The bot cannot ban this member.');
    await guild.members.ban(input.memberId, { deleteMessageSeconds: 0, reason: 'LSCM moderator ban' });
  }

  runtime.moderatorSnapshot = null;
  runtime.moderatorSnapshotAt = 0;
  return input.action === 'ban' ? 'Member banned.' : input.action === 'nickname' ? 'Nickname updated.' : input.action === 'mute' ? 'Member muted.' : 'Member unmuted.';
}

export async function sendDiscordAnnouncement(payload: DiscordAnnouncementPayload, assetOrigin: string) {
  await ensureDiscordBot();
  if (!runtime.client) throw new Error('Discord bot is not connected.');
  const channel = await runtime.client.channels.fetch(payload.channelId);
  if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type) || !channel.isTextBased()) {
    throw new Error('Choose a writable Discord text channel.');
  }

  const embed = new EmbedBuilder();
  const imageUrl = resolveDiscordAssetUrl(payload.imageUrl, assetOrigin);
  const iconUrl = resolveDiscordAssetUrl(payload.iconUrl, assetOrigin);
  const footerIconUrl = resolveDiscordAssetUrl(payload.footerIconUrl, assetOrigin);
  if (payload.header) embed.setAuthor({ name: payload.header, ...(iconUrl ? { iconURL: iconUrl } : {}) });
  if (payload.title) embed.setTitle(payload.title);
  if (payload.description) embed.setDescription(payload.description);
  if (payload.footer) embed.setFooter({ text: payload.footer, ...(footerIconUrl ? { iconURL: footerIconUrl } : {}) });
  if (imageUrl) embed.setImage(imageUrl);
  if (payload.color) embed.setColor(payload.color as ColorResolvable);

  await (channel as SendableChannels).send({ embeds: [embed] });
}

function resolveDiscordAssetUrl(value: string, assetOrigin: string) {
  if (!value) return '';
  try {
    return value.startsWith('/') ? new URL(value, assetOrigin).toString() : new URL(value).toString();
  } catch {
    return '';
  }
}