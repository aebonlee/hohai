/**
 * auth.ts — Supabase Auth 헬퍼 함수 (www 프로젝트와 동일)
 */
import { supabase } from './supabase';

/** Google OAuth 로그인 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) throw error;
  return data;
}

/** Kakao OAuth 로그인 */
export async function signInWithKakao() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) throw error;
  return data;
}

/** 이메일/비밀번호 로그인 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** 이메일 회원가입 */
export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
        signup_domain: window.location.hostname,
      }
    }
  });
  if (error) throw error;
  return data;
}

/** 로그아웃 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** 프로필 조회 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('getProfile error:', error);
    return null;
  }
  return data;
}

/** 비밀번호 재설정 이메일 전송 */
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });
  if (error) throw error;
  return data;
}

/** 비밀번호 변경 (이메일 가입자 전용) */
export async function changePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

/** 아바타 업로드 */
export async function uploadAvatar(userId: string, file: File) {
  const ext = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // URL에 cache-bust 추가
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  await updateProfile(userId, { avatar_url: avatarUrl });
  return avatarUrl;
}

/** 계정 삭제 (프로필 삭제 + 로그아웃) */
export async function deleteAccount(userId: string) {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', userId);
  if (error) throw error;
  await supabase.auth.signOut();
}

/** 프로필 업데이트 */
export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
