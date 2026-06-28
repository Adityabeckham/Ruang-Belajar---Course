import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/app/ProtectedRoute';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import PlaceholderPage from '@/pages/PlaceholderPage';

/**
 * Route milik Dev C (Platform & Engagement): publik, dashboard, profil, admin user.
 * Fase 0: isi pakai placeholder kecuali landing & login.
 */
export const platformRoutes: RouteObject[] = [
  { index: true, element: <LandingPage /> },
  { path: 'login', element: <LoginPage /> },
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <PlaceholderPage title="Dashboard" subtitle="Lanjut belajar · XP · badge" owner="Dev C" icon="📊" />
      </ProtectedRoute>
    ),
  },
  {
    path: 'profile',
    element: (
      <ProtectedRoute>
        <PlaceholderPage title="Profil" subtitle="Statistik & pencapaian" owner="Dev C" icon="👤" />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute requireAdmin>
        <PlaceholderPage title="Admin" subtitle="Ringkasan course, review, user" owner="Dev C" icon="🛠️" />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/users',
    element: (
      <ProtectedRoute requireAdmin>
        <PlaceholderPage title="Kelola User & Role" owner="Dev C" icon="👥" />
      </ProtectedRoute>
    ),
  },
];
