import { useState, useEffect, useCallback, useRef } from 'react';
import inventoryService from '@api/services/inventoryService';

const useInventory = ({
  initialPage = 0,
  initialSize = 25,
  initialSort = 'transactionDate',
  initialDir = 'desc',
} = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortDir, setSortDir] = useState(initialDir);
  const [productId, setProductId] = useState(null);
  const [warehouseId, setWarehouseId] = useState(null);
  const [transactionType, setTransactionType] = useState(null);

  const mountedRef = useRef(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sort: sortBy,
        direction: sortDir,
        ...(search ? { search } : {}),
        ...(productId != null ? { productId } : {}),
        ...(warehouseId != null ? { warehouseId } : {}),
        ...(transactionType ? { transactionType } : {}),
      };

      const res = await inventoryService.getAll(params);
      if (!mountedRef.current) return;

      const payload = res?.data;
      setTransactions(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.response?.data?.message || err?.message || 'Failed to load inventory transactions');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [page, size, sortBy, sortDir, search, productId, warehouseId, transactionType]);

  const setPageSafe = useCallback((p) => setPage(p), []);
  const setSortBySafe = useCallback((field) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
        return prev;
      }
      setSortDir(field === 'transactionDate' ? 'desc' : 'asc');
      return field;
    });
    setPage(0);
  }, []);

  const setSearchSafe = useCallback((val) => { setSearch(val); setPage(0); }, []);
  const setProductIdSafe = useCallback((val) => { setProductId(val); setPage(0); }, []);
  const setWarehouseIdSafe = useCallback((val) => { setWarehouseId(val); setPage(0); }, []);
  const setTransactionTypeSafe = useCallback((val) => { setTransactionType(val); setPage(0); }, []);
  const setSizeSafe = useCallback((val) => { setSize(val); setPage(0); }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchTransactions();
    return () => { mountedRef.current = false; };
  }, [fetchTransactions]);

  const refresh = useCallback(() => fetchTransactions(), [fetchTransactions]);

  const createTransaction = useCallback(async (data) => {
    const res = await inventoryService.create(data);
    await fetchTransactions();
    return res;
  }, [fetchTransactions]);

  const updateTransaction = useCallback(async (id, data) => {
    const res = await inventoryService.update(id, data);
    await fetchTransactions();
    return res;
  }, [fetchTransactions]);

  const deleteTransaction = useCallback(async (id) => {
    const res = await inventoryService.delete(id);
    await fetchTransactions();
    return res;
  }, [fetchTransactions]);

  const restoreTransaction = useCallback(async (id) => {
    const res = await inventoryService.restore(id);
    await fetchTransactions();
    return res;
  }, [fetchTransactions]);

  return {
    transactions, total, loading, error,
    page, setPage: setPageSafe,
    size, setSize: setSizeSafe,
    search, setSearch: setSearchSafe,
    sortBy, setSortBy: setSortBySafe,
    sortDir, setSortDir,
    productId, setProductId: setProductIdSafe,
    warehouseId, setWarehouseId: setWarehouseIdSafe,
    transactionType, setTransactionType: setTransactionTypeSafe,
    refresh, createTransaction, updateTransaction, deleteTransaction, restoreTransaction,
  };
};

export default useInventory;
