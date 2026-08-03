import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdArrowBack, MdWarehouse, MdLocationOn, MdEmail, MdPhone,
  MdPerson, MdCalendarToday, MdEdit, MdDelete,
  MdScale, MdWarning, MdCheckCircle, MdInfo,
  MdPowerSettingsNew, MdBuild
} from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Loader from '@components/common/Loader';
import ConfirmDialog from '@components/common/ConfirmDialog';
import WarehouseFormModal from '@components/warehouses/WarehouseFormModal';
import warehouseService from '@/api/services/warehouseService';
import useToast from '@hooks/useToast';

const WarehouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const [editOpen, setEditOpen]       = useState(false);
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [actionLoading, setAL]        = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchWarehouse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getById(id);
      setWarehouse(res?.data ?? null);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load warehouse');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchWarehouse(); }, [fetchWarehouse]);

  const handleEdit = useCallback(async (data) => {
    await warehouseService.update(id, data);
    toast.success('Warehouse updated successfully');
    await fetchWarehouse();
  }, [id, fetchWarehouse, toast]);

  const handleDelete = useCallback(async () => {
    setAL(true);
    try {
      await warehouseService.delete(id);
      toast.success('Warehouse deleted successfully');
      navigate('/warehouses');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete warehouse');
    } finally {
      setAL(false);
      setDeleteOpen(false);
    }
  }, [id, navigate, toast]);

  const handleActivate = useCallback(async () => {
    setStatusLoading(true);
    try {
      await warehouseService.activate(id);
      toast.success('Warehouse activated successfully');
      await fetchWarehouse();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to activate warehouse');
    } finally {
      setStatusLoading(false);
    }
  }, [id, fetchWarehouse, toast]);

  const handleDeactivate = useCallback(async () => {
    setStatusLoading(true);
    try {
      await warehouseService.deactivate(id);
      toast.success('Warehouse deactivated successfully');
      await fetchWarehouse();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate warehouse');
    } finally {
      setStatusLoading(false);
    }
  }, [id, fetchWarehouse, toast]);

  const handleMaintenance = useCallback(async () => {
    setStatusLoading(true);
    try {
      await warehouseService.setMaintenance(id);
      toast.success('Warehouse set to maintenance mode');
      await fetchWarehouse();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to set maintenance mode');
    } finally {
      setStatusLoading(false);
    }
  }, [id, fetchWarehouse, toast]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="page-container max-w-5xl">
          <div className="py-16 flex justify-center">
            <Loader size="lg" label="Loading warehouse..." />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="page-container max-w-5xl">
          <Button variant="ghost" leftIcon={<MdArrowBack />} onClick={() => navigate(-1)} className="mb-4">
            Back
          </Button>
          <div className="py-16 text-center">
            <p className="text-danger-500">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={fetchWarehouse}>Retry</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!warehouse) return null;

  const capacityPercent = warehouse.capacity > 0
    ? Math.round((warehouse.currentUtilization / warehouse.capacity) * 100)
    : 0;

  const createdDate = warehouse.createdAt
    ? new Date(warehouse.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '--';
  const updatedDate = warehouse.updatedAt
    ? new Date(warehouse.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '--';

  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { variant: 'success', icon: <MdCheckCircle size={14} />, label: 'Active' };
      case 'INACTIVE':
        return { variant: 'danger', icon: <MdPowerSettingsNew size={14} />, label: 'Inactive' };
      case 'UNDER_MAINTENANCE':
        return { variant: 'warning', icon: <MdBuild size={14} />, label: 'Under Maintenance' };
      default:
        return { variant: 'surface', icon: <MdInfo size={14} />, label: status };
    }
  };

  const statusConfig = getStatusConfig(warehouse.status);

  return (
    <PageWrapper>
      <div className="page-container max-w-5xl">
        <Button variant="ghost" leftIcon={<MdArrowBack />} onClick={() => navigate('/warehouses')} className="mb-4">
          Back to Warehouses
        </Button>

        <div className="page-header">
          <div>
            <h1 className="page-title">Warehouse Details</h1>
            <p className="page-subtitle">View warehouse information and manage settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" leftIcon={<MdEdit />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" leftIcon={<MdDelete />} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left -- Identity + Status */}
          <Card className="lg:col-span-1 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
              <MdWarehouse size={32} className="text-primary-500" />
            </div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              {warehouse.name}
            </h2>
            <p className="text-sm text-primary-500 font-mono mt-0.5">{warehouse.code}</p>
            {warehouse.location && (
              <p className="text-sm text-surface-400 flex items-center gap-1 mt-1">
                <MdLocationOn size={14} /> {warehouse.location}
              </p>
            )}
            <Badge
              variant={statusConfig.variant}
              size="lg"
              className="mt-3"
            >
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>

            {/* Status Actions */}
            <div className="w-full mt-4 px-4 space-y-2">
              {warehouse.status !== 'ACTIVE' && (
                <Button
                  variant="success"
                  size="sm"
                  leftIcon={<MdCheckCircle />}
                  onClick={handleActivate}
                  loading={statusLoading}
                  className="w-full"
                >
                  Activate
                </Button>
              )}
              {warehouse.status !== 'INACTIVE' && (
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<MdPowerSettingsNew />}
                  onClick={handleDeactivate}
                  loading={statusLoading}
                  className="w-full"
                >
                  Deactivate
                </Button>
              )}
              {warehouse.status !== 'UNDER_MAINTENANCE' && (
                <Button
                  variant="warning"
                  size="sm"
                  leftIcon={<MdBuild />}
                  onClick={handleMaintenance}
                  loading={statusLoading}
                  className="w-full"
                >
                  Set Maintenance
                </Button>
              )}
            </div>

            {/* Capacity Meter */}
            <div className="w-full mt-5 px-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-surface-500">Capacity Used</span>
                <span className="font-semibold text-surface-700 dark:text-surface-300">{capacityPercent}%</span>
              </div>
              <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    capacityPercent >= 90 ? 'bg-danger-500' : capacityPercent >= 70 ? 'bg-warning-500' : 'bg-success-500'
                  }`}
                  style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Right -- Details */}
          <Card title="Warehouse Information" className="lg:col-span-2">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-surface-500">Name</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{warehouse.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-500">Code</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100 font-mono">{warehouse.code}</p>
                </div>
              </div>

              {warehouse.location && (
                <div>
                  <label className="text-xs font-medium text-surface-500 flex items-center gap-1">
                    <MdLocationOn size={12} /> Location
                  </label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{warehouse.location}</p>
                </div>
              )}

              {warehouse.address && (
                <div>
                  <label className="text-xs font-medium text-surface-500">Address</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{warehouse.address}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {warehouse.manager && (
                  <div>
                    <label className="text-xs font-medium text-surface-500 flex items-center gap-1">
                      <MdPerson size={12} /> Manager
                    </label>
                    <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{warehouse.manager}</p>
                  </div>
                )}
                {warehouse.contactNumber && (
                  <div>
                    <label className="text-xs font-medium text-surface-500 flex items-center gap-1">
                      <MdPhone size={12} /> Contact
                    </label>
                    <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{warehouse.contactNumber}</p>
                  </div>
                )}
              </div>

              {warehouse.email && (
                <div>
                  <label className="text-xs font-medium text-surface-500 flex items-center gap-1">
                    <MdEmail size={12} /> Email
                  </label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{warehouse.email}</p>
                </div>
              )}

              {warehouse.description && (
                <div>
                  <label className="text-xs font-medium text-surface-500">Description</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{warehouse.description}</p>
                </div>
              )}

              {/* Capacity Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-200 dark:border-surface-700">
                <div className="text-center p-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <p className="text-[10px] uppercase text-surface-400">Total Capacity</p>
                  <p className="text-sm font-semibold text-surface-700 dark:text-surface-200 mt-1">
                    {warehouse.capacity?.toLocaleString()} m&sup3;
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <p className="text-[10px] uppercase text-surface-400">Utilized</p>
                  <p className="text-sm font-semibold text-surface-700 dark:text-surface-200 mt-1">
                    {warehouse.currentUtilization?.toLocaleString()} m&sup3;
                  </p>
                </div>
              </div>

              {/* Audit Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-200 dark:border-surface-700">
                <div>
                  <label className="text-xs font-medium text-surface-500 flex items-center gap-1">
                    <MdCalendarToday size={12} /> Created
                  </label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{createdDate}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-500">Last Updated</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{updatedDate}</p>
                </div>
              </div>

              {warehouse.createdBy && (
                <div>
                  <label className="text-xs font-medium text-surface-500">Created By</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{warehouse.createdBy}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Capacity Management Section */}
        <Card title="Capacity Management" subtitle="Detailed capacity breakdown and status" className="mt-6">
          <div className="space-y-4">
            {/* Capacity Status */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              {capacityPercent >= 100 ? (
                <div className="w-10 h-10 rounded-xl bg-danger-500/10 flex items-center justify-center">
                  <MdWarning size={20} className="text-danger-500" />
                </div>
              ) : capacityPercent >= 90 ? (
                <div className="w-10 h-10 rounded-xl bg-danger-500/10 flex items-center justify-center">
                  <MdWarning size={20} className="text-danger-500" />
                </div>
              ) : capacityPercent >= 70 ? (
                <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center">
                  <MdInfo size={20} className="text-warning-500" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center">
                  <MdCheckCircle size={20} className="text-success-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  {capacityPercent >= 100 ? 'At Maximum Capacity' :
                   capacityPercent >= 90 ? 'Near Capacity Limit' :
                   capacityPercent >= 70 ? 'Moderately Utilized' : 'Available Capacity'}
                </p>
                <p className="text-xs text-surface-500">
                  {capacityPercent >= 100 ? 'Warehouse is at full capacity. Consider expansion or redistribution.' :
                   capacityPercent >= 90 ? 'Warehouse is approaching capacity limits. Monitor closely.' :
                   capacityPercent >= 70 ? 'Warehouse is being utilized efficiently.' : 'Warehouse has ample space available.'}
                </p>
              </div>
            </div>

            {/* Capacity Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <MdScale size={18} className="mx-auto text-primary-500 mb-1" />
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {capacityPercent}%
                </p>
                <p className="text-xs text-surface-500">Utilized</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <MdWarehouse size={18} className="mx-auto text-info-500 mb-1" />
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {((warehouse.capacity || 0) - (warehouse.currentUtilization || 0)).toLocaleString()}
                </p>
                <p className="text-xs text-surface-500">Available (m&sup3;)</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <MdCheckCircle size={18} className="mx-auto text-success-500 mb-1" />
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {(warehouse.currentUtilization || 0).toLocaleString()}
                </p>
                <p className="text-xs text-surface-500">Used (m&sup3;)</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <MdInfo size={18} className="mx-auto text-surface-400 mb-1" />
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {(warehouse.capacity || 0).toLocaleString()}
                </p>
                <p className="text-xs text-surface-500">Total (m&sup3;)</p>
              </div>
            </div>

            {/* Detailed Progress Bar */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-surface-500 font-medium">Capacity Breakdown</span>
                <span className="font-semibold text-surface-700 dark:text-surface-300">{capacityPercent}% used</span>
              </div>
              <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    capacityPercent >= 90 ? 'bg-danger-500' : capacityPercent >= 70 ? 'bg-warning-500' : 'bg-success-500'
                  }`}
                  style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-surface-400 mt-1">
                <span>0 m&sup3;</span>
                <span>{(warehouse.capacity || 0).toLocaleString()} m&sup3;</span>
              </div>
            </div>

            {/* Capacity Guidelines */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-success-500"></span>
                <span className="text-surface-500">0-69%: Available</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-warning-500"></span>
                <span className="text-surface-500">70-89%: Moderate</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-danger-500"></span>
                <span className="text-surface-500">90%+: Critical</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <WarehouseFormModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        warehouse={warehouse}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Warehouse"
        message={`Are you sure you want to delete "${warehouse.name}"? This action cannot be undone.`}
        confirmLabel="Delete Warehouse"
        loading={actionLoading}
      />
    </PageWrapper>
  );
};

export default WarehouseDetail;
