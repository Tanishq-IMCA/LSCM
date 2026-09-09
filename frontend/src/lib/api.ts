'use client';

import { mockNeuralSearchScan, mockRepos, mockUser } from './libPreviewData';

const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
const PREVIEW_MODE = false;

function previewPayload(path: string, options?: RequestInit): unknown {
  const method = options?.method || 'GET';
  const deterministicResults = {
    securityScore: mockNeuralSearchScan.securityScore,
    codeQualityScore: mockNeuralSearchScan.codeQualityScore,
    architectureScore: mockNeuralSearchScan.architectureScore,
    skillAssessment: mockNeuralSearchScan.skillAssessment,
    metrics: mockNeuralSearchScan.metrics,
    dependencies: mockNeuralSearchScan.dependencies,
    codeSmells: mockNeuralSearchScan.codeSmells,
  };

  if (path === '/api/auth/login' || path === '/api/auth/register') {
    return { success: true, user: mockUser };
  }
  if (path === '/api/auth/logout') return { success: true };
  if (path === '/api/auth/me') return { success: false, user: null };
  if (path === '/api/profile' && method === 'GET') {
    return {
      success: true,
      user: {
        profile: { fullName: mockUser.name, role: mockUser.occupation, preferences: {} },
        developer: { techStack: mockUser.techStack, github: { username: mockUser.githubUsername } },
      },
    };
  }
  if (path === '/api/profile') return { success: true, user: mockUser };
  if (path === '/api/githubpull/repositories') return { success: true, repositories: mockRepos };
  if (path.startsWith('/api/analysis/latest')) {
    return { success: true, analysis: { status: 'completed', deterministicResults } };
  }
  if (path === '/api/analysis/ratelimit') {
    return { success: true, scansUsed: 0, scansAllowed: 3, canScan: true, resetAt: null };
  }
  if (path === '/api/analysis/tools/status') {
    return { success: true, tools: { semgrep: true, bandit: true, ruff: true, eslint: true, lizard: true } };
  }
  if (path === '/api/analysis' || path.startsWith('/api/analysis/')) {
    return {
      success: true,
      analysis: { _id: 'preview-analysis', status: 'completed', deterministicResults },
    };
  }
  if (path === '/api/auth/github/unlink') return { success: true, message: 'GitHub disconnected' };
  return { success: true };
}

// Access tokens are short-lived. Rather than let every mid-session request fail
// with "Invalid or expired access token", we transparently refresh once and
// retry the original request. Concurrent 401s share a single in-flight
// refresh call so we don't hammer the refresh endpoint.
let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  _isRetry = false
): Promise<T> {
  if (PREVIEW_MODE) {
    return previewPayload(path, options) as T;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (response.status === 401 && !_isRetry && path !== '/api/auth/refresh' && path !== '/api/auth/login') {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return apiFetch<T>(path, options, true);
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET' });
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

// ── Auth ────────────────────────────────────────────────────────────────────
export async function registerUser(body: { email: string; password: string }) {
  return apiPost<{ success: boolean; user: Record<string, unknown> }>('/api/auth/register', body);
}

export async function loginUser(body: { email: string; password: string }) {
  return apiPost<{ success: boolean; user: Record<string, unknown> }>('/api/auth/login', body);
}

export async function logoutUser() {
  return apiPost<{ success: boolean }>('/api/auth/logout', {});
}

export async function changePassword(body: { lastPassword: string; newPassword: string }) {
  return apiPatch<{ success: boolean }>('/api/auth/password', body);
}

export async function resetPassword(body: { email: string; lastPassword: string; newPassword: string }) {
  return apiPost<{ success: boolean; user: Record<string, unknown> }>('/api/auth/reset-password', body);
}

export async function deleteAccount(body: { password: string }) {
  return apiFetch<{ success: boolean }>('/api/auth/account', {
    method: 'DELETE',
    body: JSON.stringify(body),
  });
}

export async function getCurrentUser() {
  return apiGet<{ success: boolean; user: Record<string, unknown> }>('/api/auth/me');
}

// ── Profile ─────────────────────────────────────────────────────────────────
export async function getProfile() {
  return apiGet<{ success: boolean; user: Record<string, unknown> }>('/api/profile');
}

export async function saveProfile(body: Record<string, unknown>) {
  return apiPatch<{ success: boolean; user: Record<string, unknown> }>('/api/profile', body);
}

// ── Store cart and requests ────────────────────────────────────────────────
export type CartItem = {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  unitPrice: number;
  imagePath: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type RequestedItem = CartItem & {
  status: string;
  orderNumber?: string;
};

export async function getCart() {
  return apiGet<{ success: boolean; items: CartItem[]; totalQuantity: number; totalPrice: number }>('/api/cart');
}

export async function addCartItem(body: {
  productCode: string;
  productName: string;
  category: string;
  unitPrice: number;
  imagePath?: string;
}) {
  return apiPost<{ success: boolean; items: CartItem[]; totalQuantity: number; totalPrice: number }>('/api/cart', body);
}

export async function updateCartItem(id: string, quantity: number) {
  return apiPatch<{ success: boolean; items: CartItem[]; totalQuantity: number; totalPrice: number }>('/api/cart', { id, quantity });
}

export async function removeCartItem(id: string) {
  return apiFetch<{ success: boolean; items: CartItem[]; totalQuantity: number; totalPrice: number }>(`/api/cart?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function checkoutCart() {
  return apiPost<{ success: boolean; items: RequestedItem[]; message: string }>('/api/requests/checkout', {});
}

export async function getRequestedItems() {
  return apiGet<{ success: boolean; items: RequestedItem[] }>('/api/requests');
}

export async function updateRequestedItem(id: string, quantity: number) {
  return apiPatch<{ success: boolean; item: RequestedItem }>('/api/requests', { id, quantity });
}

export async function removeRequestedItem(id: string) {
  return apiFetch<{ success: boolean }>(`/api/requests?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export type SupportTicket = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string | null;
  queryType: string;
  queryTopic: string;
  status: 'open' | 'closed';
  unreadCount: number;
  typing: boolean;
  updatedAt: string;
  createdAt: string;
};

export type SupportMessage = {
  id: string;
  senderId: string;
  senderRole: 'customer' | 'admin' | 'system';
  body: string;
  deliveredAt: string;
  readAt: string | null;
  createdAt: string;
};

export async function getSupportTickets() {
  return apiGet<{ success: boolean; tickets: SupportTicket[] }>('/api/support');
}

export async function createSupportTicket(body: { queryType: string; queryTopic: string; orderId?: string; message: string }) {
  return apiPost<{ success: boolean; ticketId: string }>('/api/support', body);
}

export async function getSupportTicket(id: string) {
  return apiGet<{ success: boolean; ticket: SupportTicket; messages: SupportMessage[] }>(`/api/support/${encodeURIComponent(id)}`);
}

export async function sendSupportMessage(id: string, message: string) {
  return apiPost<{ success: boolean }>(`/api/support/${encodeURIComponent(id)}`, { message });
}

export async function updateSupportTicket(id: string, body: { action: 'typing' | 'close' | 'reopen'; typing?: boolean; reason?: string }) {
  return apiPatch<{ success: boolean }>(`/api/support/${encodeURIComponent(id)}`, body);
}

export type AdminOrder = RequestedItem & {
  order_number: string;
  product_name?: string;
  display_name: string;
  email: string;
};

export async function getAdminOrders(query = '') {
  return apiGet<{ success: boolean; orders: AdminOrder[] }>(`/api/admin${query ? `?q=${encodeURIComponent(query)}` : ''}`);
}

export async function updateAdminOrder(id: string, status: 'awaiting_approval' | 'approved' | 'finished') {
  return apiPatch<{ success: boolean; order: AdminOrder }>('/api/admin', { id, status });
}

// ── GitHub Repositories ─────────────────────────────────────────────────────
export async function getRepositories() {
  return apiGet<{ success: boolean; repositories: Array<Record<string, unknown>> }>('/api/githubpull/repositories');
}

export async function unlinkGitHub() {
  return apiPost<{ success: boolean; message: string }>('/api/auth/github/unlink', {});
}

// ── Analysis ─────────────────────────────────────────────────────────────────
export async function getLatestAnalysis(fullName: string) {
  return apiGet<{ success: boolean; analysis: Record<string, unknown> }>(`/api/analysis/latest?fullName=${encodeURIComponent(fullName)}`);
}

export async function startAnalysis(body: Record<string, unknown>) {
  return apiPost<{ success: boolean; analysis: Record<string, unknown> }>('/api/analysis', body);
}

export async function getAnalysis(id: string) {
  return apiGet<{ success: boolean; analysis: Record<string, unknown> }>(`/api/analysis/${id}`);
}

export async function listAnalyses() {
  return apiGet<{ success: boolean; analyses: Array<Record<string, unknown>> }>('/api/analysis');
}

export async function getScanRateLimit() {
  return apiGet<{ success: boolean; scansUsed: number; scansAllowed: number; canScan: boolean; resetAt: string | null }>('/api/analysis/ratelimit');
}

export async function getToolsStatus() {
  return apiGet<{ success: boolean; tools: Record<string, boolean> }>('/api/analysis/tools/status');
}
