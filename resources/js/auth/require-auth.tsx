import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/auth-context';
import { ScreenLoader } from '@/components/common/screen-loader';

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <ScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
