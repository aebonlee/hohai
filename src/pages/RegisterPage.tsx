import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { signUp } from '../lib/auth';
import '../styles/auth.css';

export default function RegisterPage() {
  const { isLoggedIn } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(form.email, form.password, form.displayName);
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="auth-fullpage">
        <div className="auth-center-wrapper">
          <div className="auth-card-google">
            <div className="auth-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h2>회원가입 완료!</h2>
              <p>이메일을 확인하여 계정을 인증해주세요.</p>
              <Link to="/login" className="auth-next-btn auth-btn-full">
                로그인하러 가기
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>회원가입 — 好海</title>
      </Helmet>
      <section className="auth-fullpage">
        <div className="auth-center-wrapper">
          <div className="auth-card-google">
            <div className="auth-logo-area">好海</div>
            <h2 className="auth-heading">회원가입</h2>
            <p className="auth-sub">好海의 회원이 되어보세요</p>

            <form onSubmit={handleSubmit} className="auth-email-form">
              <div className="auth-input-group">
                <input
                  type="text"
                  value={form.displayName}
                  onChange={e => setForm({ ...form, displayName: e.target.value })}
                  placeholder="이름 (닉네임)"
                  required
                  autoFocus
                />
              </div>
              <div className="auth-input-group">
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="이메일 주소"
                  required
                />
              </div>
              <div className="auth-input-group">
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="비밀번호 (6자 이상)"
                  minLength={6}
                  required
                />
              </div>
              <div className="auth-input-group">
                <input
                  type="password"
                  value={form.passwordConfirm}
                  onChange={e => setForm({ ...form, passwordConfirm: e.target.value })}
                  placeholder="비밀번호 확인"
                  required
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-next-btn auth-btn-full" disabled={loading}>
                {loading ? '가입 중...' : '회원가입'}
              </button>
            </form>

            <div className="auth-bottom-link">
              <span>이미 계정이 있으신가요?</span>
              <Link to="/login">로그인</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
