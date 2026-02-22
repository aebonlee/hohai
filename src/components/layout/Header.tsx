import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { to: '/', label: '홈' },
  { to: '/poems', label: '추천 시(詩)' },
  { to: '/poem-series', label: '시집 소개' },
  { to: '/songs', label: '추천 노래' },
  { to: '/albums', label: '노래모음집' },
  { to: '/playlist', label: '재생목록', title: '내가 만든 재생목록을 관리합니다 (로그인 필요)' },
  { to: '/community', label: '커뮤니티' },
  { to: '/about', label: '시인 소개' },
] as const;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isLoggedIn, user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // 바깥 클릭 시 유저 메뉴 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            好海
            <span className={styles.logoSub}>시인 이성헌</span>
          </Link>

          <nav className={styles.nav}>
            {NAV_ITEMS.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                title={'title' in item ? item.title : undefined}
              >
                {item.label}
                {i < NAV_ITEMS.length - 1 && <span className={styles.navDivider} />}
              </NavLink>
            ))}
          </nav>

          <div className={styles.headerRight}>
            {isLoggedIn ? (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button
                  className={styles.userAvatar}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="사용자 메뉴"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" />
                  ) : (
                    <span>{(profile?.display_name || user?.email || '?')[0].toUpperCase()}</span>
                  )}
                </button>
                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userDropdownHeader}>
                      <strong>{profile?.display_name || '사용자'}</strong>
                      <small>{user?.email}</small>
                    </div>
                    <Link to="/mypage" className={styles.userDropdownItem}>마이페이지</Link>
                    {isAdmin && (
                      <Link to="/admin" className={styles.userDropdownItem}>관리자</Link>
                    )}
                    <button className={styles.userDropdownItem} onClick={handleSignOut}>
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className={styles.loginBtn} title="로그인하면 재생목록, 즐겨찾기를 이용할 수 있습니다">로그인</Link>
            )}

            <button
              className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="메뉴 열기"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.mobileLink} ${isActive ? styles.active : ''}`
            }
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
        <div style={{ borderTop: '1px solid rgba(10, 25, 41, 0.08)', marginTop: '8px', paddingTop: '8px' }}>
          {isLoggedIn ? (
            <>
              <Link to="/mypage" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                마이페이지
              </Link>
              {isAdmin && (
                <Link to="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  관리자
                </Link>
              )}
              <button
                className={styles.mobileLink}
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              로그인
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
