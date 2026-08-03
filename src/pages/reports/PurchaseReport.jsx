import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowBack, MdShoppingCart, MdTrendingUp, MdLocalShipping,
  MdSearch, MdSort, MdFirstPage, MdLastPage, MdChevronLeft, MdChevronRight,
  MdAttachMoney, MdCheckCircle, MdCancel, MdDownload, MdTableChart
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
import supplierService from '@api/services/supplierService';
import warehouseService from '@api/services/warehouseService';
import '@/components/charts/chartConfig';

const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('en-IN');
const fmtCurrency = (n) => n == null ? '—' : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const TABS = [
  { id: 'overview', label: 'Overview', icon: MdShoppingCart },
  { id: 'orders', label: 'All Orders', icon: MdShoppingCart },
  { id: 'trends', label: 'Monthly Trends', icon: MdTrendingUp },
  { id: 'suppliers', label: 'Top Suppliers', icon: MdLocalShipping },
];

const PO_STATUS_BADGE = { DRAFT: 'surface', PENDING: 'warning', APPROVED: 'info', REJECTED: 'danger', ORDERED: 'primary', PARTIALLY_RECEIVED: 'warning', RECEIVED: 'success', COMPLETED: 'success', CANCELLED: 'danger' };
const STATUS_OPTIONS = ['DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'COMPLETED', 'CANCELLED'];
const SORT_OPTIONS = [
  { value: 'orderDate', label: 'Order Date' },
  { value: 'totalAmount', label: 'Amount' },
  { value: 'status', label: 'Status' },
  { value: 'supplier', label: 'Supplier' },
];

const PurchaseReport = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const [search, setSearch] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const params = { page, size, sortBy, sortDir };
      if (search) params.search = search;
      if (supplierId) params.supplierId = supplierId;
      if (warehouseId) params.warehouseId = warehouseId;
      if (status) params.status = status;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      await reportService.exportPurchasePdf(params);
      toast.success('Purchase report PDF downloaded');
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
      if (supplierId) params.supplierId = supplierId;
      if (warehouseId) params.warehouseId = warehouseId;
      if (status) params.status = status;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      await reportService.exportPurchaseExcel(params);
      toast.success('Purchase report Excel downloaded');
    } catch {
      toast.error('Failed to export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [supRes, whRes] = await Promise.all([
        supplierService.getAll({ size: 200 }),
        warehouseService.getAll({ size: 200 }),
      ]);
      setSuppliers(supRes?.data?.content || []);
      setWarehouses(whRes?.data?.content || []);
    } catch { /* ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size };
      if (search) params.search = search;
      if (supplierId) params.supplierId = supplierId;
      if (warehouseId) params.warehouseId = warehouseId;
      if (status) params.status = status;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (sortBy) params.sortBy = sortBy;
      if (sortDir) params.sortDir = sortDir;

      const res = await reportService.getPurchaseReport(params);
      setData(res?.data);
    } catch {
      toast.error('Failed to load purchase report');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, supplierId, warehouseId, status, dateFrom, dateTo, sortBy, sortDir]);

  useEffect(() => { fetchDropdowns(); }, [fetchDropdowns]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
    setPage(0);
  };

  const clearFilters = () => {
    setSearch(''); setSupplierId(''); setWarehouseId(''); setStatus('');
    setDateFrom(''); setDateTo(''); setSortBy('orderDate'); setSortDir('desc'); setPage(0);
  };

  const hasActiveFilters = search || supplierId || warehouseId || status || dateFrom || dateTo;

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

  const statusLabels = data.statusBreakdown?.map(s => s.status) ?? [];
  const statusCounts = data.statusBreakdown?.map(s => s.count) ?? [];
  const monthlyLabels = data.monthlyTrend?.map(m => m.month) ?? [];
  const monthlyCounts = data.monthlyTrend?.map(m => m.orderCount) ?? [];
  const monthlyValues = data.monthlyTrend?.map(m => Number(m.totalValue) || 0) ?? [];
  const monthlyCompleted = data.monthlyTrend?.map(m => m.completedCount) ?? [];
  const monthlyPending = data.monthlyTrend?.map(m => m.pendingCount) ?? [];
  const supLabels = data.topSuppliers?.slice(0, 8).map(s => s.supplierName) ?? [];
  const supValues = data.topSuppliers?.slice(0, 8).map(s => Number(s.totalValue) || 0) ?? [];

  return (
    <PageWrapper>
      <div className="page-container max-w-6xl">
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/reports')} className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-500 transition-colors mb-1">
              <MdArrowBack size={14} /> Back to Reports
            </button>
            <h1 className="page-title">Purchase Report</h1>
            <p className="page-subtitle">Purchase orders and spending trends</p>
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
              <MetricCard icon={MdShoppingCart} label="Total Orders" value={fmt(data.statistics?.totalOrders || data.totalOrders)} color="primary" />
              <MetricCard icon={MdAttachMoney} label="Total Value" value={fmtCurrency(data.statistics?.totalValue || data.totalValue)} color="success" />
              <MetricCard icon={MdAttachMoney} label="Avg Order Value" value={fmtCurrency(data.statistics?.averageOrderValue || data.averageOrderValue)} color="info" />
              <MetricCard icon={MdShoppingCart} label="Active Orders" value={fmt(data.statistics?.activeCount || data.activeCount)} color="warning" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard icon={MdCheckCircle} label="Completed" value={fmt(data.statistics?.completedCount || data.completedCount)} color="success" />
              <MetricCard icon={MdShoppingCart} label="Pending" value={fmt(data.statistics?.pendingCount || data.pendingCount)} color="warning" />
              <MetricCard icon={MdCancel} label="Cancelled" value={fmt(data.statistics?.cancelledCount || data.cancelledCount)} color="danger" />
              <MetricCard icon={MdShoppingCart} label="Draft" value={fmt(data.statistics?.draftCount || data.draftCount)} color="surface" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard icon={MdAttachMoney} label="Completed Value" value={fmtCurrency(data.statistics?.completedValue)} color="success" />
              <MetricCard icon={MdAttachMoney} label="Pending Value" value={fmtCurrency(data.statistics?.pendingValue)} color="warning" />
              <MetricCard icon={MdLocalShipping} label="Unique Suppliers" value={fmt(data.statistics?.uniqueSuppliers)} color="primary" />
              <MetricCard icon={MdShoppingCart} label="Unique Warehouses" value={fmt(data.statistics?.uniqueWarehouses)} color="info" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Status Distribution" subtitle="Orders by status">
                {statusLabels.length > 0 ? (
                  <DoughnutChart labels={statusLabels} data={statusCounts} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Top Suppliers by Spend" subtitle="Highest procurement value">
                {supLabels.length > 0 ? (
                  <BarChart labels={supLabels} datasets={[{ label: 'Value (₹)', data: supValues }]} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>

            {/* Recent Orders */}
            <Card title="Recent Orders" subtitle="Latest purchase orders" className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Order</th>
                      <th className="pb-2 font-medium">Supplier</th>
                      <th className="pb-2 font-medium">Warehouse</th>
                      <th className="pb-2 font-medium text-right">Items</th>
                      <th className="pb-2 font-medium text-right">Amount</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders?.slice(0, 8).map((o) => (
                      <tr key={o.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer" onClick={() => navigate(`/purchase-orders/${o.id}`)}>
                        <td className="py-2">
                          <p className="font-medium text-primary-600 dark:text-primary-400 font-mono">{o.orderNumber}</p>
                          <p className="text-[10px] text-surface-400">{o.orderDate}</p>
                        </td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{o.supplierName}</td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{o.warehouseName || '—'}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{o.itemCount ?? '—'}</td>
                        <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(o.totalAmount)}</td>
                        <td className="py-2">
                          <Badge variant={PO_STATUS_BADGE[o.status] || 'surface'} size="sm" dot>{o.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* ─── ALL ORDERS TAB (filtered/paginated) ─────────────── */}
        {activeTab === 'orders' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <MdSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  value={search}
                  onChange={handleFilterChange(setSearch)}
                  placeholder="Search orders, suppliers..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200"
                />
              </div>
              <select value={supplierId} onChange={handleFilterChange(setSupplierId)} className="px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200">
                <option value="">All Suppliers</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={warehouseId} onChange={handleFilterChange(setWarehouseId)} className="px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200">
                <option value="">All Warehouses</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <select value={status} onChange={handleFilterChange(setStatus)} className="px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200">
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <input type="date" value={dateFrom} onChange={handleFilterChange(setDateFrom)} className="px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200" title="From date" />
              <input type="date" value={dateTo} onChange={handleFilterChange(setDateTo)} className="px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200" title="To date" />
              {hasActiveFilters && (
                <Button variant="ghost" size="xs" onClick={clearFilters}>Clear</Button>
              )}
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-surface-400">
                Showing {data.orders?.items?.length ?? 0} of {fmt(data.filters?.totalElements || data.orders?.totalElements)} orders
              </p>
              <div className="flex items-center gap-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleSort(opt.value)}
                    className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded transition-colors ${
                      sortBy === opt.value ? 'text-primary-500 font-medium' : 'text-surface-400 hover:text-surface-600'
                    }`}
                  >
                    <MdSort size={10} /> {opt.label} {sortBy === opt.value && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                ))}
              </div>
            </div>

            <Card className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Order</th>
                      <th className="pb-2 font-medium">Supplier</th>
                      <th className="pb-2 font-medium">Warehouse</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Expected</th>
                      <th className="pb-2 font-medium text-right">Items</th>
                      <th className="pb-2 font-medium text-right">Amount</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders?.items?.length === 0 && (
                      <tr><td colSpan={8} className="py-8 text-center text-surface-400">No orders found</td></tr>
                    )}
                    {data.orders?.items?.map((o) => (
                      <tr key={o.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer" onClick={() => navigate(`/purchase-orders/${o.id}`)}>
                        <td className="py-2">
                          <p className="font-medium text-primary-600 dark:text-primary-400 font-mono">{o.orderNumber}</p>
                        </td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{o.supplierName}</td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{o.warehouseName || '—'}</td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{o.orderDate}</td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{o.expectedDelivery || '—'}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{o.itemCount ?? '—'}</td>
                        <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(o.totalAmount)}</td>
                        <td className="py-2">
                          <Badge variant={PO_STATUS_BADGE[o.status] || 'surface'} size="sm" dot>{o.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {data.orders && data.orders.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <p className="text-xs text-surface-400">
                    Page {(data.orders.page ?? 0) + 1} of {data.orders.totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(0)} disabled={page === 0} className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-30"><MdFirstPage size={14} /></button>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-30"><MdChevronLeft size={14} /></button>
                    <span className="text-xs text-surface-600 dark:text-surface-300 px-2">{page + 1}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= (data.orders.totalPages || 1) - 1} className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-30"><MdChevronRight size={14} /></button>
                    <button onClick={() => setPage(data.orders.totalPages - 1)} disabled={page >= (data.orders.totalPages || 1) - 1} className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-30"><MdLastPage size={14} /></button>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}

        {/* ─── MONTHLY TRENDS TAB ─────────────────────────────── */}
        {activeTab === 'trends' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Monthly Orders" subtitle="Order count trend (last 12 months)">
                {monthlyLabels.length > 0 ? (
                  <BarChart labels={monthlyLabels} datasets={[{ label: 'Orders', data: monthlyCounts }]} height={280} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Monthly Spending" subtitle="Total value per month (₹)">
                {monthlyLabels.length > 0 ? (
                  <BarChart labels={monthlyLabels} datasets={[{ label: 'Value (₹)', data: monthlyValues }]} height={280} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>
            <Card title="Completed vs Pending" subtitle="Monthly breakdown of order completion">
              {monthlyLabels.length > 0 ? (
                <BarChart labels={monthlyLabels} datasets={[
                  { label: 'Completed', data: monthlyCompleted },
                  { label: 'Pending', data: monthlyPending },
                ]} height={280} />
              ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
            </Card>
          </>
        )}

        {/* ─── TOP SUPPLIERS TAB ──────────────────────────────── */}
        {activeTab === 'suppliers' && (
          <>
            <Card title="Top Suppliers by Spend" subtitle="Detailed breakdown" className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Supplier</th>
                      <th className="pb-2 font-medium text-right">Orders</th>
                      <th className="pb-2 font-medium text-right">Completed</th>
                      <th className="pb-2 font-medium text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topSuppliers?.map((s) => (
                      <tr key={s.supplierId} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                        <td className="py-2">
                          <p className="font-medium text-surface-800 dark:text-surface-100">{s.supplierName}</p>
                          <p className="text-[10px] text-surface-400 font-mono">{s.supplierCode}</p>
                        </td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{s.orderCount}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{s.completedCount}</td>
                        <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(s.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {data.warehouseBreakdown?.length > 0 && (
              <Card title="Orders by Warehouse" subtitle="Procurement per warehouse" className="mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                        <th className="pb-2 font-medium">Warehouse</th>
                        <th className="pb-2 font-medium text-right">Orders</th>
                        <th className="pb-2 font-medium text-right">Active</th>
                        <th className="pb-2 font-medium text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.warehouseBreakdown.map((w) => (
                        <tr key={w.warehouseId} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                          <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{w.warehouseName}</td>
                          <td className="py-2 text-right text-surface-600 dark:text-surface-300">{w.orderCount}</td>
                          <td className="py-2 text-right text-surface-600 dark:text-surface-300">{w.activeOrders}</td>
                          <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(w.totalValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default PurchaseReport;
