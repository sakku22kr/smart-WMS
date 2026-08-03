import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdLocalShipping, MdAdd, MdDelete, MdEdit, MdVisibility, MdClose, MdRefresh,
  MdEmail, MdPhone, MdRestoreFromTrash, MdFilterList, MdCheckCircle, MdBlock,
} from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Search from '@components/table/Search';
import Pagination from '@components/table/Pagination';
import ConfirmDialog from '@components/common/ConfirmDialog';
import useSuppliers from '@hooks/useSuppliers';
import useDebounce from '@hooks/useDebounce';
import supplierService from '@api/services/supplierService';
import toast from 'react-hot-toast';

const STATUS_BADGE = { ACTIVE: 'success', INACTIVE: 'warning', BLACKLISTED: 'danger' };
const STATUS_LABEL = { ACTIVE: 'Active', INACTIVE: 'Inactive', BLACKLISTED: 'Blacklisted' };
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const selectClass = 'px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors';

const TableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="data-table">
      <thead>
        <tr>
          {['Supplier', 'Code', 'Company', 'City', 'Contact', 'Email', 'Phone', 'Status', 'Actions'].map((h) => (
            <th key={h} className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-16" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 8 }).map((_, i) => (
          <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
            {Array.from({ length: 9 }).map((_, j) => (
              <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-20" /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EmptyState = ({ hasFilters, onClearFilters, isDeletedView }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
      {isDeletedView ? (
        <MdRestoreFromTrash size={32} className="text-surface-300 dark:text-surface-600" />
      ) : (
        <MdLocalShipping size={32} className="text-surface-300 dark:text-surface-600" />
      )}
    </div>
    <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">
      {isDeletedView ? 'No deleted suppliers' : 'No suppliers found'}
    </h3>
    <p className="text-xs text-surface-400 dark:text-surface-500 mb-4">
      {hasFilters ? 'Try adjusting your search or filters' : isDeletedView ? 'All suppliers are active' : 'Get started by adding your first supplier'}
    </p>
    {hasFilters ? (
      <Button variant="secondary" size="sm" leftIcon={<MdClose />} onClick={onClearFilters}>Clear Filters</Button>
    ) : !isDeletedView ? (
      <Button variant="primary" size="sm" leftIcon={<MdAdd />} onClick={() => navigate('/suppliers/create')}>Add Supplier</Button>
    ) : null}
  </div>
);

const Suppliers = () => {
  const navigate = useNavigate();
  const {
    suppliers, total, loading, error,
    page, setPage, size, setSize,
    setSearch,
    sortBy, setSortBy, sortDir,
    statusFilter, setStatusFilter,
    cityFilter, setCityFilter,
    companyFilter, setCompanyFilter,
    clearAllFilters, hasActiveFilters,
    refresh, deleteSupplier, restoreSupplier,
  } = useSuppliers({ initialSort: 'name', initialDir: 'asc' });

  // Debounced local search
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => { setSearch(debouncedSearch); }, [debouncedSearch, setSearch]);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Status toggle
  const [statusActionTarget, setStatusActionTarget] = useState(null);
  const [statusActionType, setStatusActionType] = useState(null);
  const [statusActionOpen, setStatusActionOpen] = useState(false);
  const [statusActionLoading, setStatusActionLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Deleted suppliers state
  const [deletedSuppliers, setDeletedSuppliers] = useState([]);
  const [deletedTotal, setDeletedTotal] = useState(0);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [deletedPage, setDeletedPage] = useState(0);
  const [deletedSearch, setDeletedSearch] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const fetchDeleted = useCallback(async () => {
    setDeletedLoading(true);
    try {
      const params = { page: deletedPage, size: 25 };
      if (deletedSearch) params.search = deletedSearch;
      const res = await supplierService.getDeleted(params);
      const payload = res?.data;
      setDeletedSuppliers(payload?.content ?? []);
      setDeletedTotal(payload?.totalElements ?? 0);
    } catch {
      toast.error('Failed to load deleted suppliers');
    } finally {
      setDeletedLoading(false);
    }
  }, [deletedPage, deletedSearch]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await supplierService.getStats();
      setStats(res?.data);
    } catch {
      // stats will remain null
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showDeleted) fetchDeleted();
  }, [showDeleted, fetchDeleted]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteSupplier(confirmDelete.id);
      toast.success(`Supplier "${confirmDelete.name}" deleted`);
      setConfirmDelete(null);
      fetchStats();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete supplier');
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!confirmRestore) return;
    setRestoring(true);
    try {
      await restoreSupplier(confirmRestore.id);
      toast.success(`Supplier "${confirmRestore.name}" restored`);
      setConfirmRestore(null);
      fetchDeleted();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to restore supplier');
    } finally {
      setRestoring(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!statusActionTarget) return;
    setStatusActionLoading(true);
    try {
      if (statusActionType === 'activate') {
        await supplierService.activate(statusActionTarget.id);
        toast.success(`Supplier "${statusActionTarget.name}" activated`);
      } else {
        await supplierService.deactivate(statusActionTarget.id);
        toast.success(`Supplier "${statusActionTarget.name}" deactivated`);
      }
      setStatusActionOpen(false);
      refresh();
      fetchStats();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusActionLoading(false);
    }
  };

  const openStatusAction = (supplier, type) => {
    setStatusActionTarget(supplier);
    setStatusActionType(type);
    setStatusActionOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Supplier', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'companyName', label: 'Company', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    { key: 'contactPerson', label: 'Contact', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider';
  const thSortableClass = `${thClass} cursor-pointer select-none hover:text-primary-500 transition-colors`;

  const renderTable = (data, isLoading, emptyHasFilters, onClear, isDeleted) => (
    <Card padding="none">
      {isLoading ? (
        <TableSkeleton />
      ) : data.length === 0 ? (
        <EmptyState hasFilters={emptyHasFilters} onClearFilters={onClear} isDeletedView={isDeleted} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={col.sortable ? thSortableClass : thClass}
                      onClick={col.sortable ? () => isDeleted ? null : setSortBy(col.key) : undefined}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {!isDeleted && col.sortable && sortBy === col.key && (
                          <span className="text-primary-500">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s) => (
                  <tr key={s.id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                          <MdLocalShipping size={18} className="text-primary-500" />
                        </div>
                        <span className="text-sm font-medium text-surface-800 dark:text-surface-100">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-surface-600 dark:text-surface-300">{s.code}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{s.companyName || '\u2014'}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{s.city || '\u2014'}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{s.contactPerson || '\u2014'}</td>
                    <td className="px-4 py-3">
                      {s.email ? (
                        <a href={`mailto:${s.email}`} className="flex items-center gap-1 text-xs text-surface-500 hover:text-primary-500 transition-colors">
                          <MdEmail size={12} />{s.email}
                        </a>
                      ) : '\u2014'}
                    </td>
                    <td className="px-4 py-3">
                      {s.phone ? (
                        <span className="flex items-center gap-1 text-xs text-surface-500">
                          <MdPhone size={12} />{s.phone}
                        </span>
                      ) : '\u2014'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[s.status] || 'info'} dot>{STATUS_LABEL[s.status] || s.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isDeleted ? (
                          <button onClick={() => setConfirmRestore(s)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors text-surface-400 hover:text-success-500" title="Restore">
                            <MdRestoreFromTrash size={16} />
                          </button>
                        ) : (
                          <>
                            <button onClick={() => navigate(`/suppliers/${s.id}`)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors text-surface-400 hover:text-primary-500" title="View">
                              <MdVisibility size={16} />
                            </button>
                            {s.status === 'ACTIVE' ? (
                              <button onClick={() => openStatusAction(s, 'deactivate')} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors text-surface-400 hover:text-warning-500" title="Deactivate">
                                <MdBlock size={16} />
                              </button>
                            ) : (
                              <button onClick={() => openStatusAction(s, 'activate')} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors text-surface-400 hover:text-success-500" title="Activate">
                                <MdCheckCircle size={16} />
                              </button>
                            )}
                            <button onClick={() => navigate(`/suppliers/${s.id}/edit`)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors text-surface-400 hover:text-info-500" title="Edit">
                              <MdEdit size={16} />
                            </button>
                            <button onClick={() => setConfirmDelete(s)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors text-surface-400 hover:text-danger-500" title="Delete">
                              <MdDelete size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-400">Rows per page:</span>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="px-2 py-1 rounded border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-xs text-surface-700 dark:text-surface-200"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            {isDeleted ? (
              <Pagination
                page={deletedPage}
                totalPages={Math.ceil(deletedTotal / 25)}
                totalItems={deletedTotal}
                onPageChange={setDeletedPage}
              />
            ) : (
              <Pagination
                page={page}
                totalPages={Math.ceil(total / size)}
                totalItems={total}
                onPageChange={setPage}
              />
            )}
          </div>
        </>
      )}
    </Card>
  );

  return (
    <PageWrapper>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">{showDeleted ? 'Deleted Suppliers' : 'Suppliers'}</h1>
            <p className="page-subtitle">{showDeleted ? 'Recover soft-deleted suppliers' : 'Manage your vendor and supplier network'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showDeleted ? 'warning' : 'secondary'}
              size="sm"
              leftIcon={<MdRestoreFromTrash />}
              onClick={() => { setShowDeleted(!showDeleted); setDeletedPage(0); setDeletedSearch(''); }}
            >
              {showDeleted ? 'Active Suppliers' : 'Deleted'}
            </Button>
            {!showDeleted && (
              <>
                <Button variant="secondary" leftIcon={<MdRefresh />} onClick={() => { refresh(); fetchStats(); }} size="sm">Refresh</Button>
                <Button variant="primary" leftIcon={<MdAdd />} onClick={() => navigate('/suppliers/create')} size="sm">Add Supplier</Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        {!showDeleted && (statsLoading || stats) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total', value: stats.totalSuppliers, color: 'primary' },
              { label: 'Active', value: stats.activeCount, color: 'success' },
              { label: 'Inactive', value: stats.inactiveCount, color: 'warning' },
              { label: 'Avg Rating', value: stats.averageRating ? `${stats.averageRating.toFixed(1)}★` : '\u2014', color: 'violet' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700/50">
                <div className={`w-2 h-8 rounded-full bg-${item.color}-500`} />
                <div>
                  <p className="text-lg font-bold text-surface-800 dark:text-surface-100">{item.value}</p>
                  <p className="text-xs text-surface-400">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Banner */}
        {error && !showDeleted && (
          <div className="mb-4 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl flex items-center justify-between">
            <span className="text-sm text-danger-700 dark:text-danger-300">{error}</span>
            <Button variant="danger" size="xs" leftIcon={<MdRefresh />} onClick={refresh}>Retry</Button>
          </div>
        )}

        {/* Search + Filters */}
        {showDeleted ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <Search value={deletedSearch} onChange={(e) => { setDeletedSearch(e.target.value); setDeletedPage(0); }} placeholder="Search deleted suppliers\u2026" className="w-full sm:w-80" />
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Search value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Search suppliers\u2026" className="w-full sm:w-80" />
              <select
                value={statusFilter ?? ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className={selectClass}
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400' : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'}`}
              >
                <MdFilterList size={16} /> Filters
              </button>
              {hasActiveFilters && (
                <Button variant="secondary" size="sm" leftIcon={<MdClose />} onClick={clearAllFilters}>Clear All</Button>
              )}
            </div>
            {showFilters && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700/50">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-surface-400">City</label>
                  <input
                    type="text"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    placeholder="Filter by city"
                    className="px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-200 w-48"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-surface-400">Company</label>
                  <input
                    type="text"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    placeholder="Filter by company"
                    className="px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-200 w-48"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        {showDeleted ? (
          renderTable(deletedSuppliers, deletedLoading, deletedSearch, () => { setDeletedSearch(''); setDeletedPage(0); }, true)
        ) : (
          renderTable(suppliers, loading, hasActiveFilters, clearAllFilters, false)
        )}
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
        variant="danger"
      />

      {/* Restore Dialog */}
      <ConfirmDialog
        open={!!confirmRestore}
        onClose={() => setConfirmRestore(null)}
        onConfirm={handleRestore}
        title="Restore Supplier"
        message={`Are you sure you want to restore "${confirmRestore?.name}"?`}
        confirmText="Restore"
        loading={restoring}
        variant="success"
      />

      {/* Status Toggle Dialog */}
      <ConfirmDialog
        open={statusActionOpen}
        onClose={() => setStatusActionOpen(false)}
        onConfirm={handleStatusToggle}
        title={statusActionType === 'activate' ? 'Activate Supplier' : 'Deactivate Supplier'}
        message={statusActionType === 'activate'
          ? `Are you sure you want to activate "${statusActionTarget?.name}"?`
          : `Are you sure you want to deactivate "${statusActionTarget?.name}"?`
        }
        confirmText={statusActionType === 'activate' ? 'Activate' : 'Deactivate'}
        loading={statusActionLoading}
        variant={statusActionType === 'activate' ? 'success' : 'warning'}
      />
    </PageWrapper>
  );
};

export default Suppliers;
