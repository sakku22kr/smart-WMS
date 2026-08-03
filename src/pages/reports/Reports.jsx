import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdInventory, MdLocalShipping, MdWarehouse, MdShoppingCart, MdTrendingUp,
  MdAttachMoney, MdPeople, MdWarning, MdFileDownload, MdPictureAsPdf,
  MdTableChart, MdAccessTime, MdRefresh,
} from 'react-icons/md';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import ChartCard from '@components/charts/ChartCard';
import DoughnutChart from '@components/charts/DoughnutChart';
import BarChart from '@components/charts/BarChart';
import MetricCard from '@components/common/MetricCard';
import reportService from '@api/services/reportService';

const REPORTS = [
  { key: 'inventory', label: 'Inventory Report', icon: MdInventory, color: 'bg-primary-500/10 text-primary-500', path: '/reports/inventory', desc: 'Stock levels, movements, and alerts' },
  { key: 'products', label: 'Product Report', icon: MdTrendingUp, color: 'bg-accent-500/10 text-accent-500', path: '/reports/products', desc: 'Catalog analytics and breakdowns' },
  { key: 'warehouses', label: 'Warehouse Report', icon: MdWarehouse, color: 'bg-success-500/10 text-success-500', path: '/reports/warehouses', desc: 'Capacity and utilization metrics' },
  { key: 'suppliers', label: 'Supplier Report', icon: MdLocalShipping, color: 'bg-warning-500/10 text-warning-500', path: '/reports/suppliers', desc: 'Supplier performance and procurement' },
  { key: 'purchases', label: 'Purchase Report', icon: MdShoppingCart, color: 'bg-info-500/10 text-info-500', path: '/reports/purchases', desc: 'Purchase orders and spending trends' },
];

const QUICK_EXPORT_MAP = {
  inventory: { pdf: () => reportService.exportInventoryPdf(), excel: () => reportService.exportInventoryExcel() },
  products:  { pdf: () => reportService.exportProductPdf(),  excel: () => reportService.exportProductExcel()  },
  warehouses:{ pdf: () => reportService.exportWarehousePdf(), excel: () => reportService.exportWarehouseExcel() },
  suppliers: { pdf: () => reportService.exportSupplierPdf(),  excel: () => reportService.exportSupplierExcel()  },
  purchases: { pdf: () => reportService.exportPurchasePdf(),  excel: () => reportService.exportPurchaseExcel()  },
};

const RECENT_REPORTS_KEY = 'wms_recent_reports';

const loadRecentReports = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_REPORTS_KEY)) || []; }
  catch { return []; }
};

const saveRecentReport = (entry) => {
  const recent = [entry, ...loadRecentReports().filter((r) => r.id !== entry.id)].slice(0, 20);
  localStorage.setItem(RECENT_REPORTS_KEY, JSON.stringify(recent));
};

const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('en-IN');
const fmtCurrency = (n) => n == null ? '—' : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtTimeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const Reports = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentReports, setRecentReports] = useState([]);
  const [exporting, setExporting] = useState(null);

  useEffect(() => { setRecentReports(loadRecentReports()); }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [invRes, prodRes, whRes, supRes, poRes] = await Promise.allSettled([
        reportService.getInventoryReport({ page: 0, size: 1 }),
        reportService.getProductReport({ page: 0, size: 1 }),
        reportService.getWarehouseReport(),
        reportService.getSupplierReport({ page: 0, size: 1 }),
        reportService.getPurchaseReport({ page: 0, size: 1 }),
      ]);
      setStats({
        inventory: invRes.status === 'fulfilled' ? invRes.value?.data : null,
        products: prodRes.status === 'fulfilled' ? prodRes.value?.data : null,
        warehouses: whRes.status === 'fulfilled' ? whRes.value?.data : null,
        suppliers: supRes.status === 'fulfilled' ? supRes.value?.data : null,
        purchases: poRes.status === 'fulfilled' ? poRes.value?.data : null,
      });
    } catch { /* ignore */ }
    finally { setLoadingStats(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleQuickExport = async (reportKey, format) => {
    const label = REPORTS.find((r) => r.key === reportKey)?.label || reportKey;
    const fmtLabel = format.toUpperCase();
    setExporting(`${reportKey}-${format}`);
    try {
      await QUICK_EXPORT_MAP[reportKey][format]();
      const entry = {
        id: `${reportKey}-${format}-${Date.now()}`,
        name: `${label} (${fmtLabel})`,
        format: fmtLabel,
        key: reportKey,
        exportedAt: new Date().toISOString(),
      };
      saveRecentReport(entry);
      setRecentReports(loadRecentReports());
      toast.success(`${label} ${fmtLabel} downloaded`);
    } catch {
      toast.error(`Failed to export ${label}`);
    } finally {
      setExporting(null);
    }
  };

  const totalProducts = stats?.products?.statistics?.totalProducts;
  const totalSuppliers = stats?.suppliers?.statistics?.totalSuppliers;
  const totalOrders = stats?.purchases?.statistics?.totalOrders || stats?.purchases?.totalOrders;
  const totalValue = stats?.purchases?.statistics?.totalValue || stats?.purchases?.totalValue;
  const lowStock = stats?.products?.statistics?.lowStockCount;
  const totalWarehouses = stats?.warehouses?.statistics?.totalWarehouses;
  const warehouseUtil = stats?.warehouses?.statistics?.utilizationPercentage;
  const avgOrderValue = stats?.purchases?.statistics?.averageOrderValue || stats?.purchases?.averageOrderValue;
  const activeSuppliers = stats?.suppliers?.statistics?.activeSuppliers;
  const totalCategories = stats?.products?.statistics?.totalCategories;
  const outOfStock = stats?.products?.statistics?.outOfStockCount;

  const warehouseChartData = {
    labels: ['Utilized', 'Available'],
    datasets: [{
      label: 'Capacity',
      data: [warehouseUtil ?? 55, 100 - (warehouseUtil ?? 55)],
      color: '#6366f1',
    }],
  };

  const reportStatusData = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    data: [
      Math.max(0, (totalProducts || 0) - (lowStock || 0) - (outOfStock || 0)),
      lowStock || 0,
      outOfStock || 0,
    ],
    colors: ['#22c55e', '#f97316', '#ef4444'],
  };

  const reportCategoryData = {
    labels: ['Products', 'Warehouses', 'Suppliers', 'Categories'],
    datasets: [{
      label: 'Total Count',
      data: [totalProducts || 0, totalWarehouses || 0, totalSuppliers || 0, totalCategories || 0],
      color: '#6366f1',
    }],
  };

  return (
    <PageWrapper>
      <div className="page-container max-w-6xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Comprehensive insights into your warehouse operations</p>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<MdRefresh />} onClick={fetchStats} disabled={loadingStats}>
            Refresh
          </Button>
        </div>

        {/* ── KPI Summary Grid ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <MetricCard icon={MdInventory} label="Total Products" value={loadingStats ? '—' : fmt(totalProducts)} color="primary" />
          <MetricCard icon={MdWarehouse} label="Warehouses" value={loadingStats ? '—' : fmt(totalWarehouses)} color="success" />
          <MetricCard icon={MdShoppingCart} label="Total Orders" value={loadingStats ? '—' : fmt(totalOrders)} color="info" />
          <MetricCard icon={MdAttachMoney} label="Total Spend" value={loadingStats ? '—' : fmtCurrency(totalValue)} color="primary" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <MetricCard icon={MdPeople} label="Suppliers" value={loadingStats ? '—' : fmt(totalSuppliers)} color="warning" />
          <MetricCard icon={MdWarning} label="Low Stock Items" value={loadingStats ? '—' : fmt(lowStock)} color="danger" />
          <MetricCard icon={MdWarehouse} label="Utilization" value={loadingStats ? '—' : (warehouseUtil != null ? `${Number(warehouseUtil).toFixed(1)}%` : '—')} color="info" />
          <MetricCard icon={MdAttachMoney} label="Avg Order" value={loadingStats ? '—' : fmtCurrency(avgOrderValue)} color="success" />
        </div>

        {/* ── Charts Row ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <ChartCard
            title="Inventory Status"
            subtitle="Stock distribution across products"
            loading={loadingStats}
            delay={0}
            skeletonH="240px"
          >
            <DoughnutChart
              labels={reportStatusData.labels}
              data={reportStatusData.data}
              colors={reportStatusData.colors}
              height={240}
              cutout="68%"
            />
          </ChartCard>

          <ChartCard
            title="Warehouse Utilization"
            subtitle="Capacity usage overview"
            loading={loadingStats}
            delay={0.06}
            skeletonH="240px"
          >
            <BarChart
              labels={warehouseChartData.labels}
              datasets={warehouseChartData.datasets}
              height={240}
              stacked
              borderRadius={5}
            />
          </ChartCard>

          <ChartCard
            title="Module Overview"
            subtitle="Entity counts by module"
            loading={loadingStats}
            delay={0.12}
            skeletonH="240px"
          >
            <BarChart
              labels={reportCategoryData.labels}
              datasets={reportCategoryData.datasets}
              height={240}
              borderRadius={5}
            />
          </ChartCard>
        </div>

        {/* ── Quick Export + Recent Reports ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Quick Export */}
          <Card title="Quick Export" subtitle="One-click report downloads">
            <div className="space-y-2">
              {REPORTS.map((r) => (
                <div
                  key={r.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/60"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${r.color} flex items-center justify-center flex-shrink-0`}>
                      <r.icon size={18} />
                    </div>
                    <span className="text-sm font-medium text-surface-800 dark:text-surface-100">{r.label}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="xs"
                      leftIcon={<MdPictureAsPdf size={14} />}
                      onClick={() => handleQuickExport(r.key, 'pdf')}
                      loading={exporting === `${r.key}-pdf`}
                      title="Export PDF"
                    >
                      PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      leftIcon={<MdTableChart size={14} />}
                      onClick={() => handleQuickExport(r.key, 'excel')}
                      loading={exporting === `${r.key}-excel`}
                      title="Export Excel"
                    >
                      Excel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Exports */}
          <Card
            title="Recent Exports"
            subtitle="Your download history"
            headerAction={
              recentReports.length > 0 && (
                <Badge variant="surface">{recentReports.length} total</Badge>
              )
            }
          >
            {recentReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MdFileDownload size={32} className="text-surface-300 dark:text-surface-600 mb-2" />
                <p className="text-sm text-surface-400 dark:text-surface-500">No exports yet</p>
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                  Use Quick Export to download reports
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {recentReports.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        r.format === 'PDF'
                          ? 'bg-danger-500/10 text-danger-500'
                          : 'bg-success-500/10 text-success-500'
                      }`}>
                        {r.format === 'PDF' ? <MdPictureAsPdf size={16} /> : <MdTableChart size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-100 truncate">
                          {r.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-surface-400">
                          <MdAccessTime size={12} />
                          <span>{fmtTimeAgo(r.exportedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={r.format === 'PDF' ? 'danger' : 'success'} size="sm">
                      {r.format}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Report Statistics ──────────────────────────────── */}
        <h2 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-3">Report Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Active Products', value: fmt(stats?.products?.statistics?.activeProducts), color: 'text-primary-600 dark:text-primary-400' },
            { label: 'Active Categories', value: fmt(totalCategories), color: 'text-accent-600 dark:text-accent-400' },
            { label: 'Active Warehouses', value: fmt(stats?.warehouses?.statistics?.activeWarehouses), color: 'text-success-600 dark:text-success-400' },
            { label: 'Active Suppliers', value: fmt(activeSuppliers), color: 'text-warning-600 dark:text-warning-400' },
            { label: 'Completed Orders', value: fmt(stats?.purchases?.statistics?.completedOrders), color: 'text-info-600 dark:text-info-400' },
            { label: 'Pending Orders', value: fmt(stats?.purchases?.statistics?.pendingOrders), color: 'text-violet-600 dark:text-violet-400' },
            { label: 'Total Order Value', value: fmtCurrency(stats?.purchases?.statistics?.totalValue), color: 'text-primary-600 dark:text-primary-400' },
            { label: 'Out of Stock', value: fmt(outOfStock), color: 'text-danger-600 dark:text-danger-400' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-4 bg-white/80 dark:bg-surface-800/80 border border-surface-100 dark:border-surface-700/50 backdrop-blur-xl"
            >
              {loadingStats ? (
                <div className="h-7 w-14 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
              ) : (
                <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              )}
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Detailed Report Navigation ─────────────────────── */}
        <h2 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-3">Detailed Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORTS.map((r, i) => (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover className="cursor-pointer" onClick={() => navigate(r.path)}>
                <div className={`w-11 h-11 rounded-xl ${r.color} flex items-center justify-center mb-3`}>
                  <r.icon size={22} />
                </div>
                <h3 className="font-semibold text-surface-800 dark:text-surface-100">{r.label}</h3>
                <p className="text-xs text-surface-400 mt-1">{r.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Reports;
