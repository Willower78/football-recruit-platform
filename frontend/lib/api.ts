export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface AuthUser {
  id: string;
  email: string;
  role: 'player' | 'club' | 'scout' | 'admin';
  status: string;
  subscription_plan: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? `Request failed with status ${status}`);
  }
}

export interface ApiOptions extends RequestInit {
  token?: string | null;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: ApiOptions['query']): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = new URL(
    path.startsWith('/') ? path : `/${path}`,
    base + '/',
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.append(key, String(value));
    }
  }
  return url.toString();
}

export async function api<T = unknown>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const { token, query, headers, ...rest } = opts;
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };
  if (rest.body && !(rest.body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: finalHeaders,
  });
  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  if (!res.ok) {
    throw new ApiError(res.status, parsed);
  }
  return parsed as T;
}
