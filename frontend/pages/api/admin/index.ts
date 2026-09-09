import type { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@/server/auth';
import { isAdminUser } from '@/server/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed.' });

  const user = await currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
  if (!isAdminUser(user)) return res.status(403).json({ success: false, message: 'Admin access required.' });

  return res.status(200).json({ success: true, panel: 'empty' });
}