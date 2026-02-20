import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import AuthGuard from './components/layout/AuthGuard';
import AdminGuard from './components/layout/AdminGuard';
import HomePage from './pages/HomePage';
import PoemsPage from './pages/PoemsPage';
import PoemSeriesPage from './pages/PoemSeriesPage';
import PoemDetailPage from './pages/PoemDetailPage';
import SongsPage from './pages/SongsPage';
import SongSeriesPage from './pages/SongSeriesPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MyPagePage from './pages/MyPagePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="poems" element={<PoemsPage />} />
          <Route path="poems/series/:slug" element={<PoemSeriesPage />} />
          <Route path="poems/:id" element={<PoemDetailPage />} />
          <Route path="songs" element={<SongsPage />} />
          <Route path="songs/series/:slug" element={<SongSeriesPage />} />
          <Route path="about" element={<AboutPage />} />
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
