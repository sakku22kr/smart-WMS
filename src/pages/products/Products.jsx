import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdInventory2, MdAdd, MdDelete, MdEdit, MdVisibility, MdClose, MdRefresh } from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Search from '@components/table/Search';
import Pagination from '@components/table/Pagination';
import ConfirmDialog from '@components/common/ConfirmDialog';
import useProducts from '@hooks/useProducts';
import productService from '@api/services/productService';
import categoryService from '@api/services/categoryService';
import supplierService from '@api/services/supplierService';
import warehouseService from '@api/services/warehouseService';
import toast from 'react-hot-toast';

const STATUS_BADGE = { ACTIVE: 'success', INACTIVE: 'warning', DISCONTINUED: 'danger' };
const STATUS_LABEL = { ACTIVE: 'Active', INACTIVE: 'Inactive', DISCONTINUED: 'Discontinued' };

const selectClass = 'px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-200';

const TableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="data-table">
      <thead>
        <tr>
          {['Product', 'SKU', 'Category', 'Brand', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
            <th key={h} className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-16" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 8 }).map((_, i) => (
          <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
            <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-surface-200 dark:bg-surface-700 animate-pulse" /><div className="space-y-1.5"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-32" /><div className="h-3 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-20" /></div></div></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-16" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-20" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-16" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3"><div className="h-6 bg-surface-200 dark:bg-surface-700 rounded-full animate-pulse w-16" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-20 ml-auto" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EmptyState = ({ hasFilters, onClearFilters }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
      <MdInventory2 size={32} className="text-surface-300 dark:text-surface-600" />
    </div>
    <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">No products found</h3>
    <p className="text-xs text-surface-400 dark:text-surface-500 mb-4">
      {hasFilters ? 'Try adjusting your search or filters' : 'Get started by adding your first product'}
    </p>
    {hasFilters ? (
      <Button variant="secondary" size="sm" leftIcon={<MdClose />} onClick={onClearFilters}>Clear Filters</Button>
    ) : (
      <Button variant="primary" size="sm" leftIcon={<MdAdd />} onClick={() => navigate('/products/create')}>Add Product</Button>
    )}
  </div>
);

const Products = () => {
  const navigate = useNavigate();
  const {
    products, total, loading, error,
    page, setPage, size,
    search, setSearch,
    sortBy, setSortBy, sortDir,
    statusFilter, setStatusFilter,
    categoryId, setCategoryId,
    supplierId, setSupplierId,
    warehouseId, setWarehouseId,
    refresh,
  } = useProducts({ initialSort: 'name', initialDir: 'asc' });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, supRes, warRes] = await Promise.all([
          categoryService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          supplierService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          warehouseService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
        ]);
        setCategories(catRes?.data?.content ?? []);
        setSuppliers(supRes?.data?.content ?? []);
        setWarehouses(warRes?.data?.content ?? []);
      } catch {
        // filter dropdowns will be empty
      }
    };
    loadFilters();
  }, []);

  const handleDeleteClick = (product) => setDeleteTarget(product);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productService.delete(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" has been deleted`);
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter(null);
    setCategoryId(null);
    setSupplierId(null);
    setWarehouseId(null);
  };

  const hasActiveFilters = search || statusFilter || categoryId || supplierId || warehouseId;

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer select-none hover:text-primary-500 transition-colors';
  const thClassRight = thClass + ' text-right';
  const thClassCenter = thClass + ' text-center';

  const getSortIndicator = (field) => {
    if (sortBy !== field) return <span className="ml-1 text-xs text-surface-300 dark:text-surface-600">⇅</span>;
    return <span className="ml-1 text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  const activeFilterCount = [statusFilter, categoryId, supplierId, warehouseId].filter(Boolean).length;

  return (
    <PageWrapper>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">Manage your product catalog</p>
          </div>
          <Button variant="primary" leftIcon={<MdAdd />} onClick={() => navigate('/products/create')}>
            Add Product
          </Button>
        </div>

        {error && (
          <Card className="mb-4">
            <p className="text-danger-500 text-sm">{error}</p>
            <Button variant="ghost" size="sm" onClick={refresh} className="mt-2">Retry</Button>
          </Card>
        )}

        <Card>
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, SKU, barcode..."
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={statusFilter ?? ''} onChange={(e) => setStatusFilter(e.target.value || null)} className={selectClass}>
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
              <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)} className={selectClass}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={supplierId ?? ''} onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : null)} className={selectClass}>
                <option value="">All Suppliers</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={warehouseId ?? ''} onChange={(e) => setWarehouseId(e.target.value ? Number(e.target.value) : null)} className={selectClass}>
                <option value="">All Warehouses</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-danger-500 hover:bg-danger-500/10 transition-colors"
                >
                  <MdClose size={14} /> Clear {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
              )}
              <button
                onClick={refresh}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <MdRefresh size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : products.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className={thClass} onClick={() => setSortBy('name')}>Product{getSortIndicator('name')}</th>
                    <th className={thClass} onClick={() => setSortBy('sku')}>SKU{getSortIndicator('sku')}</th>
                    <th className={thClass} onClick={() => setSortBy('category')}>Category{getSortIndicator('category')}</th>
                    <th className={thClass} onClick={() => setSortBy('brand')}>Brand{getSortIndicator('brand')}</th>
                    <th className={thClassRight} onClick={() => setSortBy('sellingPrice')}>Price{getSortIndicator('sellingPrice')}</th>
                    <th className={thClassCenter} onClick={() => setSortBy('currentStock')}>Stock{getSortIndicator('currentStock')}</th>
                    <th className={thClass} onClick={() => setSortBy('status')}>Status{getSortIndicator('status')}</th>
                    <th className={thClassRight}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors cursor-pointer"
                      onClick={() => navigate(`/products/${p.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                            <MdInventory2 size={16} className="text-primary-500" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-surface-800 dark:text-surface-100 max-w-[180px] truncate block">{p.name}</span>
                            {p.brand && <span className="text-xs text-surface-400">{p.brand}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-surface-500 dark:text-surface-400">{p.sku}</td>
                      <td className="px-4 py-3 text-sm text-surface-500 dark:text-surface-400">{p.categoryName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-surface-500 dark:text-surface-400">{p.brand || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-sm text-surface-800 dark:text-surface-100">₹{p.sellingPrice?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${p.lowStock ? 'text-yellow-500' : p.outOfStock ? 'text-red-500' : 'text-surface-800 dark:text-surface-100'}`}>
                          {p.currentStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[p.status]} dot>{STATUS_LABEL[p.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="xs" leftIcon={<MdVisibility />} onClick={() => navigate(`/products/${p.id}`)} />
                          <Button variant="ghost" size="xs" leftIcon={<MdEdit />} onClick={() => navigate(`/products/${p.id}/edit`)} />
                          <Button variant="ghost" size="xs" leftIcon={<MdDelete />} onClick={() => handleDeleteClick(p)} className="text-red-500 hover:text-red-600" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination page={page} pageSize={size} total={total} onPageChange={setPage} />
        </Card>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action can be reversed by restoring the product.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </PageWrapper>
  );
};

export default Products;
