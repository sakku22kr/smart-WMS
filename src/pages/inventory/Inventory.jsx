import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdInventory, MdAdd, MdRefresh, MdEdit, MdDelete,
  MdArrowUpward, MdArrowDownward, MdTune,
  MdFilterList, MdExpandMore, MdExpandLess,
  MdInput, MdOutput,
  MdSwapVert, MdLock, MdLockOpen, MdLocalShipping, MdAssignmentReturn,
  MdReportProblem, MdEventBusy,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Search from '@components/table/Search';
import Pagination from '@components/table/Pagination';
import ConfirmDialog from '@components/common/ConfirmDialog';
import useInventory from '@hooks/useInventory';
import inventoryService from '@api/services/inventoryService';

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

const SummarySkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} padding="sm" className="text-center">
        <div className="h-8 w-16 mx-auto bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
        <div className="h-3 w-20 mx-auto mt-2 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
      </Card>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="data-table">
      <thead>
        <tr>
          {['Type', 'Product', 'Warehouse', 'Qty', 'Before', 'After', 'Date', ''].map((h) => (
            <th key={h} className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-16" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }).map((_, i) => (
          <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
            <td className="px-4 py-3"><div className="h-6 w-20 bg-surface-200 dark:bg-surface-700 rounded-full animate-pulse" /></td>
            <td className="px-4 py-3"><div className="space-y-1.5"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-32" /><div className="h-3 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-20" /></div></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-24" /></td>
            <td className="px-4 py-3 text-center"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3 text-center"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3 text-center"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-24" /></td>
            <td className="px-4 py-3"><div className="h-8 w-8 bg-surface-200 dark:bg-surface-700 rounded-lg animate-pulse" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Inventory = () => {
  const navigate = useNavigate();
  const {
    transactions, total, loading, error,
    page, setPage, size,
    search, setSearch,
    sortBy, setSortBy, sortDir,
    transactionType, setTransactionType,
    refresh, deleteTransaction,
  } = useInventory();

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, stockIn: 0, stockOut: 0, adjustments: 0 });
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const allRes = await inventoryService.getAll({ page: 0, size: 1 });
      const stockInRes = await inventoryService.getAll({ page: 0, size: 1, transactionType: 'STOCK_IN' });
      const stockOutRes = await inventoryService.getAll({ page: 0, size: 1, transactionType: 'STOCK_OUT' });
      const adjRes = await inventoryService.getAll({ page: 0, size: 1, transactionType: 'ADJUSTMENT' });
      setSummary({
        total: allRes?.data?.totalElements ?? 0,
        stockIn: stockInRes?.data?.totalElements ?? 0,
        stockOut: stockOutRes?.data?.totalElements ?? 0,
        adjustments: adjRes?.data?.totalElements ?? 0,
      });
    } catch {
      // summary will show zeros
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTransaction(deleteId);
      toast.success('Transaction deleted');
      fetchSummary();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatQty = (qty) => (qty != null ? qty.toLocaleString() : '—');

  return (
    <PageWrapper>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Inventory Transactions</h1>
            <p className="page-subtitle">Track all stock movements, adjustments, and transfers</p>
          </div>
          <Button variant="primary" leftIcon={<MdAdd />} onClick={() => navigate('/inventory/create')}>
            New Transaction
          </Button>
        </div>

        {/* Summary */}
        {summaryLoading ? (
          <SummarySkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Transactions', value: summary.total.toLocaleString(), color: 'text-primary-500' },
              { label: 'Stock In', value: summary.stockIn.toLocaleString(), color: 'text-success-500' },
              { label: 'Stock Out', value: summary.stockOut.toLocaleString(), color: 'text-danger-500' },
              { label: 'Adjustments', value: summary.adjustments.toLocaleString(), color: 'text-info-500' },
            ].map((s) => (
              <Card key={s.label} padding="sm" className="text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-surface-500 mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="mb-4">
            <p className="text-danger-500 text-sm">{error}</p>
            <Button variant="ghost" size="sm" onClick={refresh} className="mt-2">Retry</Button>
          </Card>
        )}

        {/* Table */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference, reason, batch…"
              className="w-full sm:w-96"
            />
            <div className="relative">
              <Button
                variant={transactionType ? 'primary' : 'ghost'}
                size="sm"
                leftIcon={<MdFilterList />}
                onClick={() => setTypeFilterOpen(!typeFilterOpen)}
              >
                {transactionType ? TYPE_CONFIG[transactionType]?.label || transactionType : 'All Types'}
                {typeFilterOpen ? <MdExpandLess className="ml-1" /> : <MdExpandMore className="ml-1" />}
              </Button>
              {typeFilterOpen && (
                <div className="absolute z-20 mt-1 w-48 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg py-1">
                  <button
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-700 ${!transactionType ? 'text-primary-500 font-semibold' : 'text-surface-700 dark:text-surface-300'}`}
                    onClick={() => { setTransactionType(null); setTypeFilterOpen(false); }}
                  >
                    All Types
                  </button>
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={key}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-surface-100 dark:hover:bg-surface-700 ${transactionType === key ? 'text-primary-500 font-semibold' : 'text-surface-700 dark:text-surface-300'}`}
                        onClick={() => { setTransactionType(key); setTypeFilterOpen(false); }}
                      >
                        <Icon size={14} className={cfg.color} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" leftIcon={<MdRefresh />} onClick={() => { refresh(); fetchSummary(); }} disabled={loading}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
                <MdInventory size={32} className="text-surface-300 dark:text-surface-600" />
              </div>
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">No transactions found</h3>
              <p className="text-xs text-surface-400 dark:text-surface-500">
                {search || transactionType ? 'Try adjusting your filters' : 'Create your first inventory transaction'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                      onClick={() => setSortBy('transactionType')}
                    >
                      <span className="flex items-center gap-1">
                        Type
                        {sortBy === 'transactionType' && (sortDir === 'asc' ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />)}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Warehouse</th>
                    <th
                      className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                      onClick={() => setSortBy('quantity')}
                    >
                      <span className="flex items-center justify-center gap-1">
                        Qty
                        {sortBy === 'quantity' && (sortDir === 'asc' ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />)}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Before</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">After</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                      onClick={() => setSortBy('transactionDate')}
                    >
                      <span className="flex items-center gap-1">
                        Date
                        {sortBy === 'transactionDate' && (sortDir === 'asc' ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />)}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
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
                          <p className="text-xs text-surface-400">{txn.referenceNumber || ''}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-surface-500 dark:text-surface-400">{txn.warehouseName || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-bold ${txn.transactionType === 'STOCK_OUT' || txn.transactionType === 'DISPATCHED' || txn.transactionType === 'DAMAGED' || txn.transactionType === 'EXPIRED' ? 'text-danger-500' : txn.transactionType === 'STOCK_IN' || txn.transactionType === 'RETURNED' ? 'text-success-500' : 'text-surface-800 dark:text-surface-100'}`}>
                            {txn.transactionType === 'STOCK_OUT' || txn.transactionType === 'DISPATCHED' || txn.transactionType === 'DAMAGED' || txn.transactionType === 'EXPIRED' ? '-' : '+'}{formatQty(txn.quantity)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-surface-400">{formatQty(txn.quantityBefore)}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-surface-800 dark:text-surface-100">{formatQty(txn.quantityAfter)}</td>
                        <td className="px-4 py-3 text-xs text-surface-400">{formatDate(txn.transactionDate)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-500 transition-colors"
                              onClick={() => navigate(`/inventory/${txn.id}/edit`)}
                              title="Edit"
                            >
                              <MdEdit size={16} />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-danger-500 transition-colors"
                              onClick={() => { setDeleteId(txn.id); setDeleteOpen(true); }}
                              title="Delete"
                            >
                              <MdDelete size={16} />
                            </button>
                          </div>
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

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this inventory transaction? This action can be reversed by restoring."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </PageWrapper>
  );
};

export default Inventory;
