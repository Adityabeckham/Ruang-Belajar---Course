import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/app/ProtectedRoute';
import PlaceholderPage from '@/pages/PlaceholderPage';
import LessonView from '@/pages/learn/LessonView';
import CatalogPage from '@/pages/catalog/CatalogPage';
import CourseDetailPage from '@/pages/course/CourseDetailPage';

/**
 * Route milik Dev A (Content & Learning): katalog, detail course, lesson viewer,
 * authoring admin. Fase 0: placeholder; LessonView sudah skeleton (Seam 2).
 */
export const contentRoutes: RouteObject[] = [
  {
    path: 'courses',
    element: <CatalogPage />,
  },
  {
    path: 'courses/:slug',
    element: <CourseDetailPage />,
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
