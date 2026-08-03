import { useState, useEffect, useCallback, useRef } from 'react';
import inventoryService from '@/api/services/inventoryService';

/**
 * useInventoryAlerts — fetches all inventory alert data from the backend.
 *
 * Returns:
 *  - lowStock          : LowStockProductResponse[]
 *  - outOfStock        : LowStockProductResponse[]
 *  - reorderAlerts     : LowStockProductResponse[]
 *  - criticalAlerts    : LowStockProductResponse[]
 *  - overstocked       : LowStockProductResponse[]
 *  - statistics        : InventoryStatisticsResponse
 *  - healthScore       : number
 *  - loading           : true while the first fetch is in-flight
 *  - refreshing        : true while a manual refresh is in-flight
 *  - error             : string | null
 *  - refresh()         : manually re-fetch all data
 *  - lastUpdated       : Date | null
 */
const useInventoryAlerts = (intervalMs = 5 * 60 * 1000) => {
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [reorderAlerts, setReorderAlerts] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [overstocked, setOverstocked] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const mountedRef = useRef(true);

  const fetchAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);

    try {
      const [
        lowRes, outRes, reorderRes, criticalRes, overRes, statsRes, healthRes
      ] = await Promise.all([
        inventoryService.getLowStockProducts(),
        inventoryService.getOutOfStockProducts(),
        inventoryService.getReorderAlerts(),
        inventoryService.getCriticalAlerts(),
        inventoryService.getOverstockedProducts(),
        inventoryService.getInventoryStatistics(),
        inventoryService.getStockHealthScore(),
      ]);

      if (!mountedRef.current) return;

      setLowStock(Array.isArray(lowRes?.data) ? lowRes.data : (Array.isArray(lowRes) ? lowRes : []));
      setOutOfStock(Array.isArray(outRes?.data) ? outRes.data : (Array.isArray(outRes) ? outRes : []));
      setReorderAlerts(Array.isArray(reorderRes?.data) ? reorderRes.data : (Array.isArray(reorderRes) ? reorderRes : []));
      setCriticalAlerts(Array.isArray(criticalRes?.data) ? criticalRes.data : (Array.isArray(criticalRes) ? criticalRes : []));
      setOverstocked(Array.isArray(overRes?.data) ? overRes.data : (Array.isArray(overRes) ? overRes : []));
      setStatistics(statsRes?.data ?? statsRes ?? null);
      setHealthScore(healthRes?.data ?? healthRes ?? null);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[useInventoryAlerts] fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load inventory alerts');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    fetchAll(false);
    return () => { mountedRef.current = false; };
  }, [fetchAll]);

  // Auto-refresh interval
  useEffect(() => {
    if (!intervalMs) return;
    const id = setInterval(() => fetchAll(false), intervalMs);
    return () => clearInterval(id);
  }, [fetchAll, intervalMs]);

  const refresh = useCallback(() => fetchAll(true), [fetchAll]);

  return {
    lowStock,
    outOfStock,
    reorderAlerts,
    criticalAlerts,
    overstocked,
    statistics,
    healthScore,
    loading,
    refreshing,
    error,
    refresh,
    lastUpdated,
  };
};

export default useInventoryAlerts;
