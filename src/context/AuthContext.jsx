/**
 * AuthContext — Production-ready authentication state management.
 *
 * Features:
 *  ✅ Auto-login (hydrates from localStorage/sessionStorage on page load)
 *  ✅ Auto-logout (idle timeout via useSessionGuard hook)
 *  ✅ Remember Me support (localStorage vs sessionStorage)
 *  ✅ JWT expiry validation on startup (clears stale tokens)
 *  ✅ Multi-tab sync (storage event listener)
 *  ✅ Role-based access helpers (hasRole, hasAnyRole, isAdmin, isManager)
 *  ✅ Token refresh awareness (axios interceptor handles actual refresh)
 *  ✅ Session status tracking for UI (sessionExpired flag)
 */
import {
  createContext, useContext, useState,
  useCallback, useEffect, useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '@/services/authService';
import storage from '@/utils/sessionStorage';
import { isTokenExpired } from '@/utils/jwtUtils';
import useSessionGuard from '@/hooks/useSessionGuard';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // ── Initial state — hydrate from storage ─────────────────────
  const [user,           setUser]           = useState(null);
  const [token,          setToken]          = useState(null);
  const [loading,        setLoading]        = useState(true);  // true during hydration
  const [sessionExpired, setSessionExpired] = useState(false);

  const initDone = useRef(false);

  // ── Hydration — validate stored tokens on first mount ────────
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const storedToken = storage.getAccessToken();
    const storedUser  = storage.getUser();

    if (storedToken && storedUser) {
      // Only restore if token is still valid (or refresh will handle it)
      const storedRefresh = storage.getRefreshToken();
      if (!isTokenExpired(storedToken, 0) || storedRefresh) {
        // Token valid (or can be refreshed) — restore session
        setToken(storedToken);
        setUser(storedUser);
      } else {
        // Both expired — clear and force re-login
        storage.clearTokens();
      }
    }

    setLoading(false);
  }, []);

  // ── Multi-tab sync — storage event ───────────────────────────
  useEffect(() => {
    const handleStorage = (event) => {
      // Detect logout in another tab
      if (event.key === 'swms_access_token' && !event.newValue) {
        setToken(null);
        setUser(null);
        toast('Logged out from another tab.', {
          icon: '🔒', id: 'cross-tab-logout',
        });
        navigate('/login', { replace: true });
      }
      // Detect login in another tab
      if (event.key === 'swms_auth_user' && event.newValue) {
        try {
          setUser(JSON.parse(event.newValue));
          setToken(storage.getAccessToken());
        } catch { /* ignore parse error */ }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [navigate]);

  // ── Idle-timeout auto-logout ──────────────────────────────────
  const isAuthenticated = Boolean(token && user);

  const handleSessionExpire = useCallback(async () => {
    setSessionExpired(true);
    const refreshToken = storage.getRefreshToken();
    if (refreshToken) {
      try { await authService.logout(refreshToken); } catch { /* ignore */ }
    }
    storage.clearTokens();
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  useSessionGuard(
    isAuthenticated,
    handleSessionExpire,
    storage.updateLastActivity,
  );

  // ── Login ─────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setSessionExpired(false);
    try {
      // Apply remember-me before storing tokens
      const rememberMe = credentials.rememberMe ?? false;
      storage.setRememberMe(rememberMe);

      const data = await authService.login({
        email:      credentials.email,
        password:   credentials.password,
        deviceInfo: navigator.userAgent.slice(0, 255),
      });

      storage.setTokens(data.accessToken, data.refreshToken);
      storage.setUser(data.user);
      storage.updateLastActivity();

      setToken(data.accessToken);
      setUser(data.user);

      toast.success(`Welcome back, ${data.user.firstName}! 👋`, { duration: 3000 });

      // Redirect to originally-requested page, or dashboard
      const redirectTo = credentials.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        'Invalid email or password.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ── Register ──────────────────────────────────────────────────
  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      storage.setRememberMe(true); // new accounts default to remembered

      const data = await authService.register(payload);

      storage.setTokens(data.accessToken, data.refreshToken);
      storage.setUser(data.user);
      storage.updateLastActivity();

      setToken(data.accessToken);
      setUser(data.user);

      toast.success(`Account created! Welcome, ${data.user.firstName}! 🎉`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        'Registration failed. Please try again.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(async (silent = false) => {
    const refreshToken = storage.getRefreshToken();
    if (refreshToken) {
      try { await authService.logout(refreshToken); } catch { /* ignore */ }
    }
    storage.clearTokens();
    setToken(null);
    setUser(null);
    if (!silent) toast.success('You have been signed out.');
    navigate('/login', { replace: true });
  }, [navigate]);

  // ── Token refresh callback (for manual use) ───────────────────
  const refreshSession = useCallback(async () => {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) {
      await logout(true);
      return;
    }
    try {
      const data = await authService.refreshToken(refreshToken);
      storage.setTokens(data.accessToken, data.refreshToken);
      storage.setUser(data.user);
      setToken(data.accessToken);
      setUser(data.user);
    } catch {
      await logout(true);
    }
  }, [logout]);

  // ── Role helpers ──────────────────────────────────────────────
  const getRoleNames = useCallback(() => {
    if (!user?.roles) return [];
    return user.roles.map((r) => (typeof r === 'string' ? r : r.name));
  }, [user]);

  const hasRole = useCallback((role) => {
    const names = getRoleNames();
    if (Array.isArray(role)) return role.some((r) => names.includes(r));
    return names.includes(role);
  }, [getRoleNames]);

  const hasAnyRole = useCallback((...roles) => {
    const names = getRoleNames();
    return roles.flat().some((r) => names.includes(r));
  }, [getRoleNames]);

  const isAdmin = useCallback(() =>
    hasRole('ROLE_ADMIN'), [hasRole]);

  const isManager = useCallback(() =>
    hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER'), [hasAnyRole]);

  // ── Context value ─────────────────────────────────────────────
  return (
    <AuthContext.Provider value={{
      // State
      user,
      token,
      loading,
      isAuthenticated,
      sessionExpired,

      // Actions
      login,
      register,
      logout,
      refreshSession,

      // Role checks
      hasRole,
      hasAnyRole,
      isAdmin,
      isManager,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};

export default AuthContext;
