import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '@/services/authService';

export interface AuthUser {
  userId: string;
  username: string;
  name?: string;
  roles: string[];
  scopes?: string[];
  tenantId: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Best available display name: full name > username */
  displayName: string;
  hasRole: (role: string | string[]) => boolean;
  hasScope: (scope: string | string[]) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadUserFromStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user_data');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      userId: parsed.userId || parsed._id || '',
      username: parsed.username || '',
      name: parsed.name || parsed.full_name || parsed.display_name || parsed.fullName || '',
      roles: parsed.roles || [],
      scopes: parsed.scopes,
      tenantId: parsed.tenantId || 'default',
    };
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => loadUserFromStorage());
  const navigate = useNavigate();

  // Re-sync if localStorage changes (e.g. another tab logs in)
  useEffect(() => {
    const handleStorage = () => setUser(loadUserFromStorage());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    const response = await authService.login({ username, password });
    // Backend returns flat shape: { access_token, roles, scopes, tenantId }
    const raw = response.user ?? response as any;
    const authUser: AuthUser = {
      userId: raw.userId || raw.sub || raw._id || '',
      username: raw.username || username,
      name: raw.name || raw.full_name || raw.display_name || raw.fullName || '',
      roles: raw.roles || [],
      scopes: raw.scopes,
      tenantId: raw.tenantId || 'default',
    };
    setUser(authUser);
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    navigate('/login');
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.some(r => user.roles.includes(r));
    }
    return user.roles.includes(role);
  };

  const hasScope = (scope: string | string[]): boolean => {
    if (!user || !user.scopes) return false;
    if (Array.isArray(scope)) {
      return scope.some(s => user.scopes!.includes(s));
    }
    return user.scopes.includes(scope);
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    displayName: user?.name || user?.username || '',
    hasRole,
    hasScope,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};
