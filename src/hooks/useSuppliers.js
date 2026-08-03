import { useState, useEffect, useCallback, useRef } from 'react';
import supplierService from '@/api/services/supplierService';

/**
 * useSuppliers — fetches paginated supplier list from the backend
 * with advanced filtering (status, city, company name), debounced search,
 * and sort direction toggling.
 */
const useSuppliers = ({
  initialPage = 0,
  initialSize = 25,
  initialSort = 'name',
  initialDir = 'asc',
} = {}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortDir, setSortDir] = useState(initialDir);
  const [statusFilter, setStatusFilter] = useState(null);
  const [cityFilter, setCityFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  const mountedRef = useRef(true);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sortBy,
        sortDir,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(cityFilter ? { city: cityFilter } : {}),
        ...(companyFilter ? { companyName: companyFilter } : {}),
      };

      const res = await supplierService.getAll(params);
      if (!mountedRef.current) return;

      const payload = res?.data;
      setSuppliers(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[useSuppliers] fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load suppliers');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [page, size, sortBy, sortDir, search, statusFilter, cityFilter, companyFilter]);

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
  const setCityFilterSafe = useCallback((val) => { setCityFilter(val); setPage(0); }, []);
  const setCompanyFilterSafe = useCallback((val) => { setCompanyFilter(val); setPage(0); }, []);
  const setSizeSafe = useCallback((val) => { setSize(val); setPage(0); }, []);

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setStatusFilter(null);
    setCityFilter('');
    setCompanyFilter('');
    setPage(0);
  }, []);

  const hasActiveFilters = search || statusFilter || cityFilter || companyFilter;

  useEffect(() => {
    mountedRef.current = true;
    fetchSuppliers();
    return () => { mountedRef.current = false; };
  }, [fetchSuppliers]);

  const refresh = useCallback(() => fetchSuppliers(), [fetchSuppliers]);

  const createSupplier = useCallback(async (data) => {
    const res = await supplierService.create(data);
    await fetchSuppliers();
    return res;
  }, [fetchSuppliers]);

  const updateSupplier = useCallback(async (id, data) => {
    const res = await supplierService.update(id, data);
    await fetchSuppliers();
    return res;
  }, [fetchSuppliers]);

  const deleteSupplier = useCallback(async (id) => {
    const res = await supplierService.delete(id);
    await fetchSuppliers();
    return res;
  }, [fetchSuppliers]);

  const restoreSupplier = useCallback(async (id) => {
    const res = await supplierService.restore(id);
    await fetchSuppliers();
    return res;
  }, [fetchSuppliers]);

  return {
    suppliers, total, loading, error,
    page, setPage: setPageSafe,
    size, setSize: setSizeSafe,
    search, setSearch: setSearchSafe,
    sortBy, setSortBy: setSortBySafe,
    sortDir, setSortDir,
    statusFilter, setStatusFilter: setStatusFilterSafe,
    cityFilter, setCityFilter: setCityFilterSafe,
    companyFilter, setCompanyFilter: setCompanyFilterSafe,
    clearAllFilters, hasActiveFilters,
    refresh, createSupplier, updateSupplier, deleteSupplier, restoreSupplier,
  };
};

export default useSuppliers;
