import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdArrowBack, MdCategory, MdCalendarToday, MdEdit, MdDelete,
  MdCheckCircle, MdInfo, MdPowerSettingsNew, MdSort
} from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Loader from '@components/common/Loader';
import ConfirmDialog from '@components/common/ConfirmDialog';
import CategoryBreadcrumb from '@components/categories/CategoryBreadcrumb';
import ActivityLog from '@components/common/ActivityLog';
import categoryService from '@/api/services/categoryService';
import useToast from '@hooks/useToast';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [category, setCategory]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [actionLoading, setAL]        = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchCategory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getById(id);
      setCategory(res?.data ?? null);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCategory(); }, [fetchCategory]);

  const handleDelete = useCallback(async () => {
    setAL(true);
    try {
      await categoryService.delete(id);
      toast.success('Category deleted successfully');
      navigate('/categories');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete category');
    } finally {
      setAL(false);
      setDeleteOpen(false);
    }
  }, [id, navigate, toast]);

  const handleActivate = useCallback(async () => {
    setStatusLoading(true);
    try {
      await categoryService.activate(id);
      toast.success('Category activated successfully');
      await fetchCategory();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to activate category');
    } finally {
      setStatusLoading(false);
    }
  }, [id, fetchCategory, toast]);

  const handleDeactivate = useCallback(async () => {
    setStatusLoading(true);
    try {
      await categoryService.deactivate(id);
      toast.success('Category deactivated successfully');
      await fetchCategory();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate category');
    } finally {
      setStatusLoading(false);
    }
  }, [id, fetchCategory, toast]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="page-container max-w-5xl">
          <div className="py-16 flex justify-center">
            <Loader size="lg" label="Loading category..." />
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
            <Button variant="secondary" className="mt-4" onClick={fetchCategory}>Retry</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!category) return null;

  const createdDate = category.createdAt
    ? new Date(category.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '--';
  const updatedDate = category.updatedAt
    ? new Date(category.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '--';

  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { variant: 'success', icon: <MdCheckCircle size={14} />, label: 'Active' };
      case 'INACTIVE':
        return { variant: 'danger', icon: <MdPowerSettingsNew size={14} />, label: 'Inactive' };
      default:
        return { variant: 'surface', icon: <MdInfo size={14} />, label: status };
    }
  };

  const statusConfig = getStatusConfig(category.status);

  return (
    <PageWrapper>
      <div className="page-container max-w-5xl">
        <Button variant="ghost" leftIcon={<MdArrowBack />} onClick={() => navigate('/categories')} className="mb-4">
          Back to Categories
        </Button>

        <CategoryBreadcrumb categoryId={category.id} />

        <div className="page-header">
          <div>
            <h1 className="page-title">Category Details</h1>
            <p className="page-subtitle">View category information and manage settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" leftIcon={<MdEdit />} onClick={() => navigate(`/categories/${id}/edit`)}>
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
              <MdCategory size={32} className="text-primary-500" />
            </div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              {category.name}
            </h2>
            <p className="text-sm text-primary-500 font-mono mt-0.5">{category.code}</p>
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
              {category.status !== 'ACTIVE' && (
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
              {category.status !== 'INACTIVE' && (
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
            </div>

            {/* Quick Stats */}
            <div className="w-full mt-5 px-4 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                <span className="text-xs text-surface-500">Products</span>
                <span className="text-sm font-semibold text-surface-700 dark:text-surface-200">
                  {(category.productCount ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                <span className="text-xs text-surface-500">Sub-Categories</span>
                <span className="text-sm font-semibold text-surface-700 dark:text-surface-200">
                  {(category.childCount ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                <span className="text-xs text-surface-500">Sort Order</span>
                <span className="text-sm font-semibold text-surface-700 dark:text-surface-200">
                  {category.sortOrder ?? 0}
                </span>
              </div>
            </div>
          </Card>

          {/* Right -- Details */}
          <Card title="Category Information" className="lg:col-span-2">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-surface-500">Name</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{category.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-500">Code</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100 font-mono">{category.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-surface-500 flex items-center gap-1">
                    <MdSort size={12} /> Sort Order
                  </label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{category.sortOrder ?? 0}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-500">Parent Category</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">
                    {category.parentName || <span className="text-surface-400 dark:text-surface-500">Root Category (no parent)</span>}
                  </p>
                </div>
              </div>

              {category.description && (
                <div>
                  <label className="text-xs font-medium text-surface-500">Description</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{category.description}</p>
                </div>
              )}

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

              {category.createdBy && (
                <div>
                  <label className="text-xs font-medium text-surface-500">Created By</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{category.createdBy}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Activity Log */}
        <Card title="Activity Log" subtitle="Recent changes to this category" className="mt-6">
          <ActivityLog targetId={category.id} limit={10} />
        </Card>

        {/* Hierarchy Info */}
        <Card title="Category Hierarchy" subtitle="Parent-child relationships" className="mt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <MdCategory size={20} className="text-primary-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  {category.name}
                </p>
                <p className="text-xs text-surface-500">
                  {category.parentName
                    ? `Child of "${category.parentName}"`
                    : 'Root category (top-level)'}
                </p>
              </div>
              <Badge variant={statusConfig.variant} size="sm">
                {statusConfig.label}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <MdCategory size={18} className="mx-auto text-primary-500 mb-1" />
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {(category.productCount ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-surface-500">Products</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <MdCategory size={18} className="mx-auto text-info-500 mb-1" />
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {(category.childCount ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-surface-500">Sub-Categories</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <MdSort size={18} className="mx-auto text-surface-400 mb-1" />
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {category.sortOrder ?? 0}
                </p>
                <p className="text-xs text-surface-500">Sort Order</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
        confirmLabel="Delete Category"
        loading={actionLoading}
      />
    </PageWrapper>
  );
};

export default CategoryDetail;
