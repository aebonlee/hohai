import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface MenuItem {
  label: string;
  to: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU: MenuSection[] = [
  {
    title: '소개',
    items: [
      { label: '홈', to: '/' },
      { label: '시인 소개', to: '/about' },
    ],
  },
  {
    title: '시(詩)',
    items: [
      { label: '추천 시', to: '/poems' },
      { label: '시 모음집', to: '/poem-series' },
      { label: '출간시집', to: '/published-books' },
    ],
  },
  {
    title: '노래',
    items: [
      { label: '추천 노래', to: '/songs' },
      { label: '최신 노래', to: '/latest-songs' },
      { label: '노래모음집', to: '/albums' },
    ],
  },
  {
    title: '참여',
    items: [
      { label: '재생목록', to: '/playlist' },
      { label: '커뮤니티', to: '/community' },
      { label: '감상후기', to: '/community/reviews' },
      { label: '갤러리', to: '/community/gallery' },
      { label: '소식통', to: '/community/news' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {MENU.map((section) => (
          <div key={section.title} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <ul className={styles.list}>
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/' || item.to === '/community'}
                    className={({ isActive }) =>
                      `${styles.link} ${isActive ? styles.active : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
