import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PoemsPage from './pages/PoemsPage';
import PoemSeriesPage from './pages/PoemSeriesPage';
import PoemDetailPage from './pages/PoemDetailPage';
import SongsPage from './pages/SongsPage';
import SongSeriesPage from './pages/SongSeriesPage';
import AboutPage from './pages/AboutPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/layout/ProtectedRoute';

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
        </Route>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
