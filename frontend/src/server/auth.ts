import { createHmac, randomBytes, scryptSync, timingSafeEqual, randomUUID } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from './db';

export const SESSION_COOKIE = 'lscm_session';
const SESSION_DAYS = 30;

export type StoredUser = {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  rockstarTag: string;
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
  return {
    id: String(row.id),
    email: String(row.email),
    displayName: String(row.display_name || ''),
    bio: String(row.bio || ''),
    rockstarTag: String(row.rockstar_tag || ''),
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
    `SELECT u.id, u.email, u.display_name, u.bio, u.rockstar_tag, u.created_at
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
    `INSERT INTO lscm_users (id, email, password_hash, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, display_name, bio, rockstar_tag, created_at`,
    [id, email, hashPassword(password), email.split('@')[0] || 'LSCM Member'],
  );
  const user = toUser(result.rows[0]);
  await createSession(user.id, res);
  return user;
}

export async function login(email: string, password: string, res: NextApiResponse) {
  const result = await query(
    `SELECT id, email, password_hash, display_name, bio, rockstar_tag, created_at
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

export async function logout(req: NextApiRequest, res: NextApiResponse) {
  const sessionId = getSessionId(req);
  if (sessionId) await query('DELETE FROM lscm_sessions WHERE id = $1', [sessionId]);
  clearSession(res);
}