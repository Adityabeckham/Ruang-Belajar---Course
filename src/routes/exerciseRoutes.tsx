import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/app/ProtectedRoute';
import PlaceholderPage from '@/pages/PlaceholderPage';

/**
 * Route milik Dev B (Exercises & Review): review queue admin.
 * ExercisePanel sendiri dipasang sebagai slot di LessonView (Seam 2), bukan route.
 */
export const exerciseRoutes: RouteObject[] = [
  {
    path: 'admin/submissions',
    element: (
      <ProtectedRoute requireAdmin>
        <PlaceholderPage title="Review Queue" subtitle="Submission pending → reviewed" owner="Dev B" icon="📥" />
      </ProtectedRoute>
    ),
  },
];
