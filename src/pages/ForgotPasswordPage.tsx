import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { resetPassword } from '../lib/auth';
import '../styles/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError((err as Error).message || '비밀번호 재설정 메일 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>비밀번호 찾기 — 好海</title>
      </Helmet>
      <section className="auth-fullpage">
        <div className="auth-center-wrapper">
          <div className="auth-card-google">
            <div className="auth-logo-area">好海</div>
            <h2 className="auth-heading">비밀번호 찾기</h2>
            <p className="auth-sub">가입한 이메일로 재설정 링크를 보내드립니다</p>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                }}>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#22c55e" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  재설정 메일을 보냈습니다
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  이메일을 확인하여 비밀번호를 재설정하세요.
                </p>
                <Link to="/login" className="auth-next-btn" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
                  로그인으로 돌아가기
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-email-form">
                <div className="auth-input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="이메일 주소"
                    required
                    autoFocus
                  />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <div className="auth-form-actions">
                  <Link to="/login" className="auth-back-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
                    로그인으로 돌아가기
                  </Link>
                  <button type="submit" className="auth-next-btn" disabled={loading}>
                    {loading ? '전송 중...' : '재설정 링크 보내기'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
