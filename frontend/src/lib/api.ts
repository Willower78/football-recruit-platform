// Thin client wrapper around the backend REST API. Reads JWT from localStorage
// (client-side only) and automatically retries once after refreshing tokens.

const API_BASE =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type TokenPair = { accessToken: string; refreshToken: string };

const ACCESS_KEY = 'frp.accessToken';
const REFRESH_KEY = 'frp.refreshToken';

export const tokenStore = {
  get access() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: TokenPair) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

async function refreshAccess(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    tokenStore.clear();
    return false;
  }
  const tokens = (await res.json()) as TokenPair;
  tokenStore.set(tokens);
  return true;
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (!init.skipAuth && tokenStore.access) {
    headers.Authorization = `Bearer ${tokenStore.access}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && !init.skipAuth && tokenStore.refresh) {
    const refreshed = await refreshAccess();
    if (refreshed) {
      headers.Authorization = `Bearer ${tokenStore.access}`;
      res = await fetch(`${API_BASE}${path}`, { ...init, headers });
    }
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = (data && (data.message || data.error)) ?? message;
    } catch {
      /* noop */
    }
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
