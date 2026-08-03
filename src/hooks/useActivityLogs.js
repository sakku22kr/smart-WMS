import { useState, useEffect, useCallback, useRef } from 'react';
import activityService from '@/api/services/activityService';

/**
 * useActivityLogs — fetches paginated activity logs.
 *
 * @param {object} options
 * @param {number} options.initialPage   - starting page (0-indexed)
 * @param {number} options.initialSize   - rows per page
 * @param {number} options.userId        - filter by user ID (optional)
 *
 * Returns:
 *  - logs, total, loading, error
 *  - page, setPage, size, setSize
 *  - refresh()
 */
const useActivityLogs = ({
  initialPage = 0,
  initialSize = 25,
  userId      = null,
} = {}) => {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [page,    setPage]    = useState(initialPage);
  const [size,    setSize]    = useState(initialSize);

  const mountedRef = useRef(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size };
      const res = userId
        ? await activityService.getByUserId(userId, params)
        : await activityService.getAll(params);

      if (!mountedRef.current) return;

      const payload = res?.data;
      setLogs(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[useActivityLogs] fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load activity logs');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [page, size, userId]);

  const setPageSafe = useCallback((p) => setPage(p), []);
  const setSizeSafe = useCallback((val) => { setSize(val); setPage(0); }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchLogs();
    return () => { mountedRef.current = false; };
  }, [fetchLogs]);

  const refresh = useCallback(() => fetchLogs(), [fetchLogs]);

  return {
    logs, total, loading, error,
    page, setPage: setPageSafe,
    size, setSize: setSizeSafe,
    refresh,
  };
};

export default useActivityLogs;
