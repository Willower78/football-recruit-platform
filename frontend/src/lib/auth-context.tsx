'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, tokenStore } from './api';

export interface AuthUser {
  id: string;
  email: string;
  role: 'player' | 'club' | 'scout' | 'admin';
  playerProfile?: unknown;
  clubProfile?: unknown;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login(email: string, password: string): Promise<AuthUser>;
  register(input: {
    email: string;
    password: string;
    role: 'player' | 'club';
    name: string;
    acceptTerms?: boolean;
  }): Promise<AuthUser>;
  logout(): void;
  refresh(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    if (!tokenStore.access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api<AuthUser>('/auth/me');
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback<AuthContextValue['login']>(async (email, password) => {
    const res = await api<{ user: AuthUser; accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      },
    );
    tokenStore.set({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback<AuthContextValue['register']>(async (input) => {
    const res = await api<{ user: AuthUser; accessToken: string; refreshToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(input),
        skipAuth: true,
      },
    );
    tokenStore.set({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
