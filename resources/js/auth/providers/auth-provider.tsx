import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/services/api';
import { AuthContext } from '../context/auth-context';
import type { User } from '../lib/models';
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
} from '../lib/helpers';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/admin/login', { email, password });
    setStoredToken(data.token);
    setStoredUser(data.user);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/admin/logout');
    } catch {
      // Ignore errors — clear local state regardless
    } finally {
      removeStoredToken();
      removeStoredUser();
      setToken(null);
      setUser(null);
    }
  }, []);

  const verify = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const { data } = await api.get('/admin/me');
      setUser(data.user ?? data);
      setToken(storedToken);
    } catch {
      removeStoredToken();
      removeStoredUser();
      setUser(null);
      setToken(null);
    }
  }, []);

  // Verify token on mount
  useEffect(() => {
    verify().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      logout,
      verify,
      setLoading,
    }),
    [user, token, isLoading, isAuthenticated, login, logout, verify, setLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
