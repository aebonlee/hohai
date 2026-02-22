import { useState, useRef, type FormEvent, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import { useGallery, uploadGalleryImage } from '../hooks/useGallery';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../lib/formatDate';
import styles from './GalleryPage.module.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function GalleryPage() {
  const { items, loading, createItem, deleteItem } = useGallery();
  const { isLoggedIn, profile, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > MAX_FILE_SIZE) {
      setFeedback({ type: 'error', message: '파일 크기는 5MB 이하만 가능합니다.' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    if (!f.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: '이미지 파일만 업로드 가능합니다.' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file || !isLoggedIn || !user) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const imageUrl = await uploadGalleryImage(file, user.id);
      const { error } = await createItem({
        title: title.trim(),
        image_url: imageUrl,
        description: description.trim(),
        author_name: profile?.display_name || user.email || '익명',
        user_id: user.id,
      });

      if (error) {
        setFeedback({ type: 'error', message: '등록에 실패했습니다. 다시 시도해주세요.' });
      } else {
        setFeedback({ type: 'success', message: '갤러리에 등록되었습니다.' });
        setTitle('');
        setDescription('');
        setFile(null);
        setPreview(null);
        setShowForm(false);
      }
    } catch {
      setFeedback({ type: 'error', message: '이미지 업로드에 실패했습니다.' });
    }

    setSubmitting(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await deleteItem(id, imageUrl);
    if (error) {
      setFeedback({ type: 'error', message: '삭제에 실패했습니다.' });
    } else {
      setFeedback({ type: 'success', message: '삭제되었습니다.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const resetForm = () => {
    setShowForm(false);
    setTitle('');
    setDescription('');
    setFile(null);
    setPreview(null);
  };

  return (
    <PageTransition>
      <Helmet>
        <title>갤러리 — 好海</title>
        <meta name="description" content="好海 갤러리 — 이미지와 함께 추억을 공유하세요" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <Link to="/community" className={styles.backLink}>&larr; 커뮤니티</Link>

          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>갤러리</h1>
            <p className={styles.subtitle}>이미지와 함께 추억을 공유하세요</p>
          </div>

          {feedback && (
            <div className={`${styles.feedback} ${styles[feedback.type]}`}>
              {feedback.message}
            </div>
          )}

          <div className={styles.writeArea}>
            {!isLoggedIn ? (
              <div className={styles.loginPrompt}>
                <p>로그인 후 갤러리에 사진을 올려주세요</p>
                <Link to="/login" className={styles.loginLink}>로그인하기</Link>
              </div>
            ) : !showForm ? (
              <button className={styles.writeBtn} onClick={() => setShowForm(true)}>
                사진 올리기
              </button>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <div
                  className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <img src={preview} alt="미리보기" className={styles.previewImg} />
                  ) : (
                    <p className={styles.dropzoneText}>
                      이미지를 드래그하거나 클릭하여 업로드<br />
                      <small>(최대 5MB)</small>
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </div>

                <textarea
                  className={styles.formTextarea}
                  placeholder="설명 (선택사항)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />

                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                    취소
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={submitting || !file}>
                    {submitting ? '등록 중...' : '등록'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : items.length > 0 ? (
            <div className={styles.galleryGrid}>
              {items.map((item, i) => (
                <motion.article
                  key={item.id}
                  className={styles.galleryCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <div className={styles.galleryImageWrap}>
                    <img src={item.image_url} alt={item.title} className={styles.galleryImage} />
                  </div>
                  <div className={styles.galleryInfo}>
                    <h3 className={styles.galleryTitle}>{item.title}</h3>
                    {item.description && (
                      <p className={styles.galleryDesc}>{item.description}</p>
                    )}
                    <div className={styles.galleryMeta}>
                      <span className={styles.galleryAuthor}>{item.author_name}</span>
                      <span className={styles.galleryDate}>{formatDate(item.created_at)}</span>
                    </div>
                    {isLoggedIn && user?.id === item.user_id && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(item.id, item.image_url)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              아직 갤러리에 사진이 없습니다. 첫 번째 사진을 올려주세요!
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
