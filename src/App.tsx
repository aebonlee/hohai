import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/layout/ErrorBoundary';
import AuthGuard from './components/layout/AuthGuard';
import AdminGuard from './components/layout/AdminGuard';
import HomePage from './pages/HomePage';

const FeaturedPoemsPage = lazy(() => import('./pages/FeaturedPoemsPage'));
const PoemsPage = lazy(() => import('./pages/PoemsPage'));
const PoemSeriesPage = lazy(() => import('./pages/PoemSeriesPage'));
const PoemDetailPage = lazy(() => import('./pages/PoemDetailPage'));
const FeaturedSongsPage = lazy(() => import('./pages/FeaturedSongsPage'));
const SongsPage = lazy(() => import('./pages/SongsPage'));
const SongSeriesPage = lazy(() => import('./pages/SongSeriesPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PlaylistPage = lazy(() => import('./pages/PlaylistPage'));
const MyPagePage = lazy(() => import('./pages/MyPagePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function Loading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '40vh',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-serif)',
      fontSize: '0.95rem',
    }}>
      불러오는 중...
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="poems" element={<FeaturedPoemsPage />} />
              <Route path="poems/:id" element={<PoemDetailPage />} />
              <Route path="poem-series" element={<PoemsPage />} />
              <Route path="poem-series/:slug" element={<PoemSeriesPage />} />
              <Route path="songs" element={<FeaturedSongsPage />} />
              <Route path="albums" element={<SongsPage />} />
              <Route path="albums/:slug" element={<SongSeriesPage />} />
              <Route path="community" element={<CommunityPage />} />
              <Route path="community/reviews" element={<ReviewsPage />} />
              <Route path="community/gallery" element={<GalleryPage />} />
              <Route path="community/news" element={<NewsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="playlist" element={
                <AuthGuard><PlaylistPage /></AuthGuard>
              } />
              <Route path="mypage" element={
                <AuthGuard><MyPagePage /></AuthGuard>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="admin"
              element={
                <AdminGuard><AdminPage /></AdminGuard>
              }
            />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}
