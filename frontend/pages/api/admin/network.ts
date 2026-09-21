import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import {
  discordMutationAllowed,
  ensureDiscordBot,
  getDiscordBotState,
  updateDiscordBot,
  type DiscordActivity,
  type DiscordStatus,
} from '@/server/discord';

const STATUS_TYPES = new Set<DiscordStatus>(['online', 'idle', 'dnd', 'invisible']);
const ACTIVITY_TYPES = new Set<DiscordActivity>(['playing', 'listening', 'watching', 'competing']);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  if (!isAdminUser(user)) return res.status(403).json({ success: false, message: 'Admin access required.' });

  await ensureDiscordBot();
  if (req.method === 'GET') return res.status(200).json({ success: true, state: getDiscordBotState() });
  if (req.method !== 'PATCH') return res.status(405).json({ success: false, message: 'Method not allowed.' });

  const cooldown = discordMutationAllowed();
  if (!cooldown.allowed) {
    return res.status(429).json({
      success: false,
      message: `Wait ${Math.ceil(cooldown.retryAfter / 1000)} seconds before updating the bot again.`,
      retryAfter: cooldown.retryAfter,
    });
  }

  const body = (req.body || {}) as Record<string, unknown>;
  const statusType = body.statusType === undefined ? undefined : String(body.statusType) as DiscordStatus;
  const activityType = body.activityType === undefined ? undefined : String(body.activityType) as DiscordActivity;
  if (statusType && !STATUS_TYPES.has(statusType)) return res.status(400).json({ success: false, message: 'Invalid status type.' });
  if (activityType && !ACTIVITY_TYPES.has(activityType)) return res.status(400).json({ success: false, message: 'Invalid activity type.' });

  const state = await updateDiscordBot({
    enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
    statusType,
    activityType,
    statusDescription: body.statusDescription === undefined ? undefined : String(body.statusDescription),
    activityTitle: body.activityTitle === undefined ? undefined : String(body.activityTitle),
  });
  return res.status(200).json({ success: true, state });
}