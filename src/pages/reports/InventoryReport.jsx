import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowBack, MdInventory, MdWarningAmber, MdShoppingCart, MdCategory,
  MdFilterList, MdSort, MdFirstPage, MdLastPage, MdChevronLeft, MdChevronRight,
  MdWarning, MdRemoveShoppingCart, MdAttachMoney, MdWarehouse, MdDownload, MdTableChart
} from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import BarChart from '@components/charts/BarChart';
import DoughnutChart from '@components/charts/DoughnutChart';
import MetricCard from '@components/common/MetricCard';
import reportService from '@api/services/reportService';
import warehouseService from '@api/services/warehouseService';
import '@/components/charts/chartConfig';

const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('en-IN');
const fmtCurrency = (n) => n == null ? '—' : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const TABS = [
  { id: 'overview', label: 'Overview', icon: MdInventory },
  { id: 'stock', label: 'Stock Report', icon: MdShoppingCart },
  { id: 'lowStock', label: 'Low Stock', icon: MdWarning },
  { id: 'outOfStock', label: 'Out of Stock', icon: MdRemoveShoppingCart },
  { id: 'value', label: 'Inventory Value', icon: MdAttachMoney },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'sku', label: 'SKU' },
  { value: 'currentStock', label: 'Stock' },
  { value: 'sellingPrice', label: 'Price' },
];

const InventoryReport = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [warehouses, setWarehouses] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Filters
  const [warehouseId, setWarehouseId] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const params = { page, size, sortBy, sortDir };
      if (warehouseId) params.warehouseId = warehouseId;
      await reportService.exportInventoryPdf(params);
      toast.success('Inventory report PDF downloaded');
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
      if (warehouseId) params.warehouseId = warehouseId;
      await reportService.exportInventoryExcel(params);
      toast.success('Inventory report Excel downloaded');
    } catch {
      toast.error('Failed to export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await warehouseService.getAll({ size: 100 });
      setWarehouses(res?.data?.content || res?.data || []);
    } catch {
      // silent
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sortBy,
        sortDir,
        page,
        size,
      };
      if (warehouseId) params.warehouseId = warehouseId;
      const res = await reportService.getInventoryReport(params);
      setData(res?.data);
    } catch {
      toast.error('Failed to load inventory report');
    } finally {
      setLoading(false);
    }
  }, [warehouseId, sortBy, sortDir, page, size]);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterReset = () => {
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
  const catValues = data.categoryBreakdown?.map(c => c.productCount) ?? [];
  const catValueValues = data.categoryBreakdown?.map(c => Number(c.totalValue) || 0) ?? [];
  const whLabels = data.warehouseBreakdown?.map(w => w.warehouseCode) ?? [];
  const whValues = data.warehouseBreakdown?.map(w => w.capacityUtilization) ?? [];

  return (
    <PageWrapper>
      <div className="page-container max-w-6xl">
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/reports')} className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-500 transition-colors mb-1">
              <MdArrowBack size={14} /> Back to Reports
            </button>
            <h1 className="page-title">Inventory Report</h1>
            <p className="page-subtitle">Stock levels, movements, and adjustments</p>
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
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
          <MdFilterList size={16} className="text-surface-400" />
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

          <Button variant="ghost" size="sm" onClick={handleFilterReset}>
            Reset
          </Button>

          {data.filters?.warehouseName && (
            <Badge variant="primary" size="sm">
              <MdWarehouse size={12} className="mr-1" />
              {data.filters.warehouseName}
            </Badge>
          )}
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
              <MetricCard icon={MdInventory} label="Total Products" value={fmt(data.totalProducts)} color="primary" />
              <MetricCard icon={MdShoppingCart} label="Total Stock" value={fmt(data.totalStockQuantity)} color="info" />
              <MetricCard icon={MdWarningAmber} label="Low Stock" value={fmt(data.lowStockCount)} color="warning" />
              <MetricCard icon={MdCategory} label="Inventory Value" value={fmtCurrency(data.totalInventoryValue)} color="success" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard icon={MdInventory} label="Active Products" value={fmt(data.activeProducts)} color="success" />
              <MetricCard icon={MdInventory} label="Out of Stock" value={fmt(data.outOfStockCount)} color="danger" />
              <MetricCard icon={MdInventory} label="Inactive" value={fmt(data.inactiveProducts)} color="surface" />
              <MetricCard icon={MdInventory} label="Avg Price" value={fmtCurrency(data.averageSellingPrice)} color="primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Products by Category" subtitle="Distribution across categories">
                {catLabels.length > 0 ? (
                  <DoughnutChart labels={catLabels} data={catValues} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Inventory Value by Category" subtitle="₹ value per category">
                {catLabels.length > 0 ? (
                  <BarChart labels={catLabels} datasets={[{ label: 'Value (₹)', data: catValueValues }]} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Warehouse Utilization" subtitle="% capacity used">
                {whLabels.length > 0 ? (
                  <BarChart labels={whLabels} datasets={[{ label: 'Utilization %', data: whValues }]} height={240} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Transactions" subtitle="Stock movements">
                {data.transactionSummary && (
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard icon={MdShoppingCart} label="Total Txns" value={fmt(data.transactionSummary.totalTransactions)} color="info" />
                    <MetricCard icon={MdShoppingCart} label="Stock In" value={fmt(data.transactionSummary.stockInCount)} color="success" />
                    <MetricCard icon={MdShoppingCart} label="Stock Out" value={fmt(data.transactionSummary.stockOutCount)} color="danger" />
                    <MetricCard icon={MdShoppingCart} label="Adjustments" value={fmt(data.transactionSummary.adjustmentCount)} color="warning" />
                  </div>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Top Products by Value" subtitle="Highest inventory value">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                        <th className="pb-2 font-medium">Product</th>
                        <th className="pb-2 font-medium text-right">Stock</th>
                        <th className="pb-2 font-medium text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProductsByValue?.slice(0, 8).map((p) => (
                        <tr key={p.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                          <td className="py-2">
                            <p className="font-medium text-surface-800 dark:text-surface-100">{p.name}</p>
                            <p className="text-[10px] text-surface-400 font-mono">{p.sku}</p>
                          </td>
                          <td className="py-2 text-right text-surface-600 dark:text-surface-300">{p.currentStock}</td>
                          <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(p.stockValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title="Reorder Alerts" subtitle="Products below reorder level">
                {data.reorderAlerts?.length === 0 ? (
                  <p className="text-sm text-surface-400 text-center py-6">No products need reordering</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                          <th className="pb-2 font-medium">Product</th>
                          <th className="pb-2 font-medium text-right">Stock</th>
                          <th className="pb-2 font-medium text-right">Reorder At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.reorderAlerts?.slice(0, 8).map((p) => (
                          <tr key={p.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                            <td className="py-2">
                              <p className="font-medium text-surface-800 dark:text-surface-100">{p.name}</p>
                              <p className="text-[10px] text-surface-400 font-mono">{p.sku}</p>
                            </td>
                            <td className="py-2 text-right">
                              <Badge variant="danger" size="sm">{p.currentStock}</Badge>
                            </td>
                            <td className="py-2 text-right text-surface-600 dark:text-surface-300">{p.reorderLevel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {/* ─── STOCK REPORT TAB ───────────────────────────────── */}
        {activeTab === 'stock' && data.stockReport && (
          <Card title="Stock Report" subtitle={`Showing ${data.stockReport.products?.length || 0} of ${data.stockReport.totalElements} products`}>
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
                    <th className="pb-2 font-medium">Warehouse</th>
                    <th className="pb-2 font-medium text-right cursor-pointer hover:text-primary-500" onClick={() => handleSort('currentStock')}>
                      Stock{renderSortIcon('currentStock')}
                    </th>
                    <th className="pb-2 font-medium text-right">Reserved</th>
                    <th className="pb-2 font-medium text-right cursor-pointer hover:text-primary-500" onClick={() => handleSort('sellingPrice')}>
                      Price{renderSortIcon('sellingPrice')}
                    </th>
                    <th className="pb-2 font-medium text-right">Value</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stockReport.products?.map((p) => (
                    <tr key={p.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <td className="py-2">
                        <p className="font-medium text-surface-800 dark:text-surface-100">{p.name}</p>
                      </td>
                      <td className="py-2 font-mono text-surface-500">{p.sku}</td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{p.categoryName || '—'}</td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{p.warehouseName || '—'}</td>
                      <td className="py-2 text-right">
                        <Badge variant={p.currentStock <= (p.reorderLevel || 0) ? 'danger' : 'success'} size="sm">
                          {p.currentStock}
                        </Badge>
                      </td>
                      <td className="py-2 text-right text-surface-500">{p.reservedStock || 0}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmtCurrency(p.sellingPrice)}</td>
                      <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(p.stockValue)}</td>
                      <td className="py-2 text-right">
                        <Badge variant={p.status === 'ACTIVE' ? 'success' : 'surface'} size="sm">{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.stockReport.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-200 dark:border-surface-700">
                <p className="text-xs text-surface-400">
                  Page {data.stockReport.page + 1} of {data.stockReport.totalPages} ({fmt(data.stockReport.totalElements)} items)
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30"
                  >
                    <MdFirstPage size={16} />
                  </button>
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30"
                  >
                    <MdChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-surface-600 dark:text-surface-400 px-2">
                    {page + 1} / {data.stockReport.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(data.stockReport.totalPages - 1, page + 1))}
                    disabled={page >= data.stockReport.totalPages - 1}
                    className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30"
                  >
                    <MdChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setPage(data.stockReport.totalPages - 1)}
                    disabled={page >= data.stockReport.totalPages - 1}
                    className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30"
                  >
                    <MdLastPage size={16} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ─── LOW STOCK TAB ──────────────────────────────────── */}
        {activeTab === 'lowStock' && data.lowStockReport && (
          <Card title="Low Stock Report" subtitle={`${data.lowStockReport.totalLowStock} products below reorder level`}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <MetricCard icon={MdWarning} label="Low Stock Items" value={fmt(data.lowStockReport.totalLowStock)} color="warning" />
              <MetricCard icon={MdInventory} label="Total Products" value={fmt(data.lowStockReport.totalProducts)} color="primary" />
              <MetricCard icon={MdAttachMoney} label="Reorder Value" value={fmtCurrency(data.lowStockReport.totalReorderValue)} color="info" />
            </div>

            {data.lowStockReport.products?.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-6">No products are below reorder level</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium">SKU</th>
                      <th className="pb-2 font-medium">Category</th>
                      <th className="pb-2 font-medium">Warehouse</th>
                      <th className="pb-2 font-medium text-right">Current Stock</th>
                      <th className="pb-2 font-medium text-right">Reorder Level</th>
                      <th className="pb-2 font-medium text-right">Stock Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowStockReport.products?.map((p) => (
                      <tr key={p.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                        <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{p.name}</td>
                        <td className="py-2 font-mono text-surface-500">{p.sku}</td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{p.categoryName || '—'}</td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{p.warehouseName || '—'}</td>
                        <td className="py-2 text-right">
                          <Badge variant="danger" size="sm">{p.currentStock}</Badge>
                        </td>
                        <td className="py-2 text-right text-surface-500">{p.reorderLevel}</td>
                        <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(p.stockValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* ─── OUT OF STOCK TAB ───────────────────────────────── */}
        {activeTab === 'outOfStock' && data.outOfStockReport && (
          <Card title="Out of Stock Report" subtitle={`${data.outOfStockReport.totalOutOfStock} products with zero stock`}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <MetricCard icon={MdRemoveShoppingCart} label="Out of Stock" value={fmt(data.outOfStockReport.totalOutOfStock)} color="danger" />
              <MetricCard icon={MdInventory} label="Total Products" value={fmt(data.outOfStockReport.totalProducts)} color="primary" />
            </div>

            {data.outOfStockReport.products?.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-6">All products are in stock</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium">SKU</th>
                      <th className="pb-2 font-medium">Category</th>
                      <th className="pb-2 font-medium">Warehouse</th>
                      <th className="pb-2 font-medium text-right">Reorder Level</th>
                      <th className="pb-2 font-medium text-right">Selling Price</th>
                      <th className="pb-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.outOfStockReport.products?.map((p) => (
                      <tr key={p.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                        <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{p.name}</td>
                        <td className="py-2 font-mono text-surface-500">{p.sku}</td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{p.categoryName || '—'}</td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{p.warehouseName || '—'}</td>
                        <td className="py-2 text-right text-surface-500">{p.reorderLevel}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmtCurrency(p.sellingPrice)}</td>
                        <td className="py-2 text-right">
                          <Badge variant="danger" size="sm">OUT OF STOCK</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* ─── INVENTORY VALUE TAB ─────────────────────────────── */}
        {activeTab === 'value' && data.inventoryValueReport && (
          <Card title="Inventory Value Report" subtitle="Value breakdown by category and warehouse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard icon={MdAttachMoney} label="Total Selling Value" value={fmtCurrency(data.inventoryValueReport.totalSellingValue)} color="success" />
              <MetricCard icon={MdAttachMoney} label="Total Purchase Value" value={fmtCurrency(data.inventoryValueReport.totalPurchaseValue)} color="info" />
              <MetricCard icon={MdAttachMoney} label="Potential Profit" value={fmtCurrency(data.inventoryValueReport.potentialProfit)} color="primary" />
              <MetricCard icon={MdCategory} label="Categories" value={fmt(data.inventoryValueReport.byCategory?.length)} color="surface" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Value by Category Chart */}
              <div>
                <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Value by Category</h3>
                {data.inventoryValueReport.byCategory?.length > 0 ? (
                  <BarChart
                    labels={data.inventoryValueReport.byCategory.map(c => c.categoryName)}
                    datasets={[
                      { label: 'Purchase Value', data: data.inventoryValueReport.byCategory.map(c => Number(c.purchaseValue) || 0) },
                      { label: 'Selling Value', data: data.inventoryValueReport.byCategory.map(c => Number(c.sellingValue) || 0) },
                    ]}
                    height={260}
                  />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </div>

              {/* Value by Warehouse Chart */}
              <div>
                <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Value by Warehouse</h3>
                {data.inventoryValueReport.byWarehouse?.length > 0 ? (
                  <BarChart
                    labels={data.inventoryValueReport.byWarehouse.map(w => w.warehouseCode)}
                    datasets={[
                      { label: 'Purchase Value', data: data.inventoryValueReport.byWarehouse.map(w => Number(w.purchaseValue) || 0) },
                      { label: 'Selling Value', data: data.inventoryValueReport.byWarehouse.map(w => Number(w.sellingValue) || 0) },
                    ]}
                    height={260}
                  />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </div>
            </div>

            {/* Category Value Table */}
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Category Breakdown</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium text-right">Products</th>
                    <th className="pb-2 font-medium text-right">Total Stock</th>
                    <th className="pb-2 font-medium text-right">Purchase Value</th>
                    <th className="pb-2 font-medium text-right">Selling Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.inventoryValueReport.byCategory?.map((c, i) => (
                    <tr key={i} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{c.categoryName}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(c.productCount)}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(c.totalStock)}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmtCurrency(c.purchaseValue)}</td>
                      <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(c.sellingValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Warehouse Value Table */}
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Warehouse Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                    <th className="pb-2 font-medium">Warehouse</th>
                    <th className="pb-2 font-medium">Code</th>
                    <th className="pb-2 font-medium text-right">Products</th>
                    <th className="pb-2 font-medium text-right">Total Stock</th>
                    <th className="pb-2 font-medium text-right">Purchase Value</th>
                    <th className="pb-2 font-medium text-right">Selling Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.inventoryValueReport.byWarehouse?.map((w, i) => (
                    <tr key={i} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{w.warehouseName}</td>
                      <td className="py-2 font-mono text-surface-500">{w.warehouseCode}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(w.productCount)}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(w.totalStock)}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmtCurrency(w.purchaseValue)}</td>
                      <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(w.sellingValue)}</td>
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

export default InventoryReport;
