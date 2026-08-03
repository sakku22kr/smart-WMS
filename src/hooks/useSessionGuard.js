/**
 * useSessionGuard — enforces idle-timeout auto-logout.
 *
 * Monitors user activity (mouse, keyboard, touch, scroll).
 * After IDLE_TIMEOUT_MS of inactivity, calls logout and shows a toast.
 *
 * Used inside AuthProvider so it runs for all authenticated sessions.
 */
import { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { IDLE_TIMEOUT_MS } from '@/utils/sessionStorage';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
const CHECK_INTERVAL_MS = 60_000; // check every 60s

const useSessionGuard = (isAuthenticated, onExpire, updateActivity) => {
  const timerRef   = useRef(null);
  const intervalRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (typeof updateActivity === 'function') updateActivity();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isAuthenticated) {
        toast.error('Your session has expired due to inactivity. Please log in again.', {
          duration: 5000,
          id: 'session-expired',
        });
        onExpire?.();
      }
    }, IDLE_TIMEOUT_MS);
  }, [isAuthenticated, onExpire, updateActivity]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
      return;
    }

    // Start idle timer
    resetTimer();

    // Attach activity listeners
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));

    // Periodic cross-tab session check
    intervalRef.current = setInterval(() => {
      const accessToken = sessionStorage.getItem('swms_access_token') ||
                          localStorage.getItem('swms_access_token');
      if (!accessToken && isAuthenticated) {
        // Another tab cleared the session
        toast.error('You were logged out from another tab.', { id: 'cross-tab-logout' });
        onExpire?.();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [isAuthenticated, resetTimer, onExpire]);
};

export default useSessionGuard;
