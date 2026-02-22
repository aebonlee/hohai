import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import AuthGuard from './components/layout/AuthGuard';
import AdminGuard from './components/layout/AdminGuard';
import HomePage from './pages/HomePage';
import FeaturedPoemsPage from './pages/FeaturedPoemsPage';
import PoemsPage from './pages/PoemsPage';
import PoemSeriesPage from './pages/PoemSeriesPage';
import PoemDetailPage from './pages/PoemDetailPage';
import FeaturedSongsPage from './pages/FeaturedSongsPage';
import SongsPage from './pages/SongsPage';
import SongSeriesPage from './pages/SongSeriesPage';
import ReviewsPage from './pages/ReviewsPage';
import CommunityPage from './pages/CommunityPage';
import GalleryPage from './pages/GalleryPage';
import NewsPage from './pages/NewsPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MyPagePage from './pages/MyPagePage';
import AdminPage from './pages/AdminPage';
import PlaylistPage from './pages/PlaylistPage';

export default function App() {
  return (
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
  );
}
