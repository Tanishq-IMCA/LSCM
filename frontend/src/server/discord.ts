import { ActivityType, ChannelType, Client, EmbedBuilder, GatewayIntentBits, PermissionFlagsBits } from 'discord.js';
import type { ColorResolvable, Message, SendableChannels } from 'discord.js';
import { query } from './db';

export const DISCORD_NETWORK_NAME = 'LSCM NETWORK || IMCA';
export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'invisible';
export type DiscordActivity = 'playing' | 'listening' | 'watching' | 'competing';
export type DiscordButton = { label: string; url: string };
export type DiscordChannel = { id: string; name: string; guildId: string; guildName: string };
export type DiscordChatChannel = DiscordChannel & {
  type: 'text' | 'announcement';
  messageCount: number;
  updatedAt: string;
};
export type DiscordChatMessage = {
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
      GatewayIntentBits.MessageContent,
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
  const readyPromise = new Promise<void>((resolve, reject) => {
    if (client.isReady()) {
      resolve();
      return;
    }
    const timer = setTimeout(() => reject(new Error('Discord gateway did not become ready.')), 15000);
    client.once('clientReady', () => {
      clearTimeout(timer);
      resolve();
    });
    client.once('error', error => {
      clearTimeout(timer);
      reject(error);
    });
  });
  void readyPromise.catch(() => undefined);
  runtime.loginPromise = client.login(token)
    .then(async loginToken => {
      await readyPromise;
      return loginToken;
    })
    .catch(error => {
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
      const permissions = guild.members.me ? channel.permissionsFor(guild.members.me) : null;
      if (permissions && (!permissions.has(PermissionFlagsBits.ViewChannel) || !permissions.has(PermissionFlagsBits.ReadMessageHistory))) continue;
      channels.push({ id: channel.id, name: channel.name, guildId: guild.id, guildName: guild.name });
    }
  }
  return channels.sort((a, b) => `${a.guildName}/${a.name}`.localeCompare(`${b.guildName}/${b.name}`));
}

export async function getDiscordChatSnapshot(channelId?: string, sync = false) {
  let channels = await loadPersistedChatChannels();
  if (sync || !channels.length) {
    channels = await syncDiscordChatChannels();
  }
  const selectedChannelId = channels.some(channel => channel.id === channelId)
    ? channelId || ''
    : channels[0]?.id || '';
  const messages = selectedChannelId ? await loadPersistedChatMessages(selectedChannelId) : [];
  if (sync && selectedChannelId) {
    await syncDiscordChatMessages(selectedChannelId);
    return {
      channels: await loadPersistedChatChannels(),
      messages: await loadPersistedChatMessages(selectedChannelId),
      selectedChannelId,
    };
  }
  return { channels, messages, selectedChannelId };
}

export async function syncDiscordChatChannels(): Promise<DiscordChatChannel[]> {
  const channels = await getDiscordChannels();
  for (const channel of channels) {
    await upsertDiscordChatChannel(channel);
  }
  return loadPersistedChatChannels();
}

export async function syncDiscordChatMessages(channelId: string) {
  await ensureDiscordBot();
  if (!runtime.client) throw new Error('Discord bot is not connected.');
  const channel = await runtime.client.channels.fetch(channelId);
  if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type) || !channel.isTextBased()) {
    throw new Error('Choose an available Discord text channel.');
  }
  const channelName = 'name' in channel && typeof channel.name === 'string' ? channel.name : '';
  if (!channelName) throw new Error('Discord channel name is unavailable.');
  const guild = 'guild' in channel ? channel.guild : null;
  if (!guild) throw new Error('Discord server not found.');
  const channelType = channel.type === ChannelType.GuildAnnouncement ? 'announcement' : 'text';
  await upsertDiscordChatChannel({
    id: channel.id,
    guildId: guild.id,
    guildName: guild.name,
    name: channelName,
    type: channelType,
  });

  const messages = await channel.messages.fetch({ limit: 50 });
  for (const message of messages.values()) {
    await persistDiscordChatMessage(toDiscordChatMessage(message, {
      id: channel.id,
      guildId: guild.id,
      guildName: guild.name,
      name: channelName,
    }));
  }
  return loadPersistedChatMessages(channelId);
}

export async function sendDiscordChatMessage(channelId: string, content: string) {
  await ensureDiscordBot();
  if (!runtime.client) throw new Error('Discord bot is not connected.');
  const channel = await runtime.client.channels.fetch(channelId);
  if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type) || !channel.isTextBased()) {
    throw new Error('Choose an available Discord text channel.');
  }
  const channelName = 'name' in channel && typeof channel.name === 'string' ? channel.name : '';
  if (!channelName) throw new Error('Discord channel name is unavailable.');
  const guild = 'guild' in channel ? channel.guild : null;
  if (!guild) throw new Error('Discord server not found.');
  await upsertDiscordChatChannel({
    id: channel.id,
    guildId: guild.id,
    guildName: guild.name,
    name: channelName,
    type: channel.type === ChannelType.GuildAnnouncement ? 'announcement' : 'text',
  });
  const sent = await (channel as SendableChannels).send({ content });
  const chatMessage = toDiscordChatMessage(sent, {
    id: channel.id,
      guildId: guild.id,
    guildName: guild.name,
    name: channelName,
  });
  await persistDiscordChatMessage(chatMessage);
  return chatMessage;
}

async function upsertDiscordChatChannel(channel: {
  id: string;
  guildId: string;
  guildName: string;
  name: string;
  type?: 'text' | 'announcement';
}) {
  await query(
    `INSERT INTO lscm_discord_chat_channels
      (id, guild_id, guild_name, name, channel_type, updated_at)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       guild_id = EXCLUDED.guild_id,
       guild_name = EXCLUDED.guild_name,
       name = EXCLUDED.name,
       channel_type = EXCLUDED.channel_type,
       updated_at = CURRENT_TIMESTAMP`,
    [channel.id, channel.guildId, channel.guildName, channel.name, channel.type || 'text'],
  );
}

async function loadPersistedChatChannels(): Promise<DiscordChatChannel[]> {
  const result = await query<{
    id: string;
    guild_id: string;
    guild_name: string;
    name: string;
    channel_type: 'text' | 'announcement';
    message_count: number;
    updated_at: string;
  }>(
    `SELECT c.id, c.guild_id, c.guild_name, c.name, c.channel_type,
            COUNT(m.id)::int AS message_count, c.updated_at
     FROM lscm_discord_chat_channels c
     LEFT JOIN lscm_discord_chat_messages m ON m.channel_id = c.id
     GROUP BY c.id
     ORDER BY c.guild_name, c.name`,
  );
  return result.rows.map(row => ({
    id: row.id,
    guildId: row.guild_id,
    guildName: row.guild_name,
    name: row.name,
    type: row.channel_type,
    messageCount: Number(row.message_count),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

async function loadPersistedChatMessages(channelId: string): Promise<DiscordChatMessage[]> {
  const result = await query<{
    id: string;
    channel_id: string;
    guild_id: string;
    guild_name: string;
    channel_name: string;
    author_id: string;
    author_name: string;
    author_username: string;
    author_avatar_url: string;
    content: string;
    is_bot: boolean;
    created_at: string;
  }>(
    `SELECT id, channel_id, guild_id, guild_name, channel_name, author_id, author_name,
            author_username, author_avatar_url, content, is_bot, created_at
     FROM lscm_discord_chat_messages
     WHERE channel_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [channelId],
  );
  return result.rows.reverse().map(row => ({
    id: row.id,
    channelId: row.channel_id,
    guildId: row.guild_id,
    guildName: row.guild_name,
    channelName: row.channel_name,
    authorId: row.author_id,
    authorName: row.author_name,
    authorUsername: row.author_username,
    authorAvatarUrl: row.author_avatar_url,
    content: row.content,
    isBot: row.is_bot,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

async function persistDiscordChatMessage(message: DiscordChatMessage) {
  await query(
    `INSERT INTO lscm_discord_chat_messages
      (id, channel_id, guild_id, guild_name, channel_name, author_id, author_name,
       author_username, author_avatar_url, content, is_bot, created_at, fetched_at)
     SELECT $1, c.id, $2, $3, c.name, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP
     FROM lscm_discord_chat_channels c
     WHERE c.id = $11
     ON CONFLICT (id) DO UPDATE SET
       author_name = EXCLUDED.author_name,
       author_username = EXCLUDED.author_username,
       author_avatar_url = EXCLUDED.author_avatar_url,
       content = EXCLUDED.content,
       is_bot = EXCLUDED.is_bot,
       fetched_at = CURRENT_TIMESTAMP`,
    [
      message.id,
      message.guildId,
      message.guildName,
      message.authorId,
      message.authorName,
      message.authorUsername,
      message.authorAvatarUrl,
      message.content,
      message.isBot,
      message.createdAt,
      message.channelId,
    ],
  );
}

function toDiscordChatMessage(message: Message, channel: { id: string; guildId: string; guildName: string; name: string }): DiscordChatMessage {
  return {
    id: message.id,
    channelId: channel.id,
    guildId: channel.guildId,
    guildName: channel.guildName,
    channelName: channel.name,
    authorId: message.author.id,
    authorName: message.member?.displayName || message.author.globalName || message.author.username,
    authorUsername: message.author.username,
    authorAvatarUrl: message.author.displayAvatarURL({ extension: 'png', size: 96 }),
    content: message.content || (message.attachments.size ? `[${message.attachments.size} attachment${message.attachments.size === 1 ? '' : 's'}]` : '[non-text message]'),
    isBot: message.author.bot,
    createdAt: message.createdAt.toISOString(),
  };
}

export async function getDiscordModeratorSnapshot(forceRefresh = false): Promise<DiscordModeratorSnapshot> {
  if (!forceRefresh && runtime.moderatorSnapshot && Date.now() - runtime.moderatorSnapshotAt < 30000) {
    return runtime.moderatorSnapshot;
  }
  if (!forceRefresh) {
    const persistedSnapshot = await loadPersistedModeratorSnapshot();
    if (persistedSnapshot) {
      runtime.moderatorSnapshot = persistedSnapshot;
      runtime.moderatorSnapshotAt = Date.now();
      return persistedSnapshot;
    }
  }

  await ensureDiscordBot();
  if (!runtime.client) throw new Error('Discord bot is not connected.');

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
  await persistModeratorSnapshot(snapshot);
  runtime.moderatorSnapshot = snapshot;
  runtime.moderatorSnapshotAt = Date.now();
  return snapshot;
}

async function loadPersistedModeratorSnapshot(): Promise<DiscordModeratorSnapshot | null> {
  const result = await query<{ snapshot: DiscordModeratorSnapshot }>(
    `SELECT snapshot
     FROM lscm_discord_moderator_scans
     ORDER BY generated_at DESC
     LIMIT 1`,
  );
  const snapshot = result.rows[0]?.snapshot;
  if (!snapshot || !Array.isArray(snapshot.members) || !Array.isArray(snapshot.channels) || !Array.isArray(snapshot.activity)) {
    return null;
  }
  return snapshot;
}

async function persistModeratorSnapshot(snapshot: DiscordModeratorSnapshot) {
  await query(
    `INSERT INTO lscm_discord_moderator_scans (generated_at, snapshot)
     VALUES ($1, $2::jsonb)`,
    [snapshot.generatedAt, JSON.stringify(snapshot)],
  );
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