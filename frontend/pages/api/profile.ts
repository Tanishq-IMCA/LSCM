import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { query } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });

    if (req.method === 'GET') return res.status(200).json({ success: true, user });
    if (req.method !== 'PATCH') return res.status(405).json({ success: false, message: 'Method not allowed.' });

    const profile = (req.body?.profile || req.body || {}) as Record<string, unknown>;
    const displayName = String(profile.fullName ?? profile.displayName ?? user.displayName).trim().slice(0, 80);
    const bio = String(profile.bio ?? user.bio).trim().slice(0, 500);
    const rockstarTag = String(profile.rockstarTag ?? profile.rockstarUsername ?? user.rockstarTag).trim().slice(0, 80);
    if (displayName.length < 2) return res.status(400).json({ success: false, message: 'Display name must be at least 2 characters.' });

    const result = await query(
      `UPDATE lscm_users
       SET display_name = $1, bio = $2, rockstar_tag = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, display_name, bio, rockstar_tag, created_at`,
      [displayName, bio, rockstarTag, user.id],
    );
    return res.status(200).json({ success: true, user: result.rows[0] ? {
      id: String(result.rows[0].id),
      email: String(result.rows[0].email),
      displayName: String(result.rows[0].display_name),
      bio: String(result.rows[0].bio || ''),
      rockstarTag: String(result.rows[0].rockstar_tag || ''),
      createdAt: new Date(String(result.rows[0].created_at)).toISOString(),
    } : user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Profile request failed.';
    return res.status(500).json({ success: false, message });
  }
}