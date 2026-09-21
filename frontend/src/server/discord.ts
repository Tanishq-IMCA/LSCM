import { ActivityType, ChannelType, Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import type { ColorResolvable } from 'discord.js';
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

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
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

  await channel.send({ embeds: [embed] });
}

function resolveDiscordAssetUrl(value: string, assetOrigin: string) {
  if (!value) return '';
  try {
    return value.startsWith('/') ? new URL(value, assetOrigin).toString() : new URL(value).toString();
  } catch {
    return '';
  }
}