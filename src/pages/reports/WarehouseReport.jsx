import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowBack, MdWarehouse, MdInventory, MdShoppingCart, MdAttachMoney,
  MdWarning, MdCheckCircle, MdDownload, MdTableChart
} from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import BarChart from '@components/charts/BarChart';
import DoughnutChart from '@components/charts/DoughnutChart';
import MetricCard from '@components/common/MetricCard';
import reportService from '@api/services/reportService';
import '@/components/charts/chartConfig';

const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('en-IN');
const fmtPct = (n) => n == null ? '—' : `${Number(n).toFixed(1)}%`;
const fmtCurrency = (n) => n == null ? '—' : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const TABS = [
  { id: 'overview', label: 'Overview', icon: MdWarehouse },
  { id: 'utilization', label: 'Utilization', icon: MdInventory },
  { id: 'inventory', label: 'Inventory Value', icon: MdAttachMoney },
  { id: 'orders', label: 'Purchase Orders', icon: MdShoppingCart },
];

const WH_STATUS_BADGE = { ACTIVE: 'success', INACTIVE: 'warning', UNDER_MAINTENANCE: 'info' };

const WarehouseReport = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await reportService.exportWarehousePdf();
      toast.success('Warehouse report PDF downloaded');
    } catch {
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await reportService.exportWarehouseExcel();
      toast.success('Warehouse report Excel downloaded');
    } catch {
      toast.error('Failed to export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getWarehouseReport();
      setData(res?.data);
    } catch {
      toast.error('Failed to load warehouse report');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const whLabels = data.warehouses?.map(w => w.code) ?? [];
  const whUtil = data.warehouses?.map(w => w.utilizationPercent) ?? [];
  const whCapacity = data.warehouses?.map(w => w.capacity) ?? [];
  const whUsed = data.warehouses?.map(w => w.currentUtilization) ?? [];
  const poLabels = data.ordersPerWarehouse?.map(o => o.warehouseName) ?? [];
  const poValues = data.ordersPerWarehouse?.map(o => o.orderCount) ?? [];
  const poActive = data.ordersPerWarehouse?.map(o => o.activeOrders) ?? [];
  const valLabels = data.valueBreakdown?.map(v => v.code) ?? [];
  const valInventory = data.valueBreakdown?.map(v => Number(v.inventoryValue) || 0) ?? [];
  const valPurchase = data.valueBreakdown?.map(v => Number(v.purchaseValue) || 0) ?? [];
  const statusLabels = data.statusBreakdown?.map(s => s.status) ?? [];
  const statusCounts = data.statusBreakdown?.map(s => s.count) ?? [];

  return (
    <PageWrapper>
      <div className="page-container max-w-6xl">
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/reports')} className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-500 transition-colors mb-1">
              <MdArrowBack size={14} /> Back to Reports
            </button>
            <h1 className="page-title">Warehouse Report</h1>
            <p className="page-subtitle">Capacity and utilization metrics</p>
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
              <MetricCard icon={MdWarehouse} label="Total Warehouses" value={fmt(data.statistics?.totalWarehouses)} color="primary" />
              <MetricCard icon={MdCheckCircle} label="Active" value={fmt(data.statistics?.activeWarehouses)} color="success" />
              <MetricCard icon={MdWarning} label="Maintenance" value={fmt(data.statistics?.maintenanceWarehouses)} color="warning" />
              <MetricCard icon={MdWarehouse} label="Utilization" value={fmtPct(data.statistics?.utilizationPercentage)} color="info" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard icon={MdInventory} label="Total Products" value={fmt(data.statistics?.totalProducts)} color="info" />
              <MetricCard icon={MdInventory} label="Total Stock" value={fmt(data.statistics?.totalStockQuantity)} color="primary" />
              <MetricCard icon={MdAttachMoney} label="Inventory Value" value={fmtCurrency(data.statistics?.totalInventoryValue)} color="success" />
              <MetricCard icon={MdShoppingCart} label="Total POs" value={fmt(data.statistics?.totalPurchaseOrders)} color="primary" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard icon={MdWarehouse} label="Total Capacity" value={fmt(data.statistics?.totalCapacity)} color="info" />
              <MetricCard icon={MdWarehouse} label="Current Usage" value={fmt(data.statistics?.totalUtilization)} color="primary" />
              <MetricCard icon={MdWarning} label="Near Capacity (≥90%)" value={fmt(data.statistics?.nearCapacityCount)} color="warning" />
              <MetricCard icon={MdWarning} label="Full Capacity" value={fmt(data.statistics?.fullCapacityCount)} color="danger" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Status Distribution" subtitle="By warehouse status">
                {statusLabels.length > 0 ? (
                  <DoughnutChart labels={statusLabels} data={statusCounts} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Capacity vs Usage" subtitle="Capacity and utilization per warehouse">
                {whLabels.length > 0 ? (
                  <BarChart labels={whLabels} datasets={[
                    { label: 'Capacity', data: whCapacity },
                    { label: 'Used', data: whUsed },
                  ]} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>

            {/* Warehouse Table */}
            <Card title="All Warehouses" subtitle="Detailed warehouse information" className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Warehouse</th>
                      <th className="pb-2 font-medium">Code</th>
                      <th className="pb-2 font-medium">Manager</th>
                      <th className="pb-2 font-medium text-right">Products</th>
                      <th className="pb-2 font-medium text-right">Stock</th>
                      <th className="pb-2 font-medium text-right">Value</th>
                      <th className="pb-2 font-medium text-right">Utilization</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.warehouses?.map((w) => (
                      <tr key={w.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                        <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{w.name}</td>
                        <td className="py-2 text-surface-600 dark:text-surface-300 font-mono">{w.code}</td>
                        <td className="py-2 text-surface-600 dark:text-surface-300">{w.manager || '—'}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{w.productCount}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(w.totalStock)}</td>
                        <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(w.inventoryValue)}</td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${w.utilizationPercent >= 90 ? 'bg-danger-500' : w.utilizationPercent >= 70 ? 'bg-warning-500' : 'bg-success-500'}`}
                                style={{ width: `${Math.min(w.utilizationPercent || 0, 100)}%` }}
                              />
                            </div>
                            <span className="text-surface-600 dark:text-surface-300 w-12 text-right">{fmtPct(w.utilizationPercent)}</span>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge variant={WH_STATUS_BADGE[w.status] || 'surface'} size="sm">{w.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* ─── UTILIZATION TAB ─────────────────────────────────── */}
        {activeTab === 'utilization' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Utilization %" subtitle="% capacity used per warehouse">
                {whLabels.length > 0 ? (
                  <BarChart labels={whLabels} datasets={[{ label: 'Utilization %', data: whUtil }]} height={280} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Capacity vs Usage" subtitle="Capacity and utilization per warehouse">
                {whLabels.length > 0 ? (
                  <BarChart labels={whLabels} datasets={[
                    { label: 'Capacity', data: whCapacity },
                    { label: 'Used', data: whUsed },
                  ]} height={280} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>

            <Card title="Utilization Details" subtitle="Per warehouse utilization breakdown" className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Warehouse</th>
                      <th className="pb-2 font-medium">Code</th>
                      <th className="pb-2 font-medium text-right">Capacity</th>
                      <th className="pb-2 font-medium text-right">Used</th>
                      <th className="pb-2 font-medium text-right">Available</th>
                      <th className="pb-2 font-medium text-right">Utilization</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.utilizationBreakdown?.map((w) => (
                      <tr key={w.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                        <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{w.name}</td>
                        <td className="py-2 font-mono text-surface-500">{w.code}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(w.capacity)}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(w.currentUtilization)}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt((w.capacity || 0) - (w.currentUtilization || 0))}</td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${(w.utilizationPercent || 0) >= 90 ? 'bg-danger-500' : (w.utilizationPercent || 0) >= 70 ? 'bg-warning-500' : 'bg-success-500'}`}
                                style={{ width: `${Math.min(w.utilizationPercent || 0, 100)}%` }}
                              />
                            </div>
                            <span className="text-surface-600 dark:text-surface-300 w-12 text-right">{fmtPct(w.utilizationPercent)}</span>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge variant={WH_STATUS_BADGE[w.status] || 'surface'} size="sm">{w.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* ─── INVENTORY VALUE TAB ─────────────────────────────── */}
        {activeTab === 'inventory' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Inventory Value by Warehouse" subtitle="Selling value per warehouse">
                {valLabels.length > 0 ? (
                  <BarChart labels={valLabels} datasets={[{ label: 'Inventory Value (₹)', data: valInventory }]} height={280} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Purchase Value by Warehouse" subtitle="Purchase cost per warehouse">
                {valLabels.length > 0 ? (
                  <BarChart labels={valLabels} datasets={[{ label: 'Purchase Value (₹)', data: valPurchase }]} height={280} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>

            <Card title="Inventory Value Details" subtitle="Per warehouse inventory valuation" className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Warehouse</th>
                      <th className="pb-2 font-medium">Code</th>
                      <th className="pb-2 font-medium text-right">Products</th>
                      <th className="pb-2 font-medium text-right">Total Stock</th>
                      <th className="pb-2 font-medium text-right">Inventory Value</th>
                      <th className="pb-2 font-medium text-right">Purchase Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.valueBreakdown?.map((v) => (
                      <tr key={v.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                        <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{v.name}</td>
                        <td className="py-2 font-mono text-surface-500">{v.code}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(v.productCount)}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(v.totalStock)}</td>
                        <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(v.inventoryValue)}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmtCurrency(v.purchaseValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* ─── PURCHASE ORDERS TAB ─────────────────────────────── */}
        {activeTab === 'orders' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Orders per Warehouse" subtitle="Total purchase order count">
                {poLabels.length > 0 ? (
                  <BarChart labels={poLabels} datasets={[
                    { label: 'Total Orders', data: poValues },
                    { label: 'Active Orders', data: poActive },
                  ]} height={280} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Orders by Warehouse" subtitle="Distribution">
                {poLabels.length > 0 ? (
                  <DoughnutChart labels={poLabels} data={poValues} height={280} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>

            <Card title="Purchase Orders by Warehouse" subtitle="Detailed breakdown" className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Warehouse</th>
                      <th className="pb-2 font-medium text-right">Total Orders</th>
                      <th className="pb-2 font-medium text-right">Active Orders</th>
                      <th className="pb-2 font-medium text-right">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ordersPerWarehouse?.map((w, i) => (
                      <tr key={i} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
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
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default WarehouseReport;
