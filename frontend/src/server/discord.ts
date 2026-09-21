import { ActivityType, Client, GatewayIntentBits } from 'discord.js';

export const DISCORD_NETWORK_NAME = 'LSCM NETWORK || IMCA';
export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'invisible';
export type DiscordActivity = 'playing' | 'listening' | 'watching' | 'competing';

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
  username: string;
  connected: boolean;
  lastError: string;
  lastMutationAt: number;
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
  username: '',
  connected: false,
  lastError: '',
  lastMutationAt: 0,
};

if (!global.lscmDiscordRuntime) global.lscmDiscordRuntime = runtime;

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
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    runtime.lastError = 'DISCORD_BOT_TOKEN is not configured.';
    return null;
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  runtime.client = client;
  client.once('ready', readyClient => {
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
    lastError: runtime.lastError,
  };
}

export async function updateDiscordBot(input: {
  enabled?: boolean;
  statusType?: DiscordStatus;
  statusDescription?: string;
  activityType?: DiscordActivity;
  activityTitle?: string;
}) {
  await ensureDiscordBot();
  if (typeof input.enabled === 'boolean') runtime.enabled = input.enabled;
  if (input.statusType) runtime.statusType = input.statusType;
  if (input.statusDescription !== undefined) runtime.statusDescription = input.statusDescription.slice(0, 128);
  if (input.activityType) runtime.activityType = input.activityType;
  if (input.activityTitle !== undefined) runtime.activityTitle = input.activityTitle.slice(0, 128);
  applyPresence();
  return getDiscordBotState();
}

export function discordMutationAllowed() {
  const retryAfter = Math.max(0, 5000 - (Date.now() - runtime.lastMutationAt));
  if (retryAfter > 0) return { allowed: false, retryAfter };
  runtime.lastMutationAt = Date.now();
  return { allowed: true, retryAfter: 0 };
}