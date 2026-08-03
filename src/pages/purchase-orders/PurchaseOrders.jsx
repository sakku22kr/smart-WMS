import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAdd, MdRefresh, MdFilterList, MdClose,
  MdEdit, MdDelete, MdCheckCircle, MdCancel, MdSend, MdVisibility,
  MdArrowUpward, MdArrowDownward, MdSwapVert, MdReceipt,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Search from '@components/table/Search';
import Pagination from '@components/table/Pagination';
import EmptyState from '@components/common/EmptyState';
import ConfirmDialog from '@components/common/ConfirmDialog';
import usePurchaseOrders from '@hooks/usePurchaseOrders';
import useDebounce from '@hooks/useDebounce';
import { useAuth } from '@/context/AuthContext';
import supplierService from '@/api/services/supplierService';

const STATUS_OPTIONS = [
  { value: null,                label: 'All Status' },
  { value: 'DRAFT',            label: 'Draft' },
  { value: 'PENDING',          label: 'Pending' },
  { value: 'APPROVED',         label: 'Approved' },
  { value: 'ORDERED',          label: 'Ordered' },
  { value: 'PARTIALLY_RECEIVED', label: 'Partial' },
  { value: 'RECEIVED',         label: 'Received' },
  { value: 'COMPLETED',        label: 'Completed' },
  { value: 'REJECTED',         label: 'Rejected' },
  { value: 'CANCELLED',        label: 'Cancelled' },
];

const STATUS_BADGE = {
  DRAFT: 'surface', PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger',
  ORDERED: 'info', PARTIALLY_RECEIVED: 'warning', RECEIVED: 'success', COMPLETED: 'primary', CANCELLED: 'surface',
};

const SORT_COLUMNS = [
  { key: 'orderNumber',   label: 'Order #',   className: '' },
  { key: null,            label: 'Supplier',   className: '' },
  { key: null,            label: 'Items',      className: 'text-center' },
  { key: 'totalAmount',   label: 'Total',      className: 'text-right' },
  { key: null,            label: 'Status',     className: '' },
  { key: 'orderDate',     label: 'Order Date', className: '' },
  { key: null,            label: 'Expected',   className: '' },
  { key: null,            label: 'Actions',    className: 'text-right' },
];

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const isManager = hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER');

  const {
    orders, total, loading, refreshing, error,
    page, setPage, size, setSize,
    sortBy, setSortBy, sortDir, setSortDir,
    search, setSearch, filters, setFilters,
    refresh, deleteOrder, approveOrder, rejectOrder, receiveOrder, cancelOrder,
  } = usePurchaseOrders();

  // ─── UI state ─────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 400);
  const prevDebouncedRef = useRef(debouncedSearch);

  const [showFilters, setShowFilters] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Sync debounced search to hook
  useEffect(() => {
    if (prevDebouncedRef.current !== debouncedSearch) {
      prevDebouncedRef.current = debouncedSearch;
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, setSearch]);

  // Load suppliers for filter dropdown
  useEffect(() => {
    if (showFilters && suppliers.length === 0) {
      setSuppliersLoading(true);
      supplierService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' })
        .then((res) => setSuppliers(res?.data?.content ?? []))
        .catch(() => {})
        .finally(() => setSuppliersLoading(false));
    }
  }, [showFilters, suppliers.length]);

  const handleSearchChange = useCallback((e) => {
    setLocalSearch(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    setSearch('');
  }, [setSearch]);

  const handleSort = useCallback((field) => {
    if (!field) return;
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  }, [sortBy, setSortBy, setSortDir]);

  const handlePageChange = useCallback((p) => {
    setPage(p - 1);
  }, [setPage]);

  const handlePageSizeChange = useCallback((s) => {
    setSize(s);
    setPage(0);
  }, [setSize, setPage]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value || null }));
    setPage(0);
  }, [setFilters, setPage]);

  const clearFilters = useCallback(() => {
    setFilters({ supplierId: null, warehouseId: null, status: null, orderDateFrom: null, orderDateTo: null });
    setPage(0);
  }, [setFilters, setPage]);

  const hasActiveFilters = filters.status || filters.supplierId || filters.orderDateFrom || filters.orderDateTo;
  const activeFilterCount = [filters.status, filters.supplierId, filters.orderDateFrom || filters.orderDateTo ? 1 : 0]
    .filter(Boolean).length;

  // ─── Formatters ────────────────────────────────────────

  const formatCurrency = (val) => {
    if (val == null) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ─── Action Handlers ──────────────────────────────────

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOrder(deleteId);
      toast.success('Purchase order deleted');
      setDeleteOpen(false);
      setDeleteId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleStatusAction = async (id, action, label) => {
    try {
      if (action === 'approve') await approveOrder(id);
      else if (action === 'reject') await rejectOrder(id);
      else if (action === 'receive') await receiveOrder(id);
      else if (action === 'cancel') await cancelOrder(id);
      toast.success(`Order ${label}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${label}`);
    }
  };

  // ─── Loading Skeleton ─────────────────────────────────

  if (loading && orders.length === 0) {
    return (
      <PageWrapper title="Purchase Orders" subtitle="Manage procurement orders">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4"><div className="h-14 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></Card>
            ))}
          </div>
          <Card className="p-6"><div className="h-64 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Purchase Orders"
      subtitle="Manage procurement orders"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="primary" leftIcon={<MdAdd />} onClick={() => navigate('/purchase-orders/create')}>
            Create Order
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ─── Summary Cards ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: total, color: 'text-primary-500' },
            { label: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, color: 'text-warning-500' },
            { label: 'Approved', value: orders.filter(o => o.status === 'APPROVED' || o.status === 'ORDERED').length, color: 'text-success-500' },
            { label: 'Cancelled', value: orders.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED').length, color: 'text-danger-500' },
          ].map((s) => (
            <Card key={s.label} padding="sm" className="text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-500 mt-0.5">{s.label}</p>
            </Card>
          ))}
        </div>

        <Card>
          {/* ─── Toolbar ────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Search
              value={localSearch}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="Search by order number or supplier..."
              className="w-full sm:w-80"
            />
            <div className="flex gap-2 ml-auto items-center">
              <Button
                variant={hasActiveFilters ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={<MdFilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="primary" size="sm" className="ml-1.5">{activeFilterCount}</Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" leftIcon={<MdClose />} onClick={clearFilters}>
                  Clear
                </Button>
              )}
              <Button variant="secondary" size="sm" leftIcon={<MdRefresh />} onClick={refresh} loading={refreshing}>
                Refresh
              </Button>
            </div>
          </div>

          {/* ─── Filter Panel ───────────────────────────── */}
          {showFilters && (
            <div className="mb-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-3">
              {/* Status Filter Chips */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500">Status</label>
                <div className="flex gap-1 flex-wrap">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value ?? 'all'}
                      onClick={() => handleFilterChange('status', opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        filters.status === opt.value
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supplier Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500">Supplier</label>
                <select
                  value={filters.supplierId ?? ''}
                  onChange={(e) => handleFilterChange('supplierId', e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm"
                  disabled={suppliersLoading}
                >
                  <option value="">{suppliersLoading ? 'Loading suppliers...' : 'All Suppliers'}</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500">Order Date Range</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={filters.orderDateFrom ?? ''}
                    onChange={(e) => handleFilterChange('orderDateFrom', e.target.value || null)}
                    className="px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm"
                  />
                  <span className="text-surface-400">to</span>
                  <input
                    type="date"
                    value={filters.orderDateTo ?? ''}
                    onChange={(e) => handleFilterChange('orderDateTo', e.target.value || null)}
                    className="px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Error Banner ───────────────────────────── */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-800 flex items-center justify-between">
              <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
              <Button variant="ghost" size="xs" onClick={refresh}>Retry</Button>
            </div>
          )}

          {/* ─── Data Table ─────────────────────────────── */}
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {SORT_COLUMNS.map((col) => (
                    <th
                      key={col.label}
                      className={`${col.className} ${col.key ? 'cursor-pointer select-none' : ''}`}
                      onClick={col.key ? () => handleSort(col.key) : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.key && sortBy === col.key && (
                          sortDir === 'asc' ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />
                        )}
                        {col.key && sortBy !== col.key && (
                          <MdSwapVert size={14} className="text-surface-300 dark:text-surface-600" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/purchase-orders/${o.id}`)}
                        className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {o.orderNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-700 dark:text-surface-300">
                      <div className="flex flex-col">
                        <span className="font-medium">{o.supplierName}</span>
                        {o.supplierCode && <span className="text-xs text-surface-400">{o.supplierCode}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{o.totalItems}</td>
                    <td className="px-4 py-3 text-right font-semibold text-sm">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[o.status] ?? 'surface'} dot>{STATUS_LABELS[o.status] ?? o.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-400">{formatDate(o.orderDate)}</td>
                    <td className="px-4 py-3 text-sm text-surface-400">{formatDate(o.expectedDeliveryDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => navigate(`/purchase-orders/${o.id}`)}>
                          <MdVisibility size={16} />
                        </Button>
                        {(o.status === 'DRAFT' || o.status === 'PENDING') && (
                          <Button variant="ghost" size="xs" onClick={() => navigate(`/purchase-orders/${o.id}/edit`)}>
                            <MdEdit size={16} />
                          </Button>
                        )}
                        {o.status === 'PENDING' && isManager && (
                          <>
                            <Button variant="ghost" size="xs" className="text-success-500" onClick={() => handleStatusAction(o.id, 'approve', 'approved')}>
                              <MdCheckCircle size={16} />
                            </Button>
                            <Button variant="ghost" size="xs" className="text-danger-500" onClick={() => handleStatusAction(o.id, 'reject', 'rejected')}>
                              <MdCancel size={16} />
                            </Button>
                          </>
                        )}
                        {o.status === 'APPROVED' && (
                          <Button variant="ghost" size="xs" className="text-info-500" onClick={() => handleStatusAction(o.id, 'receive', 'received')}>
                            <MdSend size={16} />
                          </Button>
                        )}
                        {o.status === 'DRAFT' && (
                          <Button variant="ghost" size="xs" className="text-danger-500" onClick={() => { setDeleteId(o.id); setDeleteOpen(true); }}>
                            <MdDelete size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ─── Empty State ────────────────────────────── */}
          {!loading && orders.length === 0 && (
            <EmptyState
              icon={<MdReceipt />}
              title="No purchase orders found"
              description={search || hasActiveFilters ? 'Try adjusting your search or filters.' : 'Get started by creating your first purchase order.'}
              actionLabel="Create Order"
              onAction={() => navigate('/purchase-orders/create')}
            />
          )}

          {/* ─── Pagination ─────────────────────────────── */}
          {orders.length > 0 && (
            <Pagination
              page={page + 1}
              pageSize={size}
              total={total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </Card>
      </div>

      {/* ─── Delete Confirm Dialog ─────────────────────── */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        onConfirm={handleDelete}
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </PageWrapper>
  );
};

export default PurchaseOrders;
