import { useState, useEffect, useCallback, useRef } from 'react';
import warehouseService from '@/api/services/warehouseService';

/**
 * useWarehouses — fetches paginated warehouse list from the backend.
 *
 * @param {object} options
 * @param {number} options.initialPage   - starting page (0-indexed)
 * @param {number} options.initialSize   - rows per page
 * @param {string} options.initialSort   - sort field
 * @param {string} options.initialDir    - sort direction
 */
const useWarehouses = ({
  initialPage = 0,
  initialSize = 25,
  initialSort = 'id',
  initialDir  = 'asc',
} = {}) => {
  const [warehouses,  setWarehouses]  = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [page,        setPage]        = useState(initialPage);
  const [size,        setSize]        = useState(initialSize);
  const [search,      setSearch]      = useState('');
  const [sortBy,      setSortBy]      = useState(initialSort);
  const [sortDir,     setSortDir]     = useState(initialDir);
  const [statusFilter, setStatusFilter] = useState(null);
  const [minCapacity, setMinCapacity] = useState(null);
  const [maxCapacity, setMaxCapacity] = useState(null);

  const mountedRef = useRef(true);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sort: sortBy,
        direction: sortDir,
        ...(search   ? { search }   : {}),
        ...(statusFilter !== null ? { status: statusFilter } : {}),
        ...(minCapacity !== null ? { minCapacity } : {}),
        ...(maxCapacity !== null ? { maxCapacity } : {}),
      };

      const res = await warehouseService.getAll(params);
      if (!mountedRef.current) return;

      const payload = res?.data;
      setWarehouses(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[useWarehouses] fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load warehouses');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [page, size, sortBy, sortDir, search, statusFilter, minCapacity, maxCapacity]);

  const setPageSafe = useCallback((p) => setPage(p), []);
  const setSortBySafe = useCallback((field) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
        return prev;
      }
      setSortDir('asc');
      return field;
    });
    setPage(0);
  }, []);

  const setSearchSafe = useCallback((val) => { setSearch(val); setPage(0); }, []);
  const setStatusFilterSafe = useCallback((val) => { setStatusFilter(val); setPage(0); }, []);
  const setSizeSafe = useCallback((val) => { setSize(val); setPage(0); }, []);
  const setMinCapacitySafe = useCallback((val) => { setMinCapacity(val); setPage(0); }, []);
  const setMaxCapacitySafe = useCallback((val) => { setMaxCapacity(val); setPage(0); }, []);

  const clearCapacityFilter = useCallback(() => {
    setMinCapacity(null);
    setMaxCapacity(null);
    setPage(0);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchWarehouses();
    return () => { mountedRef.current = false; };
  }, [fetchWarehouses]);

  const refresh = useCallback(() => fetchWarehouses(), [fetchWarehouses]);

  const createWarehouse = useCallback(async (data) => {
    const res = await warehouseService.create(data);
    await fetchWarehouses();
    return res;
  }, [fetchWarehouses]);

  const updateWarehouse = useCallback(async (id, data) => {
    const res = await warehouseService.update(id, data);
    await fetchWarehouses();
    return res;
  }, [fetchWarehouses]);

  const deleteWarehouse = useCallback(async (id) => {
    const res = await warehouseService.delete(id);
    await fetchWarehouses();
    return res;
  }, [fetchWarehouses]);

  const restoreWarehouse = useCallback(async (id) => {
    const res = await warehouseService.restore(id);
    await fetchWarehouses();
    return res;
  }, [fetchWarehouses]);

  const activateWarehouse = useCallback(async (id) => {
    const res = await warehouseService.activate(id);
    await fetchWarehouses();
    return res;
  }, [fetchWarehouses]);

  const deactivateWarehouse = useCallback(async (id) => {
    const res = await warehouseService.deactivate(id);
    await fetchWarehouses();
    return res;
  }, [fetchWarehouses]);

  const setMaintenanceWarehouse = useCallback(async (id) => {
    const res = await warehouseService.setMaintenance(id);
    await fetchWarehouses();
    return res;
  }, [fetchWarehouses]);

  return {
    warehouses, total, loading, error,
    page,        setPage:        setPageSafe,
    size,        setSize:        setSizeSafe,
    search,      setSearch:      setSearchSafe,
    sortBy,      setSortBy:      setSortBySafe,
    sortDir,     setSortDir,
    statusFilter, setStatusFilter: setStatusFilterSafe,
    minCapacity, setMinCapacity: setMinCapacitySafe,
    maxCapacity, setMaxCapacity: setMaxCapacitySafe,
    clearCapacityFilter,
    refresh, createWarehouse, updateWarehouse, deleteWarehouse, restoreWarehouse,
    activateWarehouse, deactivateWarehouse, setMaintenanceWarehouse,
  };
};

export default useWarehouses;
