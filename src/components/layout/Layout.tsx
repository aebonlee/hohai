import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
