import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getProfile, signOut as authSignOut } from '../lib/auth';

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  role: string | null;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAILS = ['aebon@kakao.com', 'aebon@kyonggi.ac.kr', 'hohai7115@daum.net'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser: User) => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    const p = await getProfile(authUser.id);
    setProfile(p as UserProfile | null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadProfile(u);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const handleSignOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  const isAdmin = !!(user?.email && ADMIN_EMAILS.includes(user.email));
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isLoggedIn,
      isAdmin,
      signOut: handleSignOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
