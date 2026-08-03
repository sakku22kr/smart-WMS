import { useState, useEffect, useCallback } from 'react';
import productAuditService from '@/api/services/productAuditService';

/**
 * useProductAudit — fetches paginated audit log entries for a product.
 */
const useProductAudit = (productId, { initialPage = 0, initialSize = 25 } = {}) => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [eventType, setEventType] = useState(null);

  const fetchLogs = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const params = { page, size };
      if (eventType) params.eventType = eventType;
      const res = await productAuditService.getAuditLogs(productId, params);
      const payload = res?.data;
      setLogs(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [productId, page, size, eventType]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const refresh = useCallback(() => fetchLogs(), [fetchLogs]);
  const setPageSafe = useCallback((p) => setPage(p), []);
  const setEventTypeSafe = useCallback((val) => { setEventType(val); setPage(0); }, []);

  return {
    logs, total, loading, error,
    page, setPage: setPageSafe,
    size, setSize: useCallback((v) => { setSize(v); setPage(0); }, []),
    eventType, setEventType: setEventTypeSafe,
    refresh,
  };
};

export default useProductAudit;
