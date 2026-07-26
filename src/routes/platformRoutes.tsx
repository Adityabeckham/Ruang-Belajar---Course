import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/app/ProtectedRoute';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import AdminUsersPage from '@/pages/admin/users/AdminUsersPage';
import PlaygroundPage from '@/pages/playground/PlaygroundPage';

/**
 * Route milik Dev C (Platform & Engagement): publik, dashboard, profil, admin user.
 */
export const platformRoutes: RouteObject[] = [
  { index: true, element: <LandingPage /> },
  { path: 'login', element: <LoginPage /> },
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    // Free Code Playground — belajar bebas HTML/CSS/JS tanpa latihan formal.
    path: 'playground',
    element: (
      <ProtectedRoute>
        <PlaygroundPage />
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
        <AdminUsersPage />
      </ProtectedRoute>
    ),
  },
];
