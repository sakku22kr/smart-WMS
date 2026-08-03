import { useState, useEffect, useCallback, useRef } from 'react';
import productService from '@/api/services/productService';

/**
 * useProducts — fetches paginated product list from the backend.
 */
const useProducts = ({
  initialPage = 0,
  initialSize = 25,
  initialSort = 'id',
  initialDir = 'asc',
} = {}) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortDir, setSortDir] = useState(initialDir);
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [supplierId, setSupplierId] = useState(null);
  const [warehouseId, setWarehouseId] = useState(null);

  const mountedRef = useRef(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sort: sortBy,
        direction: sortDir,
        ...(search ? { search } : {}),
        ...(statusFilter !== null ? { status: statusFilter } : {}),
        ...(categoryId !== null ? { categoryId } : {}),
        ...(supplierId !== null ? { supplierId } : {}),
        ...(warehouseId !== null ? { warehouseId } : {}),
      };

      const res = await productService.getAll(params);
      if (!mountedRef.current) return;

      const payload = res?.data;
      setProducts(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[useProducts] fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load products');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [page, size, sortBy, sortDir, search, statusFilter, categoryId, supplierId, warehouseId]);

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
  const setCategoryIdSafe = useCallback((val) => { setCategoryId(val); setPage(0); }, []);
  const setSupplierIdSafe = useCallback((val) => { setSupplierId(val); setPage(0); }, []);
  const setWarehouseIdSafe = useCallback((val) => { setWarehouseId(val); setPage(0); }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchProducts();
    return () => { mountedRef.current = false; };
  }, [fetchProducts]);

  const refresh = useCallback(() => fetchProducts(), [fetchProducts]);

  const createProduct = useCallback(async (data) => {
    const res = await productService.create(data);
    await fetchProducts();
    return res;
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id, data) => {
    const res = await productService.update(id, data);
    await fetchProducts();
    return res;
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id) => {
    const res = await productService.delete(id);
    await fetchProducts();
    return res;
  }, [fetchProducts]);

  const restoreProduct = useCallback(async (id) => {
    const res = await productService.restore(id);
    await fetchProducts();
    return res;
  }, [fetchProducts]);

  const activateProduct = useCallback(async (id) => {
    const res = await productService.activate(id);
    await fetchProducts();
    return res;
  }, [fetchProducts]);

  const deactivateProduct = useCallback(async (id) => {
    const res = await productService.deactivate(id);
    await fetchProducts();
    return res;
  }, [fetchProducts]);

  return {
    products, total, loading, error,
    page, setPage: setPageSafe,
    size, setSize: setSizeSafe,
    search, setSearch: setSearchSafe,
    sortBy, setSortBy: setSortBySafe,
    sortDir, setSortDir,
    statusFilter, setStatusFilter: setStatusFilterSafe,
    categoryId, setCategoryId: setCategoryIdSafe,
    supplierId, setSupplierId: setSupplierIdSafe,
    warehouseId, setWarehouseId: setWarehouseIdSafe,
    refresh, createProduct, updateProduct, deleteProduct, restoreProduct,
    activateProduct, deactivateProduct,
  };
};

export default useProducts;
