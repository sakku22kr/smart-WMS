import { useState, useEffect, useCallback, useRef } from 'react';
import warehouseService from '@/api/services/warehouseService';

const useWarehouseStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getStats();
      if (!mountedRef.current) return;
      setStats(res?.data ?? null);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[useWarehouseStats] fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load warehouse stats');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchStats();
    return () => { mountedRef.current = false; };
  }, [fetchStats]);

  const refresh = useCallback(() => fetchStats(), [fetchStats]);

  return { stats, loading, error, refresh };
};

export default useWarehouseStats;
