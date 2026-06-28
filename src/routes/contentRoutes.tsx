import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/app/ProtectedRoute';
import PlaceholderPage from '@/pages/PlaceholderPage';
import LessonView from '@/pages/learn/LessonView';

/**
 * Route milik Dev A (Content & Learning): katalog, detail course, lesson viewer,
 * authoring admin. Fase 0: placeholder; LessonView sudah skeleton (Seam 2).
 */
export const contentRoutes: RouteObject[] = [
  {
    path: 'courses',
    element: <PlaceholderPage title="Katalog Course" owner="Dev A" icon="📚" />,
  },
  {
    path: 'courses/:slug',
    element: <PlaceholderPage title="Detail Course" owner="Dev A" icon="📖" />,
  },
  {
    path: 'learn/:courseSlug/:lessonSlug',
    element: (
      <ProtectedRoute>
        <LessonView />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/courses',
    element: (
      <ProtectedRoute requireAdmin>
        <PlaceholderPage title="Kelola Course" subtitle="CRUD course/module/lesson + upload .md" owner="Dev A" icon="✏️" />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/courses/:id/edit',
    element: (
      <ProtectedRoute requireAdmin>
        <PlaceholderPage title="Editor Course" owner="Dev A" icon="📝" />
      </ProtectedRoute>
    ),
  },
];
