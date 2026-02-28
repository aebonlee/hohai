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

    // ─── 가입 사이트 자동 추적 (visited_sites) ───
    try {
      const { data: statusData } = await supabase.rpc('check_user_status', {
        target_user_id: authUser.id,
        current_domain: window.location.hostname,
      });

      // 차단/탈퇴 유저 강제 로그아웃
      if (statusData && statusData.status && statusData.status !== 'active') {
        console.warn('계정 상태:', statusData.status, statusData.reason);
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        return;
      }
    } catch (e) {
      // check_user_status 함수 미존재 시 무시 (구버전 호환)
      console.warn('check_user_status 호출 실패:', (e as Error).message);
    }
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
