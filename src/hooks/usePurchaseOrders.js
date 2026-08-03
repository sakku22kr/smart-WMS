import { useState, useEffect, useCallback, useRef } from 'react';
import purchaseOrderService from '@/api/services/purchaseOrderService';

const usePurchaseOrders = (opts = {}) => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(opts.initialSize ?? 25);
  const [sortBy, setSortBy] = useState(opts.initialSort ?? 'createdAt');
  const [sortDir, setSortDir] = useState(opts.initialDir ?? 'desc');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    supplierId: null,
    warehouseId: null,
    status: null,
    orderDateFrom: null,
    orderDateTo: null,
  });

  const mountedRef = useRef(true);

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {
        page, size, sort: sortBy, direction: sortDir,
        search: search || undefined,
        supplierId: filters.supplierId || undefined,
        warehouseId: filters.warehouseId || undefined,
        status: filters.status || undefined,
        orderDateFrom: filters.orderDateFrom || undefined,
        orderDateTo: filters.orderDateTo || undefined,
      };
      const res = await purchaseOrderService.getAll(params);
      const payload = res?.data;
      if (!mountedRef.current) return;
      setOrders(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.response?.data?.message || err?.message || 'Failed to load purchase orders');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [page, size, sortBy, sortDir, search, filters]);

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders(false);
    return () => { mountedRef.current = false; };
  }, [fetchOrders]);

  const refresh = useCallback(() => fetchOrders(true), [fetchOrders]);

  const createOrder = useCallback(async (data) => {
    const res = await purchaseOrderService.create(data);
    await fetchOrders(true);
    return res?.data;
  }, [fetchOrders]);

  const updateOrder = useCallback(async (id, data) => {
    const res = await purchaseOrderService.update(id, data);
    await fetchOrders(true);
    return res?.data;
  }, [fetchOrders]);

  const deleteOrder = useCallback(async (id) => {
    await purchaseOrderService.delete(id);
    await fetchOrders(true);
  }, [fetchOrders]);

  const approveOrder = useCallback(async (id) => {
    const res = await purchaseOrderService.approve(id);
    await fetchOrders(true);
    return res?.data;
  }, [fetchOrders]);

  const rejectOrder = useCallback(async (id) => {
    const res = await purchaseOrderService.reject(id);
    await fetchOrders(true);
    return res?.data;
  }, [fetchOrders]);

  const receiveOrder = useCallback(async (id) => {
    const res = await purchaseOrderService.receive(id);
    await fetchOrders(true);
    return res?.data;
  }, [fetchOrders]);

  const cancelOrder = useCallback(async (id) => {
    const res = await purchaseOrderService.cancel(id);
    await fetchOrders(true);
    return res?.data;
  }, [fetchOrders]);

  return {
    orders, total, loading, refreshing, error,
    page, setPage, size, setSize,
    sortBy, setSortBy, sortDir, setSortDir,
    search, setSearch,
    filters, setFilters,
    refresh,
    createOrder, updateOrder, deleteOrder,
    approveOrder, rejectOrder, receiveOrder, cancelOrder,
  };
};

export default usePurchaseOrders;
