import { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  fallback?: string;
  children?: ReactNode;
}

export function ProtectedRoute({
  fallback = '/login',
  children,
}: ProtectedRouteProps) {
  const { session, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center text-slate-500'>
        Loading workspace…
      </div>
    );
  }

  if (!session) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
