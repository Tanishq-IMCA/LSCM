'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@/types';
import { getCurrentUser, loginUser, logoutUser, registerUser, saveProfile } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  loginWithGoogle: () => void;
  loginWithGithub: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeBackendUser(raw: Record<string, unknown>): User {
  const profile = (raw.profile as Record<string, unknown>) || raw;
  const dev = (raw.developer as Record<string, unknown>) || {};
  const github = (dev.github as Record<string, unknown>) || {};
  return {
    id: String(raw._id || raw.id || ''),
    name: String(raw.displayName || profile.fullName || raw.email?.toString().split('@')[0] || 'User'),
    email: String(raw.email || ''),
    age: profile.age ? Number(profile.age) : undefined,
    occupation: (profile.role as User['occupation']) || 'professional',
    techStack: (dev.techStack as string[]) || [],
    education: ((dev.education as unknown[]) || []).filter(Boolean) as User['education'],
    projects: ((dev.projects as unknown[]) || []).filter(Boolean) as User['projects'],
    githubUsername: (github.username as string) || undefined,
    rockstarTag: String(raw.rockstarTag || profile.rockstarTag || ''),
    avatarUrl: (profile.avatar as string) || undefined,
    bio: (profile.bio as string) || undefined,
    role: (raw.role as string) || 'user',
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
  };
}

function createPreviewUser(email: string): User {
  const localPart = email.split('@')[0] || 'developer';
  const name = localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Developer';

  return {
    id: 'preview-user',
    name,
    email,
    occupation: 'professional',
    techStack: ['Python', 'TypeScript', 'React'],
    education: [],
    projects: [],
    githubUsername: 'demo-developer',
    role: 'user',
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    getCurrentUser()
      .then(result => {
        const user = result.success && result.user ? normalizeBackendUser(result.user) : null;
        setState({ user, isAuthenticated: Boolean(user), isLoading: false });
      })
      .catch(() => setState({ user: null, isAuthenticated: false, isLoading: false }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser({ email, password });
    if (!result.success) throw new Error('Invalid email or password.');
    const user = normalizeBackendUser(result.user);
    setState({ user, isAuthenticated: true, isLoading: false });
    return user;
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const result = await registerUser({ email, password });
    if (!result.success) throw new Error('Account creation failed.');
    const user = normalizeBackendUser(result.user);
    setState({ user, isAuthenticated: true, isLoading: false });
    return user;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser().catch(() => undefined);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(s => {
      if (!s.user) return s;
      const updated = { ...s.user, ...updates };
      void saveProfile({
        profile: {
          fullName: updated.name,
          bio: updated.bio || '',
          rockstarTag: updated.rockstarTag || '',
        },
      });
      return { ...s, user: updated };
    });
  }, []);

  const loginWithGoogle = useCallback(() => undefined, []);
  const loginWithGithub = useCallback(() => undefined, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        loginWithGoogle,
        loginWithGithub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
