import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import styles from './AboutPage.module.css';

export default function AboutPage() {
  return (
    <PageTransition>
      <Helmet>
        <title>시인 소개 — 호해</title>
        <meta name="description" content="호해 이성헌 시인 소개" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <h1 className="section-title">시인 소개</h1>

          {/* 프로필 */}
          <motion.div
            className={styles.profile}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.photoWrapper}>
              <div className={styles.photoPlaceholder}>海</div>
            </div>
            <div className={styles.info}>
              <h2 className={styles.name}>好海</h2>
              <p className={styles.realName}>호(號): 호해(好海) — 바다를 사랑하다 / 본명: 이성헌</p>
              <p className={styles.bio}>
                바다를 사랑하는 시인. 파도 소리에 귀 기울이며
                시와 노래로 삶의 아름다움을 전합니다.
                넓은 바다처럼 깊은 마음을 담아,
                일상 속 작은 감동을 소중히 노래하고 있습니다.
              </p>
            </div>
          </motion.div>

          {/* 시인의 말 */}
          <motion.div
            className={styles.quoteSection}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="section-title">시인의 말</h2>
            <blockquote className={styles.quote}>
              {`파도가 밀려왔다 물러가듯
시도 그렇게 가슴에 닿습니다.

바다는 늘 그 자리에서
우리에게 말을 걸어옵니다.

이 작은 바다가
당신의 마음에 잔잔한 파도가 되길 소망합니다.`}
            </blockquote>
            <p className={styles.quoteAuthor}>— 호해 이성헌</p>
          </motion.div>

          {/* 연락처 / 채널 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="section-title">연락처</h2>
            <div className={styles.contact}>
              <a
                href="mailto:aebon@dreamitbiz.com"
                className={styles.contactItem}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                aebon@dreamitbiz.com
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
