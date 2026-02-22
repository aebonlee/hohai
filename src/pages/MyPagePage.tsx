import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, changePassword, uploadAvatar, deleteAccount } from '../lib/auth';
import '../styles/auth.css';

export default function MyPagePage() {
  const { user, profile, signOut, refreshProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // 비밀번호 변경
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // 아바타 업로드
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 계정 삭제
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isEmailUser = !profile?.provider || profile.provider === 'email';

  useEffect(() => {
    if (profile) {
      setForm({ displayName: profile.display_name || '' });
    }
  }, [profile]);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { display_name: form.displayName });
      await refreshProfile();
      setEditing(false);
      showMsg('프로필이 업데이트되었습니다.');
    } catch (err: unknown) {
      showMsg((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword.length < 6) {
      showMsg('비밀번호는 6자 이상이어야 합니다.', 'error');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showMsg('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(pwForm.newPassword);
      showMsg('비밀번호가 변경되었습니다.');
      setShowPwForm(false);
      setPwForm({ newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      showMsg((err as Error).message, 'error');
    } finally {
      setPwSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      showMsg('이미지 파일만 업로드할 수 있습니다.', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showMsg('파일 크기는 2MB 이하여야 합니다.', 'error');
      return;
    }

    setAvatarUploading(true);
    try {
      await uploadAvatar(user.id, file);
      await refreshProfile();
      showMsg('프로필 사진이 변경되었습니다.');
    } catch (err: unknown) {
      showMsg((err as Error).message, 'error');
    } finally {
      setAvatarUploading(false);
      // input 초기화
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '계정삭제') return;
    if (!user) return;
    setDeleting(true);
    try {
      await deleteAccount(user.id);
      navigate('/');
    } catch (err: unknown) {
      showMsg((err as Error).message, 'error');
      setDeleting(false);
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
            {/* 아바타 */}
            <div className="mypage-avatar">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <div
                onClick={handleAvatarClick}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="클릭하여 프로필 사진 변경"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name || ''} />
                ) : (
                  <div className="mypage-avatar-placeholder">
                    {(profile?.display_name || user?.email || '?')[0].toUpperCase()}
                  </div>
                )}
                {avatarUploading && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.7)', borderRadius: '50%'
                  }}>
                    <div className="loading-spinner" />
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                클릭하여 사진 변경
              </span>
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

              {message && (
                <div className={messageType === 'error' ? 'auth-error' : 'auth-message'} style={{ marginTop: '12px' }}>
                  {message}
                </div>
              )}
            </div>

            {/* 비밀번호 변경 (이메일 가입자만) */}
            {isEmailUser && (
              <div style={{ borderTop: '1px solid rgba(7,26,51,0.08)', paddingTop: '20px', marginBottom: '20px' }}>
                {showPwForm ? (
                  <div className="mypage-edit-form" style={{ maxWidth: '100%' }}>
                    <div className="auth-form-group" style={{ marginBottom: '12px' }}>
                      <label>새 비밀번호</label>
                      <input
                        type="password"
                        value={pwForm.newPassword}
                        onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        placeholder="6자 이상"
                        minLength={6}
                      />
                    </div>
                    <div className="auth-form-group" style={{ marginBottom: '12px' }}>
                      <label>비밀번호 확인</label>
                      <input
                        type="password"
                        value={pwForm.confirmPassword}
                        onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                        placeholder="비밀번호 재입력"
                      />
                    </div>
                    <div className="mypage-edit-actions">
                      <button className="mypage-btn primary" onClick={handlePasswordChange} disabled={pwSaving}>
                        {pwSaving ? '변경 중...' : '비밀번호 변경'}
                      </button>
                      <button className="mypage-btn ghost" onClick={() => { setShowPwForm(false); setPwForm({ newPassword: '', confirmPassword: '' }); }}>
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="mypage-btn ghost" onClick={() => setShowPwForm(true)} style={{ width: '100%' }}>
                    비밀번호 변경
                  </button>
                )}
              </div>
            )}

            {/* 위험 영역: 계정 삭제 */}
            <div style={{ borderTop: '1px solid rgba(7,26,51,0.08)', paddingTop: '20px', marginBottom: '20px' }}>
              {showDeleteConfirm ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: '#dc2626', marginBottom: '12px', fontWeight: 600 }}>
                    정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    확인을 위해 "계정삭제"를 입력해주세요.
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder="계정삭제"
                    style={{
                      padding: '8px 12px', border: '1px solid #fca5a5', borderRadius: '6px',
                      fontSize: '14px', marginBottom: '12px', width: '160px', textAlign: 'center',
                      fontFamily: 'var(--font-sans)'
                    }}
                  />
                  <div className="mypage-edit-actions">
                    <button
                      className="mypage-btn danger"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== '계정삭제' || deleting}
                    >
                      {deleting ? '삭제 중...' : '계정 영구 삭제'}
                    </button>
                    <button className="mypage-btn ghost" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}>
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="mypage-btn danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ width: '100%' }}
                >
                  계정 삭제
                </button>
              )}
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
