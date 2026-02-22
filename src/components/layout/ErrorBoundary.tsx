import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  children: ReactNode;
  locationKey: string;
}

interface State {
  hasError: boolean;
  errorKey: string;
}

class ErrorBoundaryInner extends Component<Props, State> {
  state: State = { hasError: false, errorKey: '' };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): State | null {
    // 라우트가 변경되면 에러 상태 리셋
    if (state.hasError && props.locationKey !== state.errorKey) {
      return { hasError: false, errorKey: '' };
    }
    if (state.hasError && !state.errorKey) {
      return { hasError: true, errorKey: props.locationKey };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '40px 20px',
          textAlign: 'center',
          fontFamily: 'var(--font-serif)',
        }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
            문제가 발생했습니다
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
            페이지를 불러오는 중 오류가 발생했습니다.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                background: 'var(--accent-gold)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              새로고침
            </button>
            <Link
              to="/"
              style={{
                padding: '10px 24px',
                background: 'none',
                border: '1px solid rgba(10,25,41,0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
              }}
            >
              홈으로
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <ErrorBoundaryInner locationKey={location.key}>
      {children}
    </ErrorBoundaryInner>
  );
}
