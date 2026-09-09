import type { NextApiRequest, NextApiResponse } from 'next';
import { changePassword, clearSession, currentUser, login, logout, register, resetPassword } from '@/server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const action = String(req.query.action || '');

  try {
    if (action === 'register' && req.method === 'POST') {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const password = String(req.body?.password || '');
      if (!email || password.length < 8) {
        return res.status(400).json({ success: false, message: 'Use a valid email and a password of at least 8 characters.' });
      }
      const user = await register(email, password, res);
      return res.status(201).json({ success: true, user });
    }

    if (action === 'login' && req.method === 'POST') {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const password = String(req.body?.password || '');
      const user = await login(email, password, res);
      return res.status(200).json({ success: true, user });
    }

    if (action === 'logout' && req.method === 'POST') {
      await logout(req, res);
      return res.status(200).json({ success: true });
    }

    if (action === 'me' && req.method === 'GET') {
      const user = await currentUser(req);
      return res.status(200).json({ success: Boolean(user), user });
    }

    if (action === 'password' && req.method === 'PATCH') {
      const user = await currentUser(req);
      if (!user) return res.status(401).json({ success: false, message: 'Sign in required.' });
      const lastPassword = String(req.body?.lastPassword || '');
      const newPassword = String(req.body?.newPassword || '');
      if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
      await changePassword(user.id, lastPassword, newPassword);
      return res.status(200).json({ success: true });
    }

    if (action === 'reset-password' && req.method === 'POST') {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const lastPassword = String(req.body?.lastPassword || '');
      const newPassword = String(req.body?.newPassword || '');
      if (!email || newPassword.length < 8) return res.status(400).json({ success: false, message: 'Use a valid email and a new password of at least 8 characters.' });
      const user = await resetPassword(email, lastPassword, newPassword, res);
      return res.status(200).json({ success: true, user });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === '23505') return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
    const message = error instanceof Error ? error.message : 'Authentication failed.';
    if (action === 'me') clearSession(res);
    return res.status(action === 'login' ? 401 : 400).json({ success: false, message });
  }
}