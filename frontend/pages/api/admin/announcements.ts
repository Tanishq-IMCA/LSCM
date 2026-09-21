import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';
import { query } from '@/server/db';
import {
  getDiscordChannels,
  sendDiscordAnnouncement,
  type DiscordAnnouncementPayload,
} from '@/server/discord';

const MAX_HISTORY = 30;
const ASSET_VALUES = new Set([
  '',
  '/logo-dark-semi-colourised.png',
  '/lscmgeneric-banner.png',
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  if (!isAdminUser(user)) return res.status(403).json({ success: false, message: 'Admin access required.' });

  if (req.method === 'GET') {
    try {
      const channels = await getDiscordChannels();
      const history = await query(
        `SELECT id, channel_id, channel_name, payload, created_at
         FROM lscm_discord_announcements
         ORDER BY created_at DESC
         LIMIT ${MAX_HISTORY}`,
      );
      return res.status(200).json({ success: true, channels, history: history.rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Could not load Discord announcement data.' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' });

  const payload = normalizePayload(req.body || {});
  if (!payload) return res.status(400).json({ success: false, message: 'Complete the announcement fields with valid values.' });

  try {
    const channels = await getDiscordChannels();
    const selectedChannel = channels.find(channel => channel.id === payload.channelId);
    if (!selectedChannel) return res.status(400).json({ success: false, message: 'Choose an available Discord channel.' });

    await sendDiscordAnnouncement(payload, getRequestOrigin(req));
    await query(
      `INSERT INTO lscm_discord_announcements
        (created_by_user_id, channel_id, channel_name, payload)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [user.id, payload.channelId, `${selectedChannel.guildName} / #${selectedChannel.name}`, JSON.stringify(payload)],
    );
    return res.status(200).json({ success: true, message: 'Announcement sent.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Could not send announcement.' });
  }
}

function normalizePayload(body: Record<string, unknown>): DiscordAnnouncementPayload | null {
  const read = (key: keyof DiscordAnnouncementPayload, max: number) => String(body[key] || '').trim().slice(0, max);
  const channelId = read('channelId', 64);
  const payload: DiscordAnnouncementPayload = {
    channelId,
    header: read('header', 256),
    iconUrl: read('iconUrl', 512),
    title: read('title', 256),
    description: read('description', 4000),
    footer: read('footer', 256),
    imageUrl: read('imageUrl', 512),
    color: read('color', 7),
    footerIconUrl: read('footerIconUrl', 512),
  };
  if (!payload.channelId || !payload.title || !payload.description) return null;
  if (!/^#[0-9a-fA-F]{6}$/.test(payload.color)) return null;
  if (!isAllowedImageValue(payload.iconUrl) || !isAllowedImageValue(payload.imageUrl) || !isAllowedImageValue(payload.footerIconUrl)) return null;
  return payload;
}

function isAllowedImageValue(value: string) {
  if (ASSET_VALUES.has(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function getRequestOrigin(req: NextApiRequest) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000').split(',')[0];
  const localHost = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host);
  if (localHost && process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return `${forwardedProto}://${host}`;
}