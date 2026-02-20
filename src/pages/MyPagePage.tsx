import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../lib/auth';
import '../styles/auth.css';

export default function MyPagePage() {
  const { user, profile, signOut, refreshProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({ displayName: profile.display_name || '' });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(user.id, { display_name: form.displayName });
      await refreshProfile();
      setEditing(false);
      setMessage('프로필이 업데이트되었습니다.');
    } catch (err: unknown) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <PageTransition>
      <Helmet>
        <title>마이페이지 — 好海</title>
      </Helmet>

      <div className="auth-section">
        <div className="container">
          <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '32px' }}>마이페이지</h1>

          <div className="mypage-card">
            <div className="mypage-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name || ''} />
              ) : (
                <div className="mypage-avatar-placeholder">
                  {(profile?.display_name || user?.email || '?')[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="mypage-info">
              {editing ? (
                <div className="mypage-edit-form">
                  <div className="auth-form-group">
                    <label>이름 (닉네임)</label>
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={e => setForm({ ...form, displayName: e.target.value })}
                    />
                  </div>
                  <div className="mypage-edit-actions">
                    <button className="mypage-btn primary" onClick={handleSave} disabled={saving}>
                      {saving ? '저장 중...' : '저장'}
                    </button>
                    <button className="mypage-btn ghost" onClick={() => setEditing(false)}>
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="mypage-name">{profile?.display_name || '이름 없음'}</h2>
                  <p className="mypage-email">{user?.email}</p>
                  <p className="mypage-provider">
                    {profile?.provider ? `${profile.provider} 로그인` : '이메일 계정'}
                  </p>
                  {isAdmin && <span className="mypage-role-badge">관리자</span>}
                  <button className="mypage-btn ghost" onClick={() => setEditing(true)} style={{ marginTop: '16px' }}>
                    프로필 수정
                  </button>
                </>
              )}

              {message && <div className="auth-message">{message}</div>}
            </div>

            <div className="mypage-footer">
              <button className="mypage-btn danger" onClick={handleSignOut}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
