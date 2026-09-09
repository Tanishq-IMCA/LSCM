import type { StoredUser } from './auth';

const ADMIN_EMAILS = new Set([
  'tanishq.wanderer@gmail.com',
  'redasymalla@gmail.com',
]);

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function isAdminUser(user: StoredUser | null): user is StoredUser {
  return Boolean(user && user.role === 'admin' && isAdminEmail(user.email));
}