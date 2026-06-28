import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/app/ProtectedRoute';
import AdminSubmissionsPage from '@/pages/admin/submissions/AdminSubmissionsPage';

/**
 * Route milik Dev B (Exercises & Review): review queue admin.
 * ExercisePanel sendiri dipasang sebagai slot di LessonView (Seam 2), bukan route.
 */
export const exerciseRoutes: RouteObject[] = [
  {
    path: 'admin/submissions',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminSubmissionsPage />
      </ProtectedRoute>
    ),
  },
];
