import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Loading } from '@/components/ui';

export interface ProtectedRouteProps {
  children: ReactNode;
  /** Bila true, hanya admin yang boleh akses (guard `/admin/*`). */
  requireAdmin?: boolean;
}

/**
 * Guard route berbasis status auth + `profiles.role` (Task 0.4).
 * Ini UX boundary; otorisasi sesungguhnya tetap dicek di server (PRD §10).
 */
export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const isAdmin = useQuery(
    api.profiles.isCurrentUserAdmin,
    requireAdmin ? {} : 'skip',
  );
  const location = useLocation();

  if (isLoading) return <Loading tip="Memeriksa akses…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin) {
    if (isAdmin === undefined) return <Loading tip="Memeriksa peran…" />;
    if (!isAdmin) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
