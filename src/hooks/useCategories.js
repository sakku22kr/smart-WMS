import { useState, useEffect, useCallback, useRef } from 'react';
import categoryService from '@/api/services/categoryService';

/**
 * useCategories — fetches paginated category list from the backend.
 */
const useCategories = ({
  initialPage = 0,
  initialSize = 25,
  initialSort = 'id',
  initialDir  = 'asc',
} = {}) => {
  const [categories, setCategories] = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [page,        setPage]        = useState(initialPage);
  const [size,        setSize]        = useState(initialSize);
  const [search,      setSearch]      = useState('');
  const [sortBy,      setSortBy]      = useState(initialSort);
  const [sortDir,     setSortDir]     = useState(initialDir);
  const [statusFilter, setStatusFilter] = useState(null);
  const [parentId,    setParentId]    = useState(null);

  const mountedRef = useRef(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sort: sortBy,
        direction: sortDir,
        ...(search   ? { search }   : {}),
        ...(statusFilter !== null ? { status: statusFilter } : {}),
        ...(parentId !== null ? { parentId } : {}),
      };

      const res = await categoryService.getAll(params);
      if (!mountedRef.current) return;

      const payload = res?.data;
      setCategories(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[useCategories] fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load categories');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [page, size, sortBy, sortDir, search, statusFilter, parentId]);

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
  const setParentIdSafe = useCallback((val) => { setParentId(val); setPage(0); }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchCategories();
    return () => { mountedRef.current = false; };
  }, [fetchCategories]);

  const refresh = useCallback(() => fetchCategories(), [fetchCategories]);

  const createCategory = useCallback(async (data) => {
    const res = await categoryService.create(data);
    await fetchCategories();
    return res;
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id, data) => {
    const res = await categoryService.update(id, data);
    await fetchCategories();
    return res;
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id) => {
    const res = await categoryService.delete(id);
    await fetchCategories();
    return res;
  }, [fetchCategories]);

  const restoreCategory = useCallback(async (id) => {
    const res = await categoryService.restore(id);
    await fetchCategories();
    return res;
  }, [fetchCategories]);

  const activateCategory = useCallback(async (id) => {
    const res = await categoryService.activate(id);
    await fetchCategories();
    return res;
  }, [fetchCategories]);

  const deactivateCategory = useCallback(async (id) => {
    const res = await categoryService.deactivate(id);
    await fetchCategories();
    return res;
  }, [fetchCategories]);

  return {
    categories, total, loading, error,
    page,        setPage:        setPageSafe,
    size,        setSize:        setSizeSafe,
    search,      setSearch:      setSearchSafe,
    sortBy,      setSortBy:      setSortBySafe,
    sortDir,     setSortDir,
    statusFilter, setStatusFilter: setStatusFilterSafe,
    parentId,    setParentId:    setParentIdSafe,
    refresh, createCategory, updateCategory, deleteCategory, restoreCategory,
    activateCategory, deactivateCategory,
  };
};

export default useCategories;
