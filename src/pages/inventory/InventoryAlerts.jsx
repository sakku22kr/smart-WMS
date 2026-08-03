import { useState, useMemo } from 'react';
import {
  MdWarningAmber, MdError, MdCheckCircle,
  MdRefresh, MdLocalShipping, MdInventory, MdStore, MdCategory,
  MdTrendingDown, MdTrendingUp, MdErrorOutline,
} from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import useInventoryAlerts from '@hooks/useInventoryAlerts';

const ALERT_TABS = [
  { key: 'all',          label: 'All Alerts',      icon: MdWarningAmber, color: 'text-warning-500' },
  { key: 'critical',     label: 'Critical',        icon: MdError,         color: 'text-danger-500' },
  { key: 'low-stock',    label: 'Low Stock',       icon: MdTrendingDown,  color: 'text-warning-500' },
  { key: 'out-of-stock', label: 'Out of Stock',    icon: MdErrorOutline,   color: 'text-danger-600' },
  { key: 'overstocked',  label: 'Overstocked',     icon: MdTrendingUp,    color: 'text-info-500' },
];

const StatCard = ({ icon: Icon, label, value, color, bgColor, subtext }) => (
  <Card className="p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-surface-800 dark:text-surface-100">{value ?? '—'}</p>
        <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
        {subtext && <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{subtext}</p>}
      </div>
    </div>
  </Card>
);

const HealthScoreGauge = ({ score }) => {
  const getColor = (s) => {
    if (s >= 80) return { stroke: '#22c55e', text: 'text-success-500', label: 'Excellent' };
    if (s >= 60) return { stroke: '#f97316', text: 'text-warning-500', label: 'Good' };
    if (s >= 40) return { stroke: '#ef4444', text: 'text-danger-500', label: 'Needs Attention' };
    return { stroke: '#dc2626', text: 'text-danger-600', label: 'Critical' };
  };

  const { stroke, label } = getColor(score ?? 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score ?? 0) / 100 * circumference;

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-4">Stock Health Score</h3>
      <div className="flex flex-col items-center">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:stroke-surface-700" />
          <circle
            cx="70" cy="70" r={radius} fill="none" stroke={stroke} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 70 70)" className="transition-all duration-1000"
          />
          <text x="70" y="65" textAnchor="middle" className="text-3xl font-bold fill-surface-800 dark:fill-surface-100">
            {score ?? '—'}
          </text>
          <text x="70" y="85" textAnchor="middle" className="text-xs fill-surface-500 dark:fill-surface-400">
            {label}
          </text>
        </svg>
      </div>
    </Card>
  );
};

const AlertItem = ({ product, type }) => {
  const getBadge = () => {
    if (type === 'critical') return <Badge variant="danger" size="sm">Critical</Badge>;
    if (type === 'out-of-stock') return <Badge variant="danger" size="sm">Out of Stock</Badge>;
    if (type === 'low-stock') return <Badge variant="warning" size="sm">Low Stock</Badge>;
    if (type === 'overstocked') return <Badge variant="info" size="sm">Overstocked</Badge>;
    return <Badge variant="secondary" size="sm">{type}</Badge>;
  };

  const stockDeficit = product.reorderLevel
    ? Math.max(0, product.reorderLevel - product.currentStock)
    : 0;

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
      <div className={`p-2 rounded-lg ${
        type === 'critical' || type === 'out-of-stock'
          ? 'bg-danger-50 dark:bg-danger-500/10'
          : type === 'low-stock'
          ? 'bg-warning-50 dark:bg-warning-500/10'
          : 'bg-info-50 dark:bg-info-500/10'
      }`}>
        {type === 'critical' || type === 'out-of-stock' ? (
          <MdError className="w-5 h-5 text-danger-500" />
        ) : type === 'low-stock' ? (
          <MdWarningAmber className="w-5 h-5 text-warning-500" />
        ) : (
          <MdTrendingUp className="w-5 h-5 text-info-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-surface-800 dark:text-surface-100 truncate">{product.name}</p>
          {getBadge()}
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-surface-500 dark:text-surface-400">
          <span>SKU: {product.sku}</span>
          {product.category && <span>Category: {product.category.name}</span>}
          {product.warehouse && <span>Warehouse: {product.warehouse.name}</span>}
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-surface-800 dark:text-surface-100">
            {product.currentStock}
          </span>
          <span className="text-xs text-surface-400">/</span>
          <span className="text-xs text-surface-500">{product.reorderLevel}</span>
        </div>
        <p className="text-xs text-surface-400">Current / Reorder</p>
        {stockDeficit > 0 && (
          <p className="text-xs text-danger-500 mt-0.5">Need +{stockDeficit} units</p>
        )}
      </div>
    </div>
  );
};

const InventoryAlerts = () => {
  const {
    lowStock, outOfStock, criticalAlerts, overstocked,
    statistics, healthScore, loading, refreshing, error, refresh, lastUpdated,
  } = useInventoryAlerts();

  const [activeTab, setActiveTab] = useState('all');

  const alertProducts = useMemo(() => {
    switch (activeTab) {
      case 'critical':     return criticalAlerts.map(p => ({ ...p, _type: 'critical' }));
      case 'low-stock':    return lowStock.map(p => ({ ...p, _type: 'low-stock' }));
      case 'out-of-stock': return outOfStock.map(p => ({ ...p, _type: 'out-of-stock' }));
      case 'overstocked':  return overstocked.map(p => ({ ...p, _type: 'overstocked' }));
      default:
        return [
          ...criticalAlerts.map(p => ({ ...p, _type: 'critical' })),
          ...outOfStock.filter(p => !criticalAlerts.some(c => c.id === p.id)).map(p => ({ ...p, _type: 'out-of-stock' })),
          ...lowStock.filter(p => !outOfStock.some(o => o.id === p.id) && !criticalAlerts.some(c => c.id === p.id)).map(p => ({ ...p, _type: 'low-stock' })),
          ...overstocked.filter(p => !lowStock.some(l => l.id === p.id) && !outOfStock.some(o => o.id === p.id)).map(p => ({ ...p, _type: 'overstocked' })),
        ];
    }
  }, [activeTab, criticalAlerts, outOfStock, lowStock, overstocked]);

  const categoryStats = statistics?.categorySummaries || [];
  const stockDistribution = statistics?.stockDistribution || [];

  if (loading) {
    return (
      <PageWrapper title="Inventory Alerts" subtitle="Monitor stock levels and alerts">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4"><div className="h-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></Card>
            ))}
          </div>
          <Card className="p-6"><div className="h-64 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></Card>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Inventory Alerts" subtitle="Monitor stock levels and alerts">
        <Card className="p-12 text-center">
          <MdError className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <p className="text-surface-600 dark:text-surface-300 mb-4">{error}</p>
          <Button onClick={refresh} variant="primary"><MdRefresh className="w-4 h-4 mr-2" /> Retry</Button>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Inventory Alerts"
      subtitle="Monitor stock levels, alerts, and inventory health"
      actions={
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-surface-400 dark:text-surface-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={refresh} loading={refreshing}>
            <MdRefresh className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={MdInventory}
            label="Total Products"
            value={statistics?.totalProducts}
            color="text-primary-500"
            bgColor="bg-primary-50 dark:bg-primary-500/10"
            subtext={`${statistics?.totalStockQuantity?.toLocaleString()} units`}
          />
          <StatCard
            icon={MdWarningAmber}
            label="Low Stock"
            value={statistics?.lowStockProducts}
            color="text-warning-500"
            bgColor="bg-warning-50 dark:bg-warning-500/10"
            subtext={`Need reorder: ${statistics?.productsRequiringReorder}`}
          />
          <StatCard
            icon={MdError}
            label="Out of Stock"
            value={statistics?.outOfStockProducts}
            color="text-danger-500"
            bgColor="bg-danger-50 dark:bg-danger-500/10"
            subtext="Immediate action"
          />
          <StatCard
            icon={MdTrendingUp}
            label="Overstocked"
            value={statistics?.overstockedProducts}
            color="text-info-500"
            bgColor="bg-info-50 dark:bg-info-500/10"
            subtext="Review levels"
          />
        </div>

        {/* Health Score + Stock Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <HealthScoreGauge score={healthScore} />

          <Card className="p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-4">Stock Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stockDistribution.map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <div className="text-2xl font-bold text-surface-800 dark:text-surface-100">{item.count}</div>
                  <div className="text-xs text-surface-500 dark:text-surface-400 mt-1">{item.label}</div>
                  <div className="text-xs font-medium mt-1" style={{ color: item.color }}>{item.percentage}%</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Value Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success-50 dark:bg-success-500/10">
                <MdStore className="w-5 h-5 text-success-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-surface-800 dark:text-surface-100">
                  ₹{statistics?.totalInventoryValue?.toLocaleString() ?? '—'}
                </p>
                <p className="text-xs text-surface-500">Total Inventory Value</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning-50 dark:bg-warning-500/10">
                <MdWarningAmber className="w-5 h-5 text-warning-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-surface-800 dark:text-surface-100">
                  ₹{statistics?.lowStockValue?.toLocaleString() ?? '—'}
                </p>
                <p className="text-xs text-surface-500">Low Stock Value at Risk</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-info-50 dark:bg-info-500/10">
                <MdLocalShipping className="w-5 h-5 text-info-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-surface-800 dark:text-surface-100">
                  {statistics?.totalReorderQuantity?.toLocaleString() ?? '—'}
                </p>
                <p className="text-xs text-surface-500">Total Reorder Qty Needed</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Alert Tabs + List */}
        <Card>
          <div className="border-b border-surface-100 dark:border-surface-800 px-4">
            <div className="flex overflow-x-auto gap-1 py-2">
              {ALERT_TABS.map((tab) => {
                const Icon = tab.icon;
                const count = tab.key === 'all' ? alertProducts.length
                  : tab.key === 'critical' ? criticalAlerts.length
                  : tab.key === 'low-stock' ? lowStock.length
                  : tab.key === 'out-of-stock' ? outOfStock.length
                  : overstocked.length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.key
                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-surface-100 dark:bg-surface-800">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4">
            {alertProducts.length === 0 ? (
              <div className="text-center py-12">
                <MdCheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-surface-800 dark:text-surface-100 mb-2">All Clear!</h3>
                <p className="text-surface-500 dark:text-surface-400">No alerts found for this category.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {alertProducts.map((product) => (
                  <AlertItem key={`${product.id}-${product._type}`} product={product} type={product._type} />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Category Breakdown */}
        {categoryStats.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-4">
              <MdCategory className="w-4 h-4 inline mr-2" />
              Category Stock Health
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryStats.map((cat) => (
                <div key={cat.categoryName} className="p-3 rounded-xl border border-surface-100 dark:border-surface-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-800 dark:text-surface-100">{cat.categoryName}</span>
                    <span className={`text-xs font-bold ${
                      cat.categoryHealthScore >= 80 ? 'text-success-500' :
                      cat.categoryHealthScore >= 60 ? 'text-warning-500' : 'text-danger-500'
                    }`}>
                      {cat.categoryHealthScore}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-surface-500">
                    <span className="text-success-500">{cat.inStockProducts} OK</span>
                    <span className="text-warning-500">{cat.lowStockProducts} Low</span>
                    <span className="text-danger-500">{cat.outOfStockProducts} Out</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default InventoryAlerts;
