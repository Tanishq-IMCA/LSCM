import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import {
  discordMutationAllowed,
  getDiscordBotState,
  getDiscordChatSnapshot,
  sendDiscordChatMessage,
} from '@/server/discord';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  if (!isAdminUser(user)) return res.status(403).json({ success: false, message: 'Admin access required.' });

  if (req.method === 'GET') {
    try {
      const channelId = String(req.query.channelId || '').trim() || undefined;
      const sync = String(req.query.sync || '') === '1';
      const snapshot = await getDiscordChatSnapshot(channelId, sync);
      return res.status(200).json({
        success: true,
        ...snapshot,
        operatorName: user.displayName,
        botUsername: getDiscordBotState().botUsername,
      });
    } catch (error) {
      return res.status(503).json({ success: false, message: error instanceof Error ? error.message : 'Could not load Bot Cockpit.' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' });
  const body = (req.body || {}) as Record<string, unknown>;
  const channelId = String(body.channelId || '').trim();
  const content = String(body.content || '').trim().slice(0, 2000);
  if (!channelId || !content) return res.status(400).json({ success: false, message: 'Choose a channel and write a message.' });

  const cooldown = discordMutationAllowed();
  if (!cooldown.allowed) {
    return res.status(429).json({
      success: false,
      message: `Wait ${Math.ceil(cooldown.retryAfter / 1000)} seconds before sending another message.`,
      retryAfter: cooldown.retryAfter,
    });
  }

  try {
    const sentMessage = await sendDiscordChatMessage(channelId, content);
    const snapshot = await getDiscordChatSnapshot(channelId);
    return res.status(200).json({
      success: true,
      message: 'Message sent.',
      sentMessage,
      ...snapshot,
      operatorName: user.displayName,
      botUsername: getDiscordBotState().botUsername,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Could not send the message.' });
  }
}