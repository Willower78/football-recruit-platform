'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, type AuthResponse, type AuthUser } from '@/lib/api';

const REFRESH_STORAGE_KEY = 'frp.refresh_token';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (body: {
    email: string;
    password: string;
    role: 'player' | 'club';
    full_name?: string;
    club_name?: string;
    accept_terms?: boolean;
    accept_privacy?: boolean;
  }) => Promise<AuthResponse>;
  logout: () => void;
  refresh: () => Promise<AuthResponse | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAuth = useCallback((res: AuthResponse) => {
    setUser(res.user);
    setAccessToken(res.access_token);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(REFRESH_STORAGE_KEY, res.refresh_token);
    }
  }, []);

  const refresh = useCallback(async (): Promise<AuthResponse | null> => {
    if (typeof window === 'undefined') return null;
    const refresh_token = window.localStorage.getItem(REFRESH_STORAGE_KEY);
    if (!refresh_token) return null;
    try {
      const res = await api<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token }),
      });
      applyAuth(res);
      return res;
    } catch {
      window.localStorage.removeItem(REFRESH_STORAGE_KEY);
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, [applyAuth]);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      applyAuth(res);
      return res;
    },
    [applyAuth],
  );

  const register = useCallback<AuthContextValue['register']>(
    async (body) => {
      const res = await api<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      applyAuth(res);
      return res;
    },
    [applyAuth],
  );

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(REFRESH_STORAGE_KEY);
    }
    router.push('/');
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, loading, login, register, logout, refresh }),
    [user, accessToken, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
