import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdHistory, MdRefresh, MdFilterList, MdExpandMore, MdExpandLess,
  MdInput, MdOutput, MdTune, MdSwapVert, MdLock, MdLockOpen,
  MdLocalShipping, MdAssignmentReturn, MdReportProblem, MdEventBusy,
  MdPerson, MdArrowUpward, MdArrowDownward,
  MdClose,
} from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Search from '@components/table/Search';
import Pagination from '@components/table/Pagination';
import inventoryService from '@api/services/inventoryService';
import productService from '@api/services/productService';
import warehouseService from '@api/services/warehouseService';

const TYPE_CONFIG = {
  STOCK_IN:      { icon: MdInput,          color: 'text-success-500',   bg: 'bg-success-500/10',   badge: 'success', label: 'Stock In' },
  STOCK_OUT:     { icon: MdOutput,         color: 'text-danger-500',    bg: 'bg-danger-500/10',    badge: 'danger',  label: 'Stock Out' },
  ADJUSTMENT:    { icon: MdTune,           color: 'text-info-500',      bg: 'bg-info-500/10',      badge: 'info',    label: 'Adjustment' },
  TRANSFER:      { icon: MdSwapVert,       color: 'text-primary-500',   bg: 'bg-primary-500/10',   badge: 'primary', label: 'Transfer' },
  RESERVED:      { icon: MdLock,           color: 'text-warning-500',   bg: 'bg-warning-500/10',   badge: 'warning', label: 'Reserved' },
  RELEASED:      { icon: MdLockOpen,       color: 'text-surface-500',   bg: 'bg-surface-500/10',   badge: 'surface', label: 'Released' },
  DISPATCHED:    { icon: MdLocalShipping,  color: 'text-purple-500',    bg: 'bg-purple-500/10',    badge: 'primary', label: 'Dispatched' },
  RETURNED:      { icon: MdAssignmentReturn,color: 'text-teal-500',     bg: 'bg-teal-500/10',      badge: 'info',    label: 'Returned' },
  DAMAGED:       { icon: MdReportProblem,  color: 'text-danger-500',    bg: 'bg-danger-500/10',    badge: 'danger',  label: 'Damaged' },
  EXPIRED:       { icon: MdEventBusy,      color: 'text-orange-500',    bg: 'bg-orange-500/10',    badge: 'warning', label: 'Expired' },
};

const QUICK_RANGES = [
  { label: 'Last 24h',   value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This Year',  value: 'year' },
  { label: 'All Time',   value: 'all' },
];

const fieldClass = 'w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all';
const labelClass = 'block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1';

const TableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="data-table">
      <thead>
        <tr>
          {['Type', 'Product', 'Qty', 'Before', 'After', 'User', 'Date', ''].map((h) => (
            <th key={h} className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-16" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }).map((_, i) => (
          <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
            <td className="px-4 py-3"><div className="h-6 w-20 bg-surface-200 dark:bg-surface-700 rounded-full animate-pulse" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-32" /></td>
            <td className="px-4 py-3 text-center"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3 text-center"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3 text-center"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-16" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-24" /></td>
            <td className="px-4 py-3"><div className="h-8 w-8 bg-surface-200 dark:bg-surface-700 rounded-lg animate-pulse" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const InventoryHistory = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const size = 25;
  const [sortBy, setSortBy] = useState('transactionDate');
  const [sortDir, setSortDir] = useState('desc');

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Summary
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [prodRes, warRes] = await Promise.all([
          productService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          warehouseService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
        ]);
        setProducts(prodRes?.data?.content ?? []);
        setWarehouses(warRes?.data?.content ?? []);
      } catch {
        // silent
      }
    };
    loadMeta();
  }, []);

  const buildHistoryParams = useCallback(() => {
    const params = {
      page,
      size,
      sort: sortBy,
      direction: sortDir,
    };
    if (search) params.search = search;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (performedBy) params.performedBy = performedBy;
    if (transactionType) params.transactionType = transactionType;
    if (productId) params.productId = parseInt(productId, 10);
    if (warehouseId) params.warehouseId = parseInt(warehouseId, 10);
    return params;
  }, [page, size, sortBy, sortDir, search, dateFrom, dateTo, performedBy, transactionType, productId, warehouseId]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildHistoryParams();
      const res = await inventoryService.getHistory(params);
      const payload = res?.data;
      setTransactions(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [buildHistoryParams]);

  const fetchSummary = useCallback(async () => {
    try {
      const params = buildHistoryParams();
      delete params.page;
      delete params.size;
      delete params.sort;
      delete params.direction;
      const res = await inventoryService.getHistorySummary(params);
      setSummary(res?.data);
    } catch {
      // silent
    }
  }, [buildHistoryParams]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  useEffect(() => {
    let count = 0;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (performedBy) count++;
    if (transactionType) count++;
    if (productId) count++;
    if (warehouseId) count++;
    setActiveFilters(count);
  }, [dateFrom, dateTo, performedBy, transactionType, productId, warehouseId]);

  const applyQuickRange = (range) => {
    const now = new Date();
    let from = null;
    switch (range) {
      case '24h': from = new Date(now - 24 * 60 * 60 * 1000); break;
      case '7d': from = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': from = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': from = new Date(now - 90 * 24 * 60 * 60 * 1000); break;
      case 'year': from = new Date(now.getFullYear(), 0, 1); break;
      case 'all': from = null; break;
      default: break;
    }
    setDateFrom(from ? from.toISOString().slice(0, 16) : '');
    setDateTo(range === 'all' ? '' : now.toISOString().slice(0, 16));
    setPage(0);
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setPerformedBy('');
    setTransactionType('');
    setProductId('');
    setWarehouseId('');
    setSearch('');
    setPage(0);
  };

  const handleSort = (field) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
        return prev;
      }
      setSortDir(field === 'transactionDate' ? 'desc' : 'asc');
      return field;
    });
    setPage(0);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatQty = (qty, type) => {
    if (qty == null) return '—';
    const isOut = type === 'STOCK_OUT' || type === 'DISPATCHED' || type === 'DAMAGED' || type === 'EXPIRED';
    return `${isOut ? '-' : '+'}${qty.toLocaleString()}`;
  };

  return (
    <PageWrapper>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Inventory History</h1>
            <p className="page-subtitle">Complete audit trail of all stock movements</p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<MdRefresh />} onClick={() => { fetchHistory(); fetchSummary(); }} disabled={loading}>
            Refresh
          </Button>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: 'Total Txns', value: summary.totalTransactions?.toLocaleString(), color: 'text-primary-500' },
              { label: 'Stock In', value: summary.totalStockIn?.toLocaleString(), color: 'text-success-500' },
              { label: 'Stock Out', value: summary.totalStockOut?.toLocaleString(), color: 'text-danger-500' },
              { label: 'Adjustments', value: summary.totalAdjustments?.toLocaleString(), color: 'text-info-500' },
              { label: 'Products', value: summary.uniqueProducts?.toLocaleString(), color: 'text-purple-500' },
              { label: 'Warehouses', value: summary.uniqueWarehouses?.toLocaleString(), color: 'text-teal-500' },
            ].map((s) => (
              <Card key={s.label} padding="sm" className="text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-surface-500 mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button
                variant={filtersOpen || activeFilters > 0 ? 'primary' : 'ghost'}
                size="sm"
                leftIcon={<MdFilterList />}
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                Filters {activeFilters > 0 && `(${activeFilters})`}
                {filtersOpen ? <MdExpandLess className="ml-1" /> : <MdExpandMore className="ml-1" />}
              </Button>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" leftIcon={<MdClose />} onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
            <div className="flex gap-1">
              {QUICK_RANGES.map((r) => (
                <button
                  key={r.value}
                  className="px-2 py-1 text-[10px] font-semibold rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"
                  onClick={() => applyQuickRange(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search row */}
          <div className="flex gap-3 mb-3">
            <Search
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by reference, reason, batch…"
              className="w-full sm:w-80"
            />
          </div>

          {/* Expanded filters */}
          {filtersOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-surface-200 dark:border-surface-700">
              <div>
                <label className={labelClass}>Date From</label>
                <input type="datetime-local" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Date To</label>
                <input type="datetime-local" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Performed By</label>
                <input type="text" value={performedBy} onChange={(e) => { setPerformedBy(e.target.value); setPage(0); }} className={fieldClass} placeholder="Username" />
              </div>
              <div>
                <label className={labelClass}>Transaction Type</label>
                <select value={transactionType} onChange={(e) => { setTransactionType(e.target.value); setPage(0); }} className={fieldClass}>
                  <option value="">All Types</option>
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Product</label>
                <select value={productId} onChange={(e) => { setProductId(e.target.value); setPage(0); }} className={fieldClass}>
                  <option value="">All Products</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Warehouse</label>
                <select value={warehouseId} onChange={(e) => { setWarehouseId(e.target.value); setPage(0); }} className={fieldClass}>
                  <option value="">All Warehouses</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <TableSkeleton />
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <MdHistory size={32} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
              <p className="text-sm text-surface-500">
                {activeFilters > 0 || search ? 'No transactions match your filters' : 'No transactions found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                      onClick={() => handleSort('transactionType')}
                    >
                      <span className="flex items-center gap-1">
                        Type
                        {sortBy === 'transactionType' && (sortDir === 'asc' ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />)}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Product</th>
                    <th
                      className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                      onClick={() => handleSort('quantity')}
                    >
                      <span className="flex items-center justify-center gap-1">
                        Qty
                        {sortBy === 'quantity' && (sortDir === 'asc' ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />)}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Before</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">After</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">User</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                      onClick={() => handleSort('transactionDate')}
                    >
                      <span className="flex items-center gap-1">
                        Date
                        {sortBy === 'transactionDate' && (sortDir === 'asc' ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />)}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => {
                    const cfg = TYPE_CONFIG[txn.transactionType] || TYPE_CONFIG.STOCK_IN;
                    const Icon = cfg.icon;
                    return (
                      <tr
                        key={txn.id}
                        className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors cursor-pointer"
                        onClick={() => navigate(`/inventory/${txn.id}`)}
                      >
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            <Icon size={12} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-surface-800 dark:text-surface-100">{txn.productName || '—'}</p>
                          <p className="text-xs text-surface-400">{txn.warehouseName || ''}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-bold ${formatQty(txn.quantity, txn.transactionType).startsWith('-') ? 'text-danger-500' : 'text-success-500'}`}>
                            {formatQty(txn.quantity, txn.transactionType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-surface-400">{txn.quantityBefore?.toLocaleString() ?? '—'}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-surface-800 dark:text-surface-100">{txn.quantityAfter?.toLocaleString() ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs text-surface-500">
                            <MdPerson size={12} />
                            {txn.performedBy || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-surface-400">{formatDate(txn.transactionDate)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-mono text-surface-400">{txn.referenceNumber || '—'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination page={page} pageSize={size} total={total} onPageChange={setPage} />
        </Card>
      </div>
    </PageWrapper>
  );
};

export default InventoryHistory;
