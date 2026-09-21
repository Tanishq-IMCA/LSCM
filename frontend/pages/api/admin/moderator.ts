import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import {
  discordMutationAllowed,
  getDiscordModeratorSnapshot,
  moderateDiscordMember,
  type DiscordModeratorAction,
} from '@/server/discord';

const ACTIONS = new Set<DiscordModeratorAction>(['mute', 'unmute', 'nickname', 'ban']);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  if (!isAdminUser(user)) return res.status(403).json({ success: false, message: 'Admin access required.' });

  if (req.method === 'GET') {
    try {
      const snapshot = await getDiscordModeratorSnapshot(String(req.query.refresh || '') === '1');
      return res.status(200).json({ success: true, snapshot });
    } catch (error) {
      return res.status(503).json({ success: false, message: error instanceof Error ? error.message : 'Could not load Discord moderation data.' });
    }
  }

  if (req.method !== 'PATCH') return res.status(405).json({ success: false, message: 'Method not allowed.' });
  const body = (req.body || {}) as Record<string, unknown>;
  const guildId = String(body.guildId || '').trim();
  const memberId = String(body.memberId || '').trim();
  const action = String(body.action || '') as DiscordModeratorAction;
  if (!guildId || !memberId || !ACTIONS.has(action)) {
    return res.status(400).json({ success: false, message: 'Invalid moderation request.' });
  }

  const cooldown = discordMutationAllowed();
  if (!cooldown.allowed) {
    return res.status(429).json({
      success: false,
      message: `Wait ${Math.ceil(cooldown.retryAfter / 1000)} seconds before using another moderation action.`,
      retryAfter: cooldown.retryAfter,
    });
  }

  try {
    const message = await moderateDiscordMember({
      guildId,
      memberId,
      action,
      nickname: String(body.nickname || ''),
      muteMinutes: Number(body.muteMinutes) || 60,
    });
    const snapshot = await getDiscordModeratorSnapshot(true);
    return res.status(200).json({ success: true, message, snapshot });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Moderation action failed.' });
  }
}