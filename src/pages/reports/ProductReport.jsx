import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowBack, MdInventory2, MdCategory, MdLocalShipping, MdSearch,
  MdFilterList, MdSort, MdFirstPage, MdLastPage, MdChevronLeft, MdChevronRight,
  MdWarning, MdRemoveShoppingCart, MdAttachMoney, MdDownload, MdTableChart
} from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import DoughnutChart from '@components/charts/DoughnutChart';
import BarChart from '@components/charts/BarChart';
import MetricCard from '@components/common/MetricCard';
import reportService from '@api/services/reportService';
import categoryService from '@api/services/categoryService';
import supplierService from '@api/services/supplierService';
import warehouseService from '@api/services/warehouseService';
import '@/components/charts/chartConfig';

const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('en-IN');
const fmtCurrency = (n) => n == null ? '—' : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const TABS = [
  { id: 'overview', label: 'Overview', icon: MdInventory2 },
  { id: 'products', label: 'All Products', icon: MdInventory2 },
  { id: 'topProducts', label: 'Top Products', icon: MdAttachMoney },
  { id: 'recent', label: 'Recent Products', icon: MdInventory2 },
];

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'DISCONTINUED'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'sku', label: 'SKU' },
  { value: 'sellingPrice', label: 'Price' },
  { value: 'currentStock', label: 'Stock' },
  { value: 'createdAt', label: 'Date Added' },
];

const STATUS_BADGE = { ACTIVE: 'success', INACTIVE: 'warning', DISCONTINUED: 'danger' };

const ProductReport = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const params = { page, size, sortBy, sortDir };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (supplierId) params.supplierId = supplierId;
      if (status) params.status = status;
      if (warehouseId) params.warehouseId = warehouseId;
      await reportService.exportProductPdf(params);
      toast.success('Product report PDF downloaded');
    } catch {
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const params = { page, size, sortBy, sortDir };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (supplierId) params.supplierId = supplierId;
      if (status) params.status = status;
      if (warehouseId) params.warehouseId = warehouseId;
      await reportService.exportProductExcel(params);
      toast.success('Product report Excel downloaded');
    } catch {
      toast.error('Failed to export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [catRes, supRes, whRes] = await Promise.all([
        categoryService.getAll({ size: 100 }),
        supplierService.getAll({ size: 100 }),
        warehouseService.getAll({ size: 100 }),
      ]);
      setCategories(catRes?.data?.content || catRes?.data || []);
      setSuppliers(supRes?.data?.content || supRes?.data || []);
      setWarehouses(whRes?.data?.content || whRes?.data || []);
    } catch {
      // silent
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortBy, sortDir, page, size };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (supplierId) params.supplierId = supplierId;
      if (status) params.status = status;
      if (warehouseId) params.warehouseId = warehouseId;
      const res = await reportService.getProductReport(params);
      setData(res?.data);
    } catch {
      toast.error('Failed to load product report');
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, supplierId, status, warehouseId, sortBy, sortDir, page, size]);

  useEffect(() => { fetchDropdowns(); }, [fetchDropdowns]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterReset = () => {
    setSearch('');
    setCategoryId('');
    setSupplierId('');
    setStatus('');
    setWarehouseId('');
    setSortBy('name');
    setSortDir('asc');
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading && !data) {
    return (
      <PageWrapper>
        <div className="page-container max-w-6xl">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-surface-200 dark:bg-surface-700 rounded" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-surface-200 dark:bg-surface-700 rounded-xl" />)}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!data) return null;

  const catLabels = data.categoryBreakdown?.map(c => c.categoryName) ?? [];
  const catCounts = data.categoryBreakdown?.map(c => c.productCount) ?? [];
  const catValues = data.categoryBreakdown?.map(c => Number(c.totalValue) || 0) ?? [];
  const statusLabels = data.statusBreakdown?.map(s => s.status) ?? [];
  const statusCounts = data.statusBreakdown?.map(s => s.count) ?? [];
  const supLabels = data.supplierBreakdown?.slice(0, 8).map(s => s.supplierName) ?? [];
  const supCounts = data.supplierBreakdown?.slice(0, 8).map(s => s.productCount) ?? [];

  return (
    <PageWrapper>
      <div className="page-container max-w-6xl">
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/reports')} className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-500 transition-colors mb-1">
              <MdArrowBack size={14} /> Back to Reports
            </button>
            <h1 className="page-title">Product Report</h1>
            <p className="page-subtitle">Catalog analytics and breakdowns</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              <MdDownload size={14} />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-success-500 text-white hover:bg-success-600 transition-colors disabled:opacity-50"
            >
              <MdTableChart size={14} />
              {exportingExcel ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
          <MdFilterList size={16} className="text-surface-400" />
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <MdSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search name or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="h-8 w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
            className="h-8 text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={supplierId}
            onChange={(e) => { setSupplierId(e.target.value); setPage(0); }}
            className="h-8 text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="h-8 text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={warehouseId}
            onChange={(e) => { setWarehouseId(e.target.value); setPage(0); }}
            className="h-8 text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <MdSort size={14} className="text-surface-400" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
              className="h-8 text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="h-8 px-2 text-xs rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleFilterReset}>Reset</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW TAB ───────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard icon={MdInventory2} label="Total Products" value={fmt(data.statistics?.totalProducts)} color="primary" />
              <MetricCard icon={MdInventory2} label="Active" value={fmt(data.statistics?.activeProducts)} color="success" />
              <MetricCard icon={MdWarning} label="Low Stock" value={fmt(data.statistics?.lowStockCount)} color="warning" />
              <MetricCard icon={MdRemoveShoppingCart} label="Out of Stock" value={fmt(data.statistics?.outOfStockCount)} color="danger" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard icon={MdAttachMoney} label="Catalog Value" value={fmtCurrency(data.statistics?.totalCatalogValue)} color="info" />
              <MetricCard icon={MdAttachMoney} label="Avg Price" value={fmtCurrency(data.statistics?.averagePrice)} color="primary" />
              <MetricCard icon={MdLocalShipping} label="No Supplier" value={fmt(data.statistics?.productsWithoutSupplier)} color="warning" />
              <MetricCard icon={MdCategory} label="Categories" value={fmt(data.statistics?.categoryCount)} color="info" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Products by Category" subtitle="Distribution">
                {catLabels.length > 0 ? (
                  <DoughnutChart labels={catLabels} data={catCounts} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Category Values" subtitle="₹ value per category">
                {catLabels.length > 0 ? (
                  <BarChart labels={catLabels} datasets={[{ label: 'Value (₹)', data: catValues }]} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Status Breakdown" subtitle="By product status">
                {statusLabels.length > 0 ? (
                  <BarChart labels={statusLabels} datasets={[{ label: 'Products', data: statusCounts }]} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Products by Supplier" subtitle="Top suppliers by product count">
                {supLabels.length > 0 ? (
                  <BarChart labels={supLabels} datasets={[{ label: 'Products', data: supCounts }]} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>

            {/* Category Breakdown Table */}
            <Card title="Category Breakdown" subtitle="Detailed category statistics" className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Category</th>
                      <th className="pb-2 font-medium text-right">Products</th>
                      <th className="pb-2 font-medium text-right">Total Stock</th>
                      <th className="pb-2 font-medium text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.categoryBreakdown?.map((c, i) => (
                      <tr key={i} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                        <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{c.categoryName}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(c.productCount)}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(c.totalStock)}</td>
                        <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(c.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* ─── ALL PRODUCTS TAB ───────────────────────────────── */}
        {activeTab === 'products' && data.products && (
          <Card title="All Products" subtitle={`Showing ${data.products.items?.length || 0} of ${data.products.totalElements} products`}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                    <th className="pb-2 font-medium cursor-pointer hover:text-primary-500" onClick={() => handleSort('name')}>
                      Product{renderSortIcon('name')}
                    </th>
                    <th className="pb-2 font-medium cursor-pointer hover:text-primary-500" onClick={() => handleSort('sku')}>
                      SKU{renderSortIcon('sku')}
                    </th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Supplier</th>
                    <th className="pb-2 font-medium">Warehouse</th>
                    <th className="pb-2 font-medium text-right cursor-pointer hover:text-primary-500" onClick={() => handleSort('currentStock')}>
                      Stock{renderSortIcon('currentStock')}
                    </th>
                    <th className="pb-2 font-medium text-right cursor-pointer hover:text-primary-500" onClick={() => handleSort('sellingPrice')}>
                      Price{renderSortIcon('sellingPrice')}
                    </th>
                    <th className="pb-2 font-medium text-right">Value</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.items?.map((p) => (
                    <tr key={p.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <td className="py-2">
                        <p className="font-medium text-surface-800 dark:text-surface-100">{p.name}</p>
                      </td>
                      <td className="py-2 font-mono text-surface-500">{p.sku}</td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{p.categoryName || '—'}</td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{p.supplierName || '—'}</td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{p.warehouseName || '—'}</td>
                      <td className="py-2 text-right">
                        <Badge variant={p.currentStock <= (p.reorderLevel || 0) ? 'danger' : 'success'} size="sm">
                          {p.currentStock}
                        </Badge>
                      </td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmtCurrency(p.sellingPrice)}</td>
                      <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(p.stockValue)}</td>
                      <td className="py-2 text-right">
                        <Badge variant={STATUS_BADGE[p.status] || 'surface'} size="sm">{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.products.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-200 dark:border-surface-700">
                <p className="text-xs text-surface-400">
                  Page {data.products.page + 1} of {data.products.totalPages} ({fmt(data.products.totalElements)} items)
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(0)} disabled={page === 0} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30">
                    <MdFirstPage size={16} />
                  </button>
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30">
                    <MdChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-surface-600 dark:text-surface-400 px-2">{page + 1} / {data.products.totalPages}</span>
                  <button onClick={() => setPage(Math.min(data.products.totalPages - 1, page + 1))} disabled={page >= data.products.totalPages - 1} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30">
                    <MdChevronRight size={16} />
                  </button>
                  <button onClick={() => setPage(data.products.totalPages - 1)} disabled={page >= data.products.totalPages - 1} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30">
                    <MdLastPage size={16} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ─── TOP PRODUCTS TAB ───────────────────────────────── */}
        {activeTab === 'topProducts' && (
          <Card title="Top Products by Value" subtitle="Highest inventory value products">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Supplier</th>
                    <th className="pb-2 font-medium text-right">Stock</th>
                    <th className="pb-2 font-medium text-right">Price</th>
                    <th className="pb-2 font-medium text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProductsByPrice?.map((p, i) => (
                    <tr key={p.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <td className="py-2 text-surface-400">{i + 1}</td>
                      <td className="py-2">
                        <p className="font-medium text-surface-800 dark:text-surface-100">{p.name}</p>
                        <p className="text-[10px] text-surface-400 font-mono">{p.sku}</p>
                      </td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{p.categoryName || '—'}</td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{p.supplierName || '—'}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{p.currentStock}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmtCurrency(p.sellingPrice)}</td>
                      <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(p.stockValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ─── RECENT PRODUCTS TAB ────────────────────────────── */}
        {activeTab === 'recent' && (
          <Card title="Recent Products" subtitle="Newly added products">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">SKU</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium text-right">Price</th>
                    <th className="pb-2 font-medium text-right">Stock</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentProducts?.map((p) => (
                    <tr key={p.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{p.name}</td>
                      <td className="py-2 font-mono text-surface-500">{p.sku}</td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{p.categoryName || '—'}</td>
                      <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(p.sellingPrice)}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{p.currentStock}</td>
                      <td className="py-2 text-right">
                        <Badge variant={STATUS_BADGE[p.status] || 'surface'} size="sm">{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default ProductReport;
