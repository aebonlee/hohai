import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import styles from './CommunityPage.module.css';

const BOARDS = [
  { to: '/community/reviews', emoji: '\uD83D\uDCAC', title: '감상 후기', desc: '시와 노래에 대한 감상을 나눠주세요' },
  { to: '/community/gallery', emoji: '\uD83D\uDDBC\uFE0F', title: '갤러리', desc: '이미지와 함께 추억을 공유하세요' },
  { to: '/community/news', emoji: '\uD83D\uDCF0', title: '소식통', desc: '소식과 이야기를 전해주세요' },
] as const;

export default function CommunityPage() {
  return (
    <PageTransition>
      <Helmet>
        <title>커뮤니티 — 好海</title>
        <meta name="description" content="好海 커뮤니티 — 감상 후기, 갤러리, 소식통" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>커뮤니티</h1>
            <p className={styles.subtitle}>함께 나누는 시와 노래 이야기</p>
          </div>

          <div className={styles.grid}>
            {BOARDS.map((board, i) => (
              <motion.div
                key={board.to}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link to={board.to} className={styles.card}>
                  <span className={styles.cardEmoji}>{board.emoji}</span>
                  <h2 className={styles.cardTitle}>{board.title}</h2>
                  <p className={styles.cardDesc}>{board.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
