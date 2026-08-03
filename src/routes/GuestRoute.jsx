import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from '@components/common/Loader';

/**
 * GuestRoute — redirects already-authenticated users away from auth pages.
 *
 * Use this to wrap /login, /register, /forgot-password, /reset-password.
 * Prevents logged-in users from seeing the auth pages.
 *
 * @param {string} redirectTo - Where to send authenticated users (default: /dashboard)
 */
const GuestRoute = ({ redirectTo = '/dashboard' }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader fullscreen label="Loading…" />;

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
