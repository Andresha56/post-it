import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <div role="status" aria-live="polite" className="grid min-h-screen place-items-center bg-[var(--app-bg)] text-sm text-[var(--text-muted)]">Checking your session…</div>;
  if (status === 'unauthenticated') return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
