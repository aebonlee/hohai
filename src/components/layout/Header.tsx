import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { to: '/', label: '홈', icon: '🏠' },
  { to: '/poems', label: '시(詩)', icon: '📝' },
  { to: '/songs', label: '노래', icon: '🎵' },
  { to: '/about', label: '시인 소개', icon: '👤' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            호해
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
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
                {i < NAV_ITEMS.length - 1 && <span className={styles.navDivider} />}
              </NavLink>
            ))}
          </nav>

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
            <span className={styles.mobileIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}
