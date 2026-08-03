import { useState, useEffect, useCallback, useRef } from 'react';
import dashboardService from '@/api/services/dashboardService';

/**
 * useDashboard — fetches all dashboard data from the backend.
 *
 * Returns:
 *  - stats        : DashboardStatsResponse (KPI counts)
 *  - lowStock     : LowStockProductResponse[]
 *  - outOfStock   : LowStockProductResponse[]
 *  - loading      : true while the first fetch is in-flight
 *  - refreshing   : true while a manual refresh is in-flight
 *  - error        : string | null
 *  - refresh()    : manually re-fetch all data
 *  - lastUpdated  : Date | null
 *
 * Auto-refreshes every `intervalMs` milliseconds (default: 5 minutes).
 */
const useDashboard = (intervalMs = 5 * 60 * 1000) => {
  const [stats, setStats]           = useState(null);
  const [lowStock, setLowStock]     = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [inventoryValue, setInventoryValue] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const mountedRef = useRef(true);

  const fetchAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);

    try {
      const [statsRes, lowRes, outRes, topRes, prodStatsRes, invValRes, recentOrdersRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getLowStock(),
        dashboardService.getOutOfStock(),
        dashboardService.getTopProducts(6),
        dashboardService.getProductStatistics(),
        dashboardService.getInventoryValue(),
        dashboardService.getRecentOrders(5),
      ]);

      if (!mountedRef.current) return;

      setStats(statsRes?.data ?? statsRes ?? null);
      setLowStock(Array.isArray(lowRes?.data) ? lowRes.data : (Array.isArray(lowRes) ? lowRes : []));
      setOutOfStock(Array.isArray(outRes?.data) ? outRes.data : (Array.isArray(outRes) ? outRes : []));
      setTopProducts(Array.isArray(topRes?.data) ? topRes.data : (Array.isArray(topRes) ? topRes : []));
      setProductStats(prodStatsRes?.data ?? prodStatsRes ?? null);
      setInventoryValue(invValRes?.data ?? invValRes ?? null);
      setRecentOrders(Array.isArray(recentOrdersRes?.data) ? recentOrdersRes.data : (Array.isArray(recentOrdersRes) ? recentOrdersRes : []));
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[useDashboard] fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data');
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

  return { stats, lowStock, outOfStock, topProducts, productStats, inventoryValue, recentOrders, loading, refreshing, error, refresh, lastUpdated };
};

export default useDashboard;
