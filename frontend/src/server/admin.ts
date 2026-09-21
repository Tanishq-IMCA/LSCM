import type { StoredUser } from './auth';

export function isAdminUser(user: StoredUser | null): user is StoredUser {
  return Boolean(user && user.role.trim().toLowerCase() === 'admin');
}