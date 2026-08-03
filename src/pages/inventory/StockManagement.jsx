import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdInput, MdOutput, MdTune, MdRefresh,
  MdInventory, MdInfo,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Search from '@components/table/Search';
import Pagination from '@components/table/Pagination';
import inventoryService from '@api/services/inventoryService';
import productService from '@api/services/productService';
import warehouseService from '@api/services/warehouseService';

const TABS = [
  { key: 'stock-in',    label: 'Stock In',    icon: MdInput,  color: 'text-success-500' },
  { key: 'stock-out',   label: 'Stock Out',   icon: MdOutput, color: 'text-danger-500' },
  { key: 'adjustment',  label: 'Adjust',      icon: MdTune,   color: 'text-info-500' },
];

const fieldClass = 'w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all';
const labelClass = 'block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5';
const errorClass = 'text-xs text-danger-500 mt-1';

const StockLevelSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="data-table">
      <thead>
        <tr>
          {['Product', 'SKU', 'Current', 'Reserved', 'Available', 'Status'].map((h) => (
            <th key={h} className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-16" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-32" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-20" /></td>
            <td className="px-4 py-3 text-center"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3 text-center"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3 text-center"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3"><div className="h-6 bg-surface-200 dark:bg-surface-700 rounded-full animate-pulse w-16" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StockManagement = () => {
  const navigate = useNavigate();

  // ── Form state ──
  const [activeTab, setActiveTab] = useState('stock-in');
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    quantity: '',
    actualCount: '',
    unitCost: '',
    referenceNumber: '',
    batchNumber: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  // ── Stock levels state ──
  const [levels, setLevels] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [levelsPage, setLevelsPage] = useState(0);
  const [levelsTotal, setLevelsTotal] = useState(0);
  const [levelsSearch, setLevelsSearch] = useState('');
  const levelsSize = 15;

  // Load metadata
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
        toast.error('Failed to load form data');
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  // Load stock levels
  const fetchLevels = useCallback(async () => {
    setLevelsLoading(true);
    try {
      const params = {
        page: levelsPage,
        size: levelsSize,
        sort: 'currentStock',
        direction: 'desc',
        ...(levelsSearch ? { search: levelsSearch } : {}),
      };
      const warehouseId = formData.warehouseId;
      let res;
      if (warehouseId) {
        res = await inventoryService.getStockLevelsByWarehouse(warehouseId, params);
      } else {
        res = await inventoryService.getAll({ ...params, size: 1 });
        // Fallback: just show product list with stock info
        const prodRes = await productService.getAll({ page: levelsPage, size: levelsSize, sort: 'currentStock', direction: 'desc', ...(levelsSearch ? { search: levelsSearch } : {}) });
        const payload = prodRes?.data;
        const mapped = (payload?.content ?? []).map(p => ({
          productId: p.id,
          productName: p.name,
          productSku: p.sku,
          warehouseId: p.warehouseId,
          warehouseName: p.warehouseName || '—',
          currentStock: p.currentStock,
          reservedStock: p.reservedStock,
          availableStock: p.availableStock,
          reorderLevel: p.reorderLevel,
          lowStock: p.stockStatus === 'LOW_STOCK',
          outOfStock: p.stockStatus === 'OUT_OF_STOCK',
        }));
        setLevels(mapped);
        setLevelsTotal(payload?.totalElements ?? 0);
        setLevelsLoading(false);
        return;
      }
      const payload = res?.data;
      setLevels(payload?.content ?? []);
      setLevelsTotal(payload?.totalElements ?? 0);
    } catch {
      // silent
    } finally {
      setLevelsLoading(false);
    }
  }, [levelsPage, levelsSearch, formData.warehouseId]);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!formData.productId) e.productId = 'Product is required';
    if (!formData.warehouseId) e.warehouseId = 'Warehouse is required';
    if (activeTab !== 'adjustment') {
      if (!formData.quantity || parseInt(formData.quantity, 10) < 1) e.quantity = 'Quantity must be at least 1';
    }
    if (activeTab === 'adjustment') {
      if (formData.actualCount === '' || formData.actualCount === null) e.actualCount = 'Actual count is required';
      else if (parseInt(formData.actualCount, 10) < 0) e.actualCount = 'Cannot be negative';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const pid = parseInt(formData.productId, 10);
      const wid = parseInt(formData.warehouseId, 10);

      if (activeTab === 'stock-in') {
        await inventoryService.stockIn({
          productId: pid,
          warehouseId: wid,
          quantity: parseInt(formData.quantity, 10),
          unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null,
          referenceNumber: formData.referenceNumber || null,
          batchNumber: formData.batchNumber || null,
          reason: formData.reason || null,
        });
        toast.success('Stock received successfully');
      } else if (activeTab === 'stock-out') {
        await inventoryService.stockOut({
          productId: pid,
          warehouseId: wid,
          quantity: parseInt(formData.quantity, 10),
          referenceNumber: formData.referenceNumber || null,
          reason: formData.reason || null,
        });
        toast.success('Stock dispatched successfully');
      } else {
        await inventoryService.adjustStock({
          productId: pid,
          warehouseId: wid,
          actualCount: parseInt(formData.actualCount, 10),
          reason: formData.reason || null,
        });
        toast.success('Stock adjusted successfully');
      }

      setFormData(prev => ({ ...prev, quantity: '', actualCount: '', unitCost: '', referenceNumber: '', batchNumber: '', reason: '' }));
      fetchLevels();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const stockStatus = (item) => {
    if (item.outOfStock) return { variant: 'danger', label: 'Out of Stock' };
    if (item.lowStock)   return { variant: 'warning', label: 'Low Stock' };
    return { variant: 'success', label: 'In Stock' };
  };

  return (
    <PageWrapper>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Stock Management</h1>
            <p className="page-subtitle">Quick stock operations — receive, dispatch, adjust, and monitor levels</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Operations Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Stock Operation" subtitle="Perform a quick stock action">
              {/* Tab bar */}
              <div className="flex gap-1 mb-5 p-1 bg-surface-100 dark:bg-surface-700/50 rounded-xl">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === tab.key
                          ? 'bg-white dark:bg-surface-800 shadow-sm text-surface-800 dark:text-surface-100'
                          : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                      }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      <Icon size={14} className={activeTab === tab.key ? tab.color : ''} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {loadingMeta ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded mb-1.5" />
                      <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Product */}
                  <div>
                    <label className={labelClass}>Product *</label>
                    <select
                      value={formData.productId}
                      onChange={(e) => handleFieldChange('productId', e.target.value)}
                      className={fieldClass}
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                    {errors.productId && <p className={errorClass}>{errors.productId}</p>}
                  </div>

                  {/* Warehouse */}
                  <div>
                    <label className={labelClass}>Warehouse *</label>
                    <select
                      value={formData.warehouseId}
                      onChange={(e) => handleFieldChange('warehouseId', e.target.value)}
                      className={fieldClass}
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                    {errors.warehouseId && <p className={errorClass}>{errors.warehouseId}</p>}
                  </div>

                  {/* Quantity or Actual Count */}
                  {activeTab === 'adjustment' ? (
                    <div>
                      <label className={labelClass}>Actual Physical Count *</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.actualCount}
                        onChange={(e) => handleFieldChange('actualCount', e.target.value)}
                        className={fieldClass}
                        placeholder="Count from physical audit"
                      />
                      {errors.actualCount && <p className={errorClass}>{errors.actualCount}</p>}
                    </div>
                  ) : (
                    <div>
                      <label className={labelClass}>Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleFieldChange('quantity', e.target.value)}
                        className={fieldClass}
                        placeholder="Enter quantity"
                      />
                      {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
                    </div>
                  )}

                  {/* Unit Cost (stock-in only) */}
                  {activeTab === 'stock-in' && (
                    <div>
                      <label className={labelClass}>Unit Cost (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.unitCost}
                        onChange={(e) => handleFieldChange('unitCost', e.target.value)}
                        className={fieldClass}
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {/* Reference Number */}
                  <div>
                    <label className={labelClass}>Reference Number</label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) => handleFieldChange('referenceNumber', e.target.value)}
                      className={fieldClass}
                      placeholder={activeTab === 'stock-in' ? 'PO-001' : 'ORD-123'}
                    />
                  </div>

                  {/* Batch Number (stock-in only) */}
                  {activeTab === 'stock-in' && (
                    <div>
                      <label className={labelClass}>Batch Number</label>
                      <input
                        type="text"
                        value={formData.batchNumber}
                        onChange={(e) => handleFieldChange('batchNumber', e.target.value)}
                        className={fieldClass}
                        placeholder="LOT-2024-001"
                      />
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className={labelClass}>Reason</label>
                    <input
                      type="text"
                      value={formData.reason}
                      onChange={(e) => handleFieldChange('reason', e.target.value)}
                      className={fieldClass}
                      placeholder={activeTab === 'adjustment' ? 'Cycle count discrepancy' : 'Optional reason'}
                    />
                  </div>

                  <Button
                    variant={activeTab === 'stock-in' ? 'success' : activeTab === 'stock-out' ? 'danger' : 'primary'}
                    type="submit"
                    isLoading={submitting}
                    className="w-full"
                  >
                    {activeTab === 'stock-in' ? 'Receive Stock' : activeTab === 'stock-out' ? 'Dispatch Stock' : 'Adjust Stock'}
                  </Button>
                </form>
              )}
            </Card>

            {/* Quick Help */}
            <Card padding="sm">
              <div className="flex items-start gap-2">
                <MdInfo size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-surface-500 dark:text-surface-400 space-y-1">
                  <p><strong>Stock In:</strong> Record incoming goods from suppliers or returns.</p>
                  <p><strong>Stock Out:</strong> Dispatch stock for orders. Validates sufficient stock.</p>
                  <p><strong>Adjust:</strong> Correct stock to match physical count. Calculates the difference automatically.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Stock Levels Panel */}
          <div className="lg:col-span-2">
            <Card
              title="Stock Levels"
              subtitle={formData.warehouseId ? `Products in selected warehouse` : 'All products across warehouses'}
              headerAction={
                <Button variant="ghost" size="sm" leftIcon={<MdRefresh />} onClick={fetchLevels} disabled={levelsLoading}>
                  Refresh
                </Button>
              }
            >
              <div className="mb-4">
                <Search
                  value={levelsSearch}
                  onChange={(e) => { setLevelsSearch(e.target.value); setLevelsPage(0); }}
                  placeholder="Search by product name or SKU…"
                  className="w-full sm:w-80"
                />
              </div>

              {levelsLoading ? (
                <StockLevelSkeleton />
              ) : levels.length === 0 ? (
                <div className="text-center py-12">
                  <MdInventory size={32} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
                  <p className="text-sm text-surface-500">
                    {levelsSearch ? 'No products match your search' : 'No products found'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">SKU</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Current</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Reserved</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Available</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {levels.map((item) => {
                        const st = stockStatus(item);
                        return (
                          <tr
                            key={item.productId}
                            className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors cursor-pointer"
                            onClick={() => navigate(`/products/${item.productId}`)}
                          >
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-surface-800 dark:text-surface-100">{item.productName}</p>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-surface-400">{item.productSku}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-bold ${item.currentStock <= 0 ? 'text-danger-500' : 'text-surface-800 dark:text-surface-100'}`}>
                                {item.currentStock?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-surface-400">{item.reservedStock?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-bold ${item.availableStock <= 0 ? 'text-danger-500' : 'text-success-600 dark:text-success-400'}`}>
                                {item.availableStock?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={st.variant} dot>{st.label}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <Pagination page={levelsPage} pageSize={levelsSize} total={levelsTotal} onPageChange={setLevelsPage} />
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default StockManagement;
