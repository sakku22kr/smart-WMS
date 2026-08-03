import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from '@components/common/Loader';

/**
 * ProtectedRoute — authentication and role-based access guard.
 *
 * Props:
 *  @param {string}   redirectTo  - Where to send unauthenticated users (default: /login)
 *  @param {string[]} roles       - If provided, user must have at least one of these roles
 *  @param {string}   fallbackTo  - Where to send authorised-but-not-permitted users (default: /dashboard)
 *
 * Behaviour:
 *  • Not authenticated          → redirect to /login (with return URL in state)
 *  • Authenticated, no role req → render children
 *  • Authenticated, wrong role  → redirect to fallbackTo with toast
 *  • Loading hydration          → full-screen spinner
 */
const ProtectedRoute = ({
  redirectTo = '/login',
  roles      = [],
  fallbackTo = '/dashboard',
}) => {
  const { isAuthenticated, loading, hasAnyRole } = useAuth();
  const location = useLocation();

  // Show spinner while AuthContext is hydrating from localStorage
  if (loading) {
    return <Loader fullscreen label="Authenticating…" />;
  }

  // Not authenticated → redirect to login, preserve intended URL
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Role check (only if roles were specified)
  if (roles.length > 0 && !hasAnyRole(...roles)) {
    return <Navigate to={fallbackTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
