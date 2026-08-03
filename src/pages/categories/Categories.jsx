import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCategory, MdAdd, MdGridView, MdTableRows, MdAccountTree, MdRestoreFromTrash } from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Search from '@components/table/Search';
import Pagination from '@components/table/Pagination';
import useCategories from '@hooks/useCategories';
import CategorySkeleton from '@components/categories/CategorySkeleton';
import CategoryTree from '@components/categories/CategoryTree';
import ConfirmDialog from '@components/common/ConfirmDialog';
import useToast from '@hooks/useToast';
import categoryService from '@/api/services/categoryService';

const Categories = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    categories, total, loading, error,
    page, setPage,
    size,
    search,      setSearch,
    sortBy,      setSortBy,
    sortDir,
    statusFilter, setStatusFilter,
    parentId,    setParentId,
    refresh,
    deleteCategory,
    activateCategory,
    deactivateCategory,
  } = useCategories({ initialSort: 'sortOrder', initialDir: 'asc' });

  const [viewMode, setViewMode] = useState('table');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [parentOptions, setParentOptions] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await categoryService.getRoots();
        setParentOptions(res?.data ?? []);
      } catch {
        setParentOptions([]);
      }
    };
    fetchParents();
  }, []);

  useEffect(() => {
    if (viewMode === 'tree' && treeData.length === 0) {
      setTreeLoading(true);
      categoryService.getTree()
        .then((res) => setTreeData(res?.data ?? []))
        .catch(() => setTreeData([]))
        .finally(() => setTreeLoading(false));
    }
  }, [viewMode, treeData.length]);

  const fetchDeletedCategories = useCallback(async (search) => {
    setDeletedLoading(true);
    try {
      const res = await categoryService.getDeleted(search);
      setDeletedCategories(res?.data ?? []);
    } catch {
      setDeletedCategories([]);
    } finally {
      setDeletedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showDeleted) fetchDeletedCategories();
  }, [showDeleted, fetchDeletedCategories]);

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoreLoading(true);
    try {
      await categoryService.restore(restoreTarget.id);
      toast.success('Category restored successfully');
      setRestoreTarget(null);
      fetchDeletedCategories();
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to restore category');
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      toast.success('Category deleted successfully');
      setDeleteTarget(null);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete category';
      toast.error(msg);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateCategory(id);
      toast.success('Category activated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to activate');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateCategory(id);
      toast.success('Category deactivated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      ACTIVE:   { variant: 'success', label: 'Active' },
      INACTIVE: { variant: 'danger',  label: 'Inactive' },
    };
    const cfg = map[status] || { variant: 'default', label: status };
    return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
  };

  const getSortIndicator = (field) => {
    if (sortBy !== field) return null;
    return <span className="ml-1 text-xs">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
  };

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer select-none hover:text-primary-500 transition-colors';

  return (
    <PageWrapper>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Categories</h1>
            <p className="page-subtitle">Organize products into hierarchical categories</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'table' ? 'primary' : 'ghost'} size="sm" onClick={() => { setViewMode('table'); setShowDeleted(false); }}>
              <MdTableRows size={18} />
            </Button>
            <Button variant={viewMode === 'card' ? 'primary' : 'ghost'} size="sm" onClick={() => { setViewMode('card'); setShowDeleted(false); }}>
              <MdGridView size={18} />
            </Button>
            <Button variant={viewMode === 'tree' ? 'primary' : 'ghost'} size="sm" onClick={() => { setViewMode('tree'); setShowDeleted(false); }}>
              <MdAccountTree size={18} />
            </Button>
            <Button
              variant={showDeleted ? 'danger' : 'ghost'}
              size="sm"
              leftIcon={<MdRestoreFromTrash size={16} />}
              onClick={() => setShowDeleted(!showDeleted)}
            >
              Deleted
            </Button>
            {!showDeleted && (
              <Button variant="primary" leftIcon={<MdAdd />} onClick={() => navigate('/categories/new')}>
                Add Category
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Card className="mb-4">
            <p className="text-danger-500 text-sm">{error}</p>
            <Button variant="ghost" size="sm" onClick={refresh} className="mt-2">Retry</Button>
          </Card>
        )}

        <Card>
          {showDeleted ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Deleted Categories</h2>
                  <p className="text-xs text-surface-500">Restore soft-deleted categories to bring them back</p>
                </div>
                <Search
                  value=""
                  onChange={(e) => fetchDeletedCategories(e.target.value)}
                  placeholder="Search deleted…"
                  className="w-64"
                />
              </div>
              {deletedLoading ? (
                <CategorySkeleton viewMode="table" count={3} />
              ) : deletedCategories.length === 0 ? (
                <div className="text-center py-12 text-surface-400 dark:text-surface-500">
                  <MdRestoreFromTrash size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No deleted categories</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedCategories.map((cat) => (
                        <tr key={cat.id} className="border-b border-surface-100 dark:border-surface-800 opacity-70">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                <MdCategory size={14} className="text-surface-400" />
                              </div>
                              <span className="text-sm font-medium text-surface-600 dark:text-surface-300 line-through">{cat.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-surface-400">{cat.code}</td>
                          <td className="px-4 py-3">
                            <Badge variant="surface" size="sm">Deleted</Badge>
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-success-500"
                              leftIcon={<MdRestoreFromTrash size={14} />}
                              onClick={() => setRestoreTarget(cat)}
                            >
                              Restore
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 mb-4">
                <Search value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories…" className="w-72" />
                <select
                  value={statusFilter ?? ''}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className="px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-300"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <select
                  value={parentId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setParentId(val === '' ? null : val === 'root' ? 0 : Number(val));
                  }}
                  className="px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-300"
                >
                  <option value="">All Parents</option>
                  <option value="root">Root (no parent)</option>
                  {parentOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {viewMode === 'tree' ? (
                <CategoryTree categories={treeData} loading={treeLoading} />
              ) : loading ? (
                <CategorySkeleton viewMode={viewMode} count={5} />
              ) : categories.length === 0 ? (
                <div className="text-center py-12 text-surface-400 dark:text-surface-500">
                  <MdCategory size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No categories found</p>
                </div>
              ) : viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className={thClass} onClick={() => setSortBy('name')}>Name{getSortIndicator('name')}</th>
                        <th className={thClass} onClick={() => setSortBy('code')}>Code{getSortIndicator('code')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Parent</th>
                        <th className={thClass} onClick={() => setSortBy('sortOrder')}>Order{getSortIndicator('sortOrder')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Products</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors cursor-pointer" onClick={() => navigate(`/categories/${cat.id}`)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
                                <MdCategory size={14} className="text-primary-500" />
                              </div>
                              <span className="text-sm font-medium text-surface-800 dark:text-surface-100">{cat.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-surface-500 dark:text-surface-400">{cat.code}</td>
                          <td className="px-4 py-3 text-sm text-surface-400">{cat.parentName ?? <span className="text-surface-300 dark:text-surface-600">—</span>}</td>
                          <td className="px-4 py-3 text-sm text-surface-500 dark:text-surface-400">{cat.sortOrder}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">{(cat.productCount ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3">{getStatusBadge(cat.status)}</td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="xs" onClick={() => navigate(`/categories/${cat.id}/edit`)}>Edit</Button>
                            {cat.status === 'ACTIVE' ? (
                              <Button variant="ghost" size="xs" className="ml-1 text-warning-500" onClick={() => handleDeactivate(cat.id)}>Deactivate</Button>
                            ) : (
                              <Button variant="ghost" size="xs" className="ml-1 text-success-500" onClick={() => handleActivate(cat.id)}>Activate</Button>
                            )}
                            <Button variant="ghost" size="xs" className="ml-1 text-danger-500" onClick={() => setDeleteTarget(cat)}>Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="border border-surface-200 dark:border-surface-700 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/categories/${cat.id}`)}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                          <MdCategory size={20} className="text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">{cat.name}</h3>
                          <p className="text-xs text-surface-400 font-mono">{cat.code}</p>
                        </div>
                        {getStatusBadge(cat.status)}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-surface-500 dark:text-surface-400 mb-3 line-clamp-2">{cat.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-surface-400 pt-3 border-t border-surface-100 dark:border-surface-800">
                        <span>{cat.parentName ? `Parent: ${cat.parentName}` : 'Root Category'}</span>
                        <span className="font-semibold text-surface-600 dark:text-surface-300">{(cat.productCount ?? 0)} products</span>
                      </div>
                      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="xs" className="flex-1" onClick={() => navigate(`/categories/${cat.id}/edit`)}>Edit</Button>
                        {cat.status === 'ACTIVE' ? (
                          <Button variant="ghost" size="xs" className="flex-1 text-warning-500" onClick={() => handleDeactivate(cat.id)}>Deactivate</Button>
                        ) : (
                          <Button variant="ghost" size="xs" className="flex-1 text-success-500" onClick={() => handleActivate(cat.id)}>Activate</Button>
                        )}
                        <Button variant="ghost" size="xs" className="flex-1 text-danger-500" onClick={() => setDeleteTarget(cat)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode !== 'tree' && (
                <Pagination page={page} pageSize={size} total={total} onPageChange={setPage} />
              )}
            </>
          )}
        </Card>

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmLabel="Delete Category"
        />

        <ConfirmDialog
          isOpen={!!restoreTarget}
          onClose={() => setRestoreTarget(null)}
          onConfirm={handleRestore}
          title="Restore Category"
          message={`Restore "${restoreTarget?.name}"? It will become active again.`}
          confirmLabel="Restore"
          confirmVariant="success"
          loading={restoreLoading}
        />
      </div>
    </PageWrapper>
  );
};

export default Categories;
