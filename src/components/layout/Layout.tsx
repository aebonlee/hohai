import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <>
      <Header />
      <main className={isHome ? styles.mainDefault : styles.mainWithSidebar}>
        {!isHome && <Sidebar />}
        {isHome ? (
          <Outlet />
        ) : (
          <div className={styles.content}>
            <Outlet />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
