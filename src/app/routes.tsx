import type { RouteObject } from 'react-router-dom';
import Layout from './Layout';
import NotFoundPage from '@/pages/NotFoundPage';
import { platformRoutes } from '@/routes/platformRoutes'; // Dev C
import { contentRoutes } from '@/routes/contentRoutes'; // Dev A
import { exerciseRoutes } from '@/routes/exerciseRoutes'; // Dev B
import { harnessRoutes } from '@/routes/harnessRoutes'; // per-stream test pages

/**
 * Registry route (Seam 3). Di-wire SEKALI di Fase 0; tiap stream cuma menyentuh
 * file route-nya sendiri. Tambah array di sini = satu-satunya titik gabung.
 */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      ...platformRoutes,
      ...contentRoutes,
      ...exerciseRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Harness berdiri sendiri (tanpa shell utama) supaya tiap stream bisa uji mandiri.
  ...harnessRoutes,
];
