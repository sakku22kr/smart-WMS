import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdWarehouse, MdAdd, MdFilterList, MdClose, MdEdit, MdDelete,
  MdViewList, MdViewModule, MdCheckCircle, MdPowerSettingsNew, MdBuild
} from 'react-icons/md';
import { motion } from 'framer-motion';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Input from '@components/ui/Input';
import Search from '@components/table/Search';
import Pagination from '@components/table/Pagination';
import EmptyState from '@components/common/EmptyState';
import ConfirmDialog from '@components/common/ConfirmDialog';
import WarehouseFormModal from '@components/warehouses/WarehouseFormModal';
import WarehouseTable from '@components/warehouses/WarehouseTable';
import WarehouseSkeleton from '@components/warehouses/WarehouseSkeleton';
import CapacitySummaryCard from '@components/warehouses/CapacitySummaryCard';
import useWarehouses from '@hooks/useWarehouses';
import useWarehouseStats from '@hooks/useWarehouseStats';
import useDebounce from '@hooks/useDebounce';
import useToast from '@hooks/useToast';

const STATUS_OPTIONS = [
  { value: null,            label: 'All Status' },
  { value: 'ACTIVE',        label: 'Active' },
  { value: 'INACTIVE',      label: 'Inactive' },
  { value: 'UNDER_MAINTENANCE', label: 'Maintenance' },
];

const CAPACITY_PRESETS = [
  { label: 'Any',       min: null,  max: null  },
  { label: 'Small (<1k)', min: null,  max: 1000  },
  { label: '1k-5k',     min: 1000,  max: 5000  },
  { label: '5k-10k',    min: 5000,  max: 10000 },
  { label: 'Large (>10k)', min: 10000, max: null  },
];

const CapacityBar = ({ value }) => {
  const color = value >= 90 ? 'bg-danger-500' : value >= 70 ? 'bg-warning-500' : 'bg-success-500';
  return (
    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  );
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'ACTIVE':
      return { variant: 'success', icon: <MdCheckCircle size={14} />, label: 'Active' };
    case 'INACTIVE':
      return { variant: 'danger', icon: <MdPowerSettingsNew size={14} />, label: 'Inactive' };
    case 'UNDER_MAINTENANCE':
      return { variant: 'warning', icon: <MdBuild size={14} />, label: 'Maintenance' };
    default:
      return { variant: 'surface', icon: null, label: status };
  }
};

const Warehouses = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    warehouses, total, loading, error,
    page,   setPage,
    size,   setSize,
    search, setSearch,
    sortBy, setSortBy,
    sortDir,
    statusFilter, setStatusFilter,
    minCapacity, setMinCapacity,
    maxCapacity, setMaxCapacity,
    clearCapacityFilter,
    refresh, createWarehouse, updateWarehouse, deleteWarehouse,
    activateWarehouse, deactivateWarehouse, setMaintenanceWarehouse,
  } = useWarehouses({ initialSize: 25, initialSort: 'id' });

  const { stats: warehouseStats, loading: statsLoading, error: statsError, refresh: refreshStats } = useWarehouseStats();

  // UI State
  const [viewMode, setViewMode]     = useState('card');
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [capacityPreset, setCapPreset] = useState(0);
  const debouncedSearch = useDebounce(localSearch, 400);
  const prevDebouncedRef = useRef(debouncedSearch);

  // Modals
  const [formOpen, setFormOpen]     = useState(false);
  const [editWarehouse, setEditWH]  = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteT]  = useState(null);
  const [deleteLoading, setDL]      = useState(false);
  const [statusActionTarget, setStatusActionTarget] = useState(null);
  const [statusActionType, setStatusActionType] = useState(null);
  const [statusActionOpen, setStatusActionOpen] = useState(false);
  const [statusActionLoading, setStatusActionLoading] = useState(false);

  useEffect(() => {
    if (prevDebouncedRef.current !== debouncedSearch) {
      prevDebouncedRef.current = debouncedSearch;
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, setSearch]);

  const handleSearchChange = useCallback((e) => {
    setLocalSearch(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    setSearch('');
  }, [setSearch]);

  const handleSort = useCallback((field) => {
    setSortBy(field);
  }, [setSortBy]);

  const handlePageChange = useCallback((p) => {
    setPage(p - 1);
  }, [setPage]);

  const handlePageSizeChange = useCallback((s) => {
    setSize(s);
  }, [setSize]);

  const handleCapacityPreset = useCallback((idx) => {
    setCapPreset(idx);
    const preset = CAPACITY_PRESETS[idx];
    setMinCapacity(preset.min);
    setMaxCapacity(preset.max);
  }, [setMinCapacity, setMaxCapacity]);

  const hasActiveFilters = statusFilter !== null || minCapacity !== null || maxCapacity !== null;
  const activeFilterCount = (statusFilter !== null ? 1 : 0) + (minCapacity !== null || maxCapacity !== null ? 1 : 0);

  // ─── CRUD Handlers ──────────────────────────────────────

  const handleCreate = useCallback(async (data) => {
    await createWarehouse(data);
    toast.success('Warehouse created successfully');
    refreshStats();
  }, [createWarehouse, toast, refreshStats]);

  const handleEditClick = useCallback((wh, e) => {
    if (e) e.stopPropagation();
    setEditWH(wh);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback(async (data) => {
    if (!editWarehouse) return;
    await updateWarehouse(editWarehouse.id, data);
    toast.success('Warehouse updated successfully');
    setEditWH(null);
    refreshStats();
  }, [editWarehouse, updateWarehouse, toast, refreshStats]);

  const handleDeleteClick = useCallback((wh, e) => {
    if (e) e.stopPropagation();
    setDeleteT(wh);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDL(true);
    try {
      await deleteWarehouse(deleteTarget.id);
      toast.success('Warehouse deleted successfully');
      setDeleteOpen(false);
      setDeleteT(null);
      refreshStats();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete warehouse';
      toast.error(msg);
    } finally {
      setDL(false);
    }
  }, [deleteTarget, deleteWarehouse, toast, refreshStats]);

  const handleStatusAction = useCallback((wh, action, e) => {
    if (e) e.stopPropagation();
    setStatusActionTarget(wh);
    setStatusActionType(action);
    setStatusActionOpen(true);
  }, []);

  const handleStatusConfirm = useCallback(async () => {
    if (!statusActionTarget || !statusActionType) return;
    setStatusActionLoading(true);
    try {
      let actionFn;
      let successMsg;
      switch (statusActionType) {
        case 'activate':
          actionFn = activateWarehouse;
          successMsg = 'Warehouse activated successfully';
          break;
        case 'deactivate':
          actionFn = deactivateWarehouse;
          successMsg = 'Warehouse deactivated successfully';
          break;
        case 'maintenance':
          actionFn = setMaintenanceWarehouse;
          successMsg = 'Warehouse set to maintenance mode';
          break;
        default:
          return;
      }
      await actionFn(statusActionTarget.id);
      toast.success(successMsg);
      setStatusActionOpen(false);
      setStatusActionTarget(null);
      setStatusActionType(null);
      refreshStats();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update warehouse status');
    } finally {
      setStatusActionLoading(false);
    }
  }, [statusActionTarget, statusActionType, activateWarehouse, deactivateWarehouse, setMaintenanceWarehouse, toast, refreshStats]);

  const handleRowClick = useCallback((wh) => {
    navigate(`/warehouses/${wh.id}`);
  }, [navigate]);

  const getStatusActionMessage = () => {
    if (!statusActionTarget || !statusActionType) return '';
    const name = statusActionTarget.name;
    switch (statusActionType) {
      case 'activate':
        return `Are you sure you want to activate "${name}"? This will set the warehouse status to Active.`;
      case 'deactivate':
        return `Are you sure you want to deactivate "${name}"? This will set the warehouse status to Inactive.`;
      case 'maintenance':
        return `Are you sure you want to set "${name}" to maintenance mode? This will set the warehouse status to Under Maintenance.`;
      default:
        return '';
    }
  };

  const getStatusActionTitle = () => {
    switch (statusActionType) {
      case 'activate': return 'Activate Warehouse';
      case 'deactivate': return 'Deactivate Warehouse';
      case 'maintenance': return 'Set Maintenance Mode';
      default: return 'Update Status';
    }
  };

  return (
    <PageWrapper>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Warehouses</h1>
            <p className="page-subtitle">Manage storage locations and capacity</p>
          </div>
          <Button variant="primary" leftIcon={<MdAdd />} onClick={() => { setEditWH(null); setFormOpen(true); }}>
            Add Warehouse
          </Button>
        </div>

        {/* Capacity Overview Summary */}
        <CapacitySummaryCard stats={warehouseStats} loading={statsLoading} error={statsError} />

        <Card>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Search
              value={localSearch}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="Search warehouses by name, code, location..."
              className="w-full sm:w-72"
            />
            <div className="flex gap-2 ml-auto items-center">
              {/* View Toggle */}
              <div className="flex rounded-lg border border-surface-200 dark:border-surface-600 overflow-hidden">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 transition-colors ${
                    viewMode === 'card'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-surface-700 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-600'
                  }`}
                  title="Card view"
                >
                  <MdViewModule size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 transition-colors ${
                    viewMode === 'table'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-surface-700 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-600'
                  }`}
                  title="Table view"
                >
                  <MdViewList size={18} />
                </button>
              </div>

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
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<MdClose />}
                  onClick={() => { setStatusFilter(null); clearCapacityFilter(); setCapPreset(0); }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-3">
              {/* Status Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500">Status</label>
                <div className="flex gap-1 flex-wrap">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        statusFilter === opt.value
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500">Capacity Range (m&sup3;)</label>
                <div className="flex gap-1 flex-wrap">
                  {CAPACITY_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.label}
                      onClick={() => handleCapacityPreset(idx)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        capacityPreset === idx
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {/* Custom capacity inputs */}
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    placeholder="Min capacity"
                    value={minCapacity ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setMinCapacity(val);
                      setCapPreset(-1);
                    }}
                    size="sm"
                    className="w-32"
                  />
                  <span className="self-center text-surface-400">--</span>
                  <Input
                    type="number"
                    placeholder="Max capacity"
                    value={maxCapacity ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setMaxCapacity(val);
                      setCapPreset(-1);
                    }}
                    size="sm"
                    className="w-32"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-800">
              <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
              <Button variant="ghost" size="xs" className="mt-2" onClick={refresh}>
                Retry
              </Button>
            </div>
          )}

          {/* Content */}
          {loading && warehouses.length === 0 ? (
            <WarehouseSkeleton view={viewMode} rows={viewMode === 'table' ? 8 : 6} />
          ) : !loading && warehouses.length === 0 ? (
            <EmptyState
              icon={<MdWarehouse />}
              title="No warehouses found"
              description={search || hasActiveFilters ? "Try adjusting your search or filters." : "Get started by adding your first warehouse."}
              actionLabel="Add Warehouse"
              onAction={() => { setEditWH(null); setFormOpen(true); }}
            />
          ) : viewMode === 'table' ? (
            <>
              <WarehouseTable
                warehouses={warehouses}
                loading={loading}
                sortKey={sortBy}
                sortOrder={sortDir}
                onSort={handleSort}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onRowClick={handleRowClick}
              />
              <div className="mt-4">
                <Pagination
                  page={page + 1}
                  pageSize={size}
                  total={total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {warehouses.map((wh, i) => {
                  const capacityPercent = wh.capacity > 0
                    ? Math.round((wh.currentUtilization / wh.capacity) * 100)
                    : 0;
                  const statusConf = getStatusConfig(wh.status);
                  return (
                    <motion.div
                      key={wh.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <Card hover className="h-full cursor-pointer" onClick={() => handleRowClick(wh)}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center">
                            <MdWarehouse size={24} className="text-primary-500" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusConf.variant} size="sm">
                              {statusConf.icon}
                              {statusConf.label}
                            </Badge>
                            <Button variant="ghost" size="xs" iconOnly onClick={(e) => handleEditClick(wh, e)} className="text-surface-400 hover:text-primary-500">
                              <MdEdit size={14} />
                            </Button>
                            <Button variant="ghost" size="xs" iconOnly onClick={(e) => handleDeleteClick(wh, e)} className="text-surface-400 hover:text-danger-500">
                              <MdDelete size={14} />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-surface-900 dark:text-surface-50 text-base">{wh.name}</h3>
                        <p className="text-xs text-primary-500 font-mono mt-0.5">{wh.code}</p>
                        {wh.location && (
                          <p className="text-xs text-surface-400 mt-1">{wh.location}</p>
                        )}
                        <div className="mt-4 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-surface-500">Capacity Used</span>
                            <span className="font-semibold text-surface-700 dark:text-surface-300">{capacityPercent}%</span>
                          </div>
                          <CapacityBar value={capacityPercent} />
                          <p className="text-[10px] text-surface-400 text-right">
                            {wh.currentUtilization?.toLocaleString() ?? 0} / {wh.capacity?.toLocaleString() ?? 0} m&sup3;
                          </p>
                        </div>
                        {/* Quick Status Actions */}
                        <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700 flex gap-1">
                          {wh.status !== 'ACTIVE' && (
                            <Button
                              variant="ghost"
                              size="xs"
                              leftIcon={<MdCheckCircle />}
                              onClick={(e) => handleStatusAction(wh, 'activate', e)}
                              className="text-success-500 hover:text-success-600"
                            >
                              Activate
                            </Button>
                          )}
                          {wh.status !== 'INACTIVE' && (
                            <Button
                              variant="ghost"
                              size="xs"
                              leftIcon={<MdPowerSettingsNew />}
                              onClick={(e) => handleStatusAction(wh, 'deactivate', e)}
                              className="text-danger-500 hover:text-danger-600"
                            >
                              Deactivate
                            </Button>
                          )}
                          {wh.status !== 'UNDER_MAINTENANCE' && (
                            <Button
                              variant="ghost"
                              size="xs"
                              leftIcon={<MdBuild />}
                              onClick={(e) => handleStatusAction(wh, 'maintenance', e)}
                              className="text-warning-500 hover:text-warning-600"
                            >
                              Maintenance
                            </Button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-4">
                <Pagination
                  page={page + 1}
                  pageSize={size}
                  total={total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Create Modal */}
      <WarehouseFormModal
        isOpen={formOpen && !editWarehouse}
        onClose={() => { setFormOpen(false); setEditWH(null); }}
        onSubmit={handleCreate}
      />

      {/* Edit Modal */}
      <WarehouseFormModal
        isOpen={formOpen && !!editWarehouse}
        onClose={() => { setFormOpen(false); setEditWH(null); }}
        onSubmit={handleEdit}
        warehouse={editWarehouse}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteT(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Warehouse"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : ''}
        confirmLabel="Delete Warehouse"
        loading={deleteLoading}
      />

      {/* Status Action Confirm */}
      <ConfirmDialog
        isOpen={statusActionOpen}
        onClose={() => { setStatusActionOpen(false); setStatusActionTarget(null); setStatusActionType(null); }}
        onConfirm={handleStatusConfirm}
        title={getStatusActionTitle()}
        message={getStatusActionMessage()}
        confirmLabel={statusActionType === 'activate' ? 'Activate' : statusActionType === 'deactivate' ? 'Deactivate' : 'Set Maintenance'}
        loading={statusActionLoading}
      />
    </PageWrapper>
  );
};

export default Warehouses;
