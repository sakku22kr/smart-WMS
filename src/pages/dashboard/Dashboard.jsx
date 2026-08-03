import { MdLocalShipping, MdWarningAmber, MdRefresh, MdInventory, MdWarehouse, MdShoppingCart, MdTrendingUp, MdPictureAsPdf, MdTableChart } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageWrapper        from '@components/layout/PageWrapper';
import Card               from '@components/ui/Card';
import Button             from '@components/ui/Button';
import Badge              from '@components/ui/Badge';
import Skeleton           from '@components/common/Skeleton';
import DashboardSummary  from '@components/dashboard/DashboardSummary';
import DashboardCharts   from '@components/dashboard/DashboardCharts';
import DashboardActivity from '@components/dashboard/DashboardActivity';
import SupplierDashboardWidget from '@components/suppliers/SupplierDashboardWidget';
import SupplierKpiCards from '@components/suppliers/SupplierKpiCards';
import SupplierPerformanceChart from '@components/suppliers/SupplierPerformanceChart';
import SupplierTransactionSummary from '@components/suppliers/SupplierTransactionSummary';
import { useAuth }       from '@/context/AuthContext';
import useDashboard      from '@/hooks/useDashboard';
import '@/components/charts/chartConfig';

// ─── Status badge variant map ─────────────────────────────────
const STATUS_BADGE = {
  APPROVED:  'success',
  PENDING:   'warning',
  RECEIVED:  'info',
  COMPLETED: 'primary',
  DRAFT:     'surface',
  ORDERED:   'info',
  PARTIALLY_RECEIVED: 'warning',
  REJECTED:  'danger',
  CANCELLED: 'surface',
};

const STATUS_LABELS = {
  DRAFT: 'Draft', PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected',
  ORDERED: 'Ordered', PARTIALLY_RECEIVED: 'Partial', RECEIVED: 'Received', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

// ─── Dashboard ────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.firstName ?? 'there';

  // ── Live data ──────────────────────────────────────────────
  const {
    stats,
    lowStock,
    outOfStock,
    topProducts,
    productStats,
    inventoryValue,
    recentOrders,
    loading,
    refreshing,
    error,
    refresh,
    lastUpdated,
  } = useDashboard();

  const isLoading  = loading;
  const isRefreshing = refreshing;

  return (
    <PageWrapper>
      <div className="page-container">

        {isLoading ? (
          <Skeleton.DashboardGrid />
        ) : (
          <>
            {/* ── Page Header ────────────────────────────────── */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">
                  Welcome back,{' '}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">{firstName}</span>{' '}
                  👋 Here&apos;s what&apos;s happening today.
                </p>
                {lastUpdated && (
                  <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-0.5">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
                {error && (
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                    ⚠ Could not reach backend — showing cached data.
                  </p>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<MdRefresh className={isRefreshing ? 'animate-spin' : ''} />}
                onClick={refresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing…' : 'Refresh'}
              </Button>
            </div>

            {/* ── Phase 4.2: KPI Summary Cards ─────────────── */}
            <DashboardSummary stats={stats} loading={false} />

            {/* ── Phase 4.3: Charts ───────────────────────── */}
            <DashboardCharts stats={stats} topProducts={topProducts} productStats={productStats} inventoryValue={inventoryValue} recentOrders={recentOrders} loading={false} />

            {/* ── Phase 4.4: Activity, Notifications, Quick Actions */}
            <DashboardActivity
              lowStock={lowStock}
              outOfStock={outOfStock}
              stats={stats}
              loading={false}
            />

            {/* ── Phase 11.7: Supplier Dashboard Widgets ──── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SupplierDashboardWidget />
              <SupplierTransactionSummary />
            </div>

            <SupplierKpiCards />

            <SupplierPerformanceChart />

            {/* ── Reports Overview ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card
                title="Reports Overview"
                subtitle="Quick access to analytics"
                headerAction={
                  <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
                    View All
                  </Button>
                }
              >
                <div className="space-y-2">
                  {[
                    { label: 'Inventory Report', icon: MdInventory, color: 'bg-primary-500/10 text-primary-500', desc: 'Stock levels & movements' },
                    { label: 'Product Report', icon: MdTrendingUp, color: 'bg-accent-500/10 text-accent-500', desc: 'Catalog analytics' },
                    { label: 'Warehouse Report', icon: MdWarehouse, color: 'bg-success-500/10 text-success-500', desc: 'Capacity & utilization' },
                    { label: 'Supplier Report', icon: MdLocalShipping, color: 'bg-warning-500/10 text-warning-500', desc: 'Performance metrics' },
                    { label: 'Purchase Report', icon: MdShoppingCart, color: 'bg-info-500/10 text-info-500', desc: 'Spending trends' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={() => navigate('/reports')}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/60 hover:border-primary-200 dark:hover:border-primary-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                          <item.icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-800 dark:text-surface-100">{item.label}</p>
                          <p className="text-xs text-surface-400 dark:text-surface-500">{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<MdPictureAsPdf size={13} />}
                          onClick={(e) => { e.stopPropagation(); toast.success(`${item.label} PDF downloaded`); }}
                          title="Export PDF"
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<MdTableChart size={13} />}
                          onClick={(e) => { e.stopPropagation(); toast.success(`${item.label} Excel downloaded`); }}
                          title="Export Excel"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Report Statistics Quick View */}
              <Card title="Report Statistics" subtitle="Key metrics at a glance">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Products', value: stats?.totalProducts?.toLocaleString() ?? '—', color: 'text-primary-600 dark:text-primary-400' },
                    { label: 'Active Products', value: stats?.activeProducts?.toLocaleString() ?? '—', color: 'text-success-600 dark:text-success-400' },
                    { label: 'Low Stock', value: lowStock.length?.toLocaleString() ?? '—', color: 'text-warning-600 dark:text-warning-400' },
                    { label: 'Out of Stock', value: outOfStock.length?.toLocaleString() ?? '—', color: 'text-danger-600 dark:text-danger-400' },
                    { label: 'Warehouses', value: stats?.totalWarehouses?.toLocaleString() ?? '—', color: 'text-info-600 dark:text-info-400' },
                    { label: 'Suppliers', value: stats?.totalSuppliers?.toLocaleString() ?? '—', color: 'text-violet-600 dark:text-violet-400' },
                    { label: 'Categories', value: stats?.totalCategories?.toLocaleString() ?? '—', color: 'text-accent-600 dark:text-accent-400' },
                    { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString() ?? '—', color: 'text-primary-600 dark:text-primary-400' },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="rounded-xl p-3 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50"
                    >
                      <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/reports')}
                    leftIcon={<MdTrendingUp size={16} />}
                  >
                    Open Reports Dashboard
                  </Button>
                </div>
              </Card>
            </div>

            {/* ── Low Stock Alerts + Recent Purchase Orders ─ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Low Stock Alerts — live data */}
              <Card
                title="Low Stock Alerts"
                subtitle="Items requiring immediate attention"
                headerAction={
                  <Badge variant="danger" dot>
                    {lowStock.length} alert{lowStock.length !== 1 ? 's' : ''}
                  </Badge>
                }
              >
                {lowStock.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-surface-400 dark:text-surface-500">
                      🎉 No low-stock items right now!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lowStock.slice(0, 6).map((item) => (
                      <div
                        key={item.id ?? item.sku}
                        className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/60 hover:border-warning-300 dark:hover:border-warning-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-warning-500/10 flex items-center justify-center flex-shrink-0">
                            <MdWarningAmber size={16} className="text-warning-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-surface-800 dark:text-surface-100 leading-tight truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-surface-400 dark:text-surface-500 font-mono">{item.sku}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm font-bold text-danger-500">{item.currentStock} left</p>
                          <p className="text-xs text-surface-400">Min: {item.reorderLevel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Recent Purchase Orders — live API data */}
              <Card
                title="Recent Purchase Orders"
                subtitle="Latest procurement activity"
                headerAction={
                  <Button variant="outline" size="sm" onClick={() => navigate('/purchase-orders')}>
                    View All
                  </Button>
                }
              >
                <div className="space-y-2">
                  {recentOrders.length === 0 ? (
                    <div className="py-8 text-center">
                      <MdLocalShipping size={28} className="text-surface-300 dark:text-surface-600 mx-auto mb-2" />
                      <p className="text-sm text-surface-400 dark:text-surface-500">
                        No purchase orders yet
                      </p>
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => navigate(`/purchase-orders/${order.id}`)}
                        className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700/50 hover:border-primary-200 dark:hover:border-primary-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center flex-shrink-0">
                            <MdLocalShipping size={15} className="text-surface-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-semibold text-primary-600 dark:text-primary-400">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                              {order.supplierName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                          <Badge variant={STATUS_BADGE[order.status] ?? 'surface'} dot>
                            {STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
