import { createHmac, randomBytes, scryptSync, timingSafeEqual, randomUUID } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from './db';
import { isAdminEmail } from './admin';

export const SESSION_COOKIE = 'lscm_session';
const SESSION_DAYS = 30;

export type StoredUser = {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  rockstarTag: string;
  role: 'admin' | 'user';
  createdAt: string;
};

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

function passwordFingerprint(password: string) {
  const key = process.env.SESSION_SECRET || 'lscm-dev-only-fingerprint-key';
  return JSON.stringify({
    length: password.length,
    hashes: Array.from(password).map((character, index) =>
      createHmac('sha256', key).update(`${index}:${character}`).digest('hex'),
    ),
  });
}

function matchesRememberedPassword(password: string, row: { password_hash: string; password_fingerprint?: string | null }) {
  if (verifyPassword(password, row.password_hash)) return true;
  if (!row.password_fingerprint) return false;
  try {
    const stored = JSON.parse(row.password_fingerprint) as { length?: number; hashes?: string[] };
    if (!Array.isArray(stored.hashes) || !stored.hashes.length) return false;
    const key = process.env.SESSION_SECRET || 'lscm-dev-only-fingerprint-key';
    const candidate = Array.from(password);
    const matches = candidate.reduce((count, character, index) => {
      const digest = createHmac('sha256', key).update(`${index}:${character}`).digest('hex');
      return count + (stored.hashes?.[index] === digest ? 1 : 0);
    }, 0);
    return matches / Math.max(stored.length || stored.hashes.length, candidate.length) >= 0.6;
  } catch {
    return false;
  }
}

function cookieValue(value: string, maxAge: number) {
  return [
    `${SESSION_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

export function clearSession(res: NextApiResponse) {
  res.setHeader('Set-Cookie', cookieValue('', 0));
}

export function setSession(res: NextApiResponse, sessionId: string) {
  res.setHeader('Set-Cookie', cookieValue(sessionId, SESSION_DAYS * 24 * 60 * 60));
}

export function getSessionId(req: NextApiRequest) {
  const raw = req.headers.cookie || '';
  const match = raw.split(';').map(part => part.trim()).find(part => part.startsWith(`${SESSION_COOKIE}=`));
  return match?.slice(`${SESSION_COOKIE}=`.length) || null;
}

export function toUser(row: Record<string, unknown>): StoredUser {
  const email = String(row.email || '').trim().toLowerCase();
  return {
    id: String(row.id),
    email,
    displayName: String(row.display_name || ''),
    bio: String(row.bio || ''),
    rockstarTag: String(row.rockstar_tag || ''),
    role: isAdminEmail(email) && String(row.role || 'user') === 'admin' ? 'admin' : 'user',
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export async function createSession(userId: string, res: NextApiResponse) {
  const id = randomUUID();
  await query(
    `INSERT INTO lscm_sessions (id, user_id, expires_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '30 days')`,
    [id, userId],
  );
  setSession(res, id);
}

export async function currentUser(req: NextApiRequest) {
  const sessionId = getSessionId(req);
  if (!sessionId) return null;
  const result = await query(
    `SELECT u.id, u.email, u.display_name, u.bio, u.rockstar_tag, u.role, u.created_at
     FROM lscm_sessions s
     JOIN lscm_users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
    [sessionId],
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function register(email: string, password: string, res: NextApiResponse) {
  const id = randomUUID();
  const result = await query(
    `INSERT INTO lscm_users (id, email, password_hash, password_fingerprint, display_name, role)
     VALUES ($1, $2, $3, $4, $5, 'user')
     RETURNING id, email, display_name, bio, rockstar_tag, role, created_at`,
    [id, email, hashPassword(password), passwordFingerprint(password), email.split('@')[0] || 'LSCM Member'],
  );
  const user = toUser(result.rows[0]);
  await createSession(user.id, res);
  return user;
}

export async function login(email: string, password: string, res: NextApiResponse) {
  const result = await query(
    `SELECT id, email, password_hash, display_name, bio, rockstar_tag, role, created_at
     FROM lscm_users WHERE email = $1`,
    [email],
  );
  const row = result.rows[0];
  if (!row || !verifyPassword(password, String(row.password_hash))) {
    throw new Error('Invalid email or password.');
  }
  const user = toUser(row);
  await createSession(user.id, res);
  return user;
}

export async function changePassword(userId: string, lastPassword: string, newPassword: string) {
  const result = await query<{ password_hash: string; password_fingerprint: string | null }>(
    'SELECT password_hash, password_fingerprint FROM lscm_users WHERE id = $1',
    [userId],
  );
  const row = result.rows[0];
  if (!row || !matchesRememberedPassword(lastPassword, row)) throw new Error('That password does not match closely enough.');
  await query(
    'UPDATE lscm_users SET password_hash = $1, password_fingerprint = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [hashPassword(newPassword), passwordFingerprint(newPassword), userId],
  );
}

export async function resetPassword(email: string, lastPassword: string, newPassword: string, res: NextApiResponse) {
  const result = await query<StoredUser & { password_hash: string; password_fingerprint: string | null }>(
    `SELECT id, email, password_hash, password_fingerprint, display_name, bio, rockstar_tag, role, created_at
     FROM lscm_users WHERE email = $1`,
    [email],
  );
  const row = result.rows[0];
  if (!row || !matchesRememberedPassword(lastPassword, row)) throw new Error('That password does not match closely enough.');
  await query(
    'UPDATE lscm_users SET password_hash = $1, password_fingerprint = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [hashPassword(newPassword), passwordFingerprint(newPassword), row.id],
  );
  const user = toUser(row);
  await createSession(user.id, res);
  return user;
}

export async function logout(req: NextApiRequest, res: NextApiResponse) {
  const sessionId = getSessionId(req);
  if (sessionId) await query('DELETE FROM lscm_sessions WHERE id = $1', [sessionId]);
  clearSession(res);
}