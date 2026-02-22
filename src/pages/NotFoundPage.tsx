import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <PageTransition>
      <Helmet>
        <title>페이지를 찾을 수 없습니다 — 好海</title>
      </Helmet>

      <div className={styles.page}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
        <p className={styles.desc}>
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link to="/" className={styles.homeLink}>홈으로 돌아가기</Link>
      </div>
    </PageTransition>
  );
}
