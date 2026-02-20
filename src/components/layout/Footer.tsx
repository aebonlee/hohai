import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <div className={styles.brand}>好海</div>
          <p className={styles.desc}>
            시와 노래로 전하는 마음.<br />
            호해 이성헌 시인의 작품 세계를 만나보세요.
          </p>
        </div>
        <div className={styles.links}>
          <Link to="/poems" className={styles.link}>추천 시</Link>
          <Link to="/poem-series" className={styles.link}>시집 소개</Link>
          <Link to="/songs" className={styles.link}>추천 노래</Link>
          <Link to="/albums" className={styles.link}>앨범별 소개</Link>
          <Link to="/reviews" className={styles.link}>감상 후기</Link>
          <Link to="/about" className={styles.link}>시인 소개</Link>
        </div>
      </div>
      <div className={styles.bottom}>
        &copy; {new Date().getFullYear()} 호해 이성헌. All rights reserved.
      </div>
    </footer>
  );
}
