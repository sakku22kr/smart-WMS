import { useState, useEffect, useCallback } from 'react';
import { MdTrendingUp, MdStar, MdShoppingCart, MdLocalShipping, MdAssessment } from 'react-icons/md';
import Card from '@components/ui/Card';
import supplierService from '@api/services/supplierService';

const formatCurrency = (n) => {
  if (n === undefined || n === null) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString()}`;
};

const KpiCard = ({ icon: Icon, label, value, subtext, color = 'primary' }) => (
  <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-950/20 border border-${color}-200 dark:border-${color}-800`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className={`text-${color}-500`} />
      <span className="text-xs text-surface-400">{label}</span>
    </div>
    <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{value}</p>
    {subtext && <p className="text-[10px] text-surface-400 mt-0.5">{subtext}</p>}
  </div>
);

const SupplierKpiCards = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKpis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierService.getKpis();
      setKpis(res?.data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKpis(); }, [fetchKpis]);

  if (loading) {
    return (
      <Card padding="md">
        <div className="space-y-3">
          <div className="h-5 w-40 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface-200 dark:bg-surface-700 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!kpis) return null;

  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
          <MdAssessment size={16} className="text-primary-500" />
        </div>
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">Supplier KPIs</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={MdLocalShipping}
          label="Total Suppliers"
          value={kpis.totalSuppliers}
          subtext={`${kpis.activeSuppliers} active`}
          color="info"
        />
        <KpiCard
          icon={MdTrendingUp}
          label="Growth Rate"
          value={`${kpis.growthRate ?? 0}%`}
          subtext="Active ratio"
          color="success"
        />
        <KpiCard
          icon={MdStar}
          label="Avg Rating"
          value={kpis.averageRating?.toFixed(1) ?? '—'}
          subtext={`${kpis.fiveStarCount} five-star`}
          color="warning"
        />
        <KpiCard
          icon={MdShoppingCart}
          label="Products Sourced"
          value={kpis.totalProductsSourced?.toLocaleString() ?? '—'}
          subtext={`Avg ${kpis.avgProductsPerSupplier ?? 0}/supplier`}
          color="primary"
        />
        <KpiCard
          icon={MdShoppingCart}
          label="Total Procurement"
          value={formatCurrency(kpis.totalProcurementValue)}
          subtext={`Avg ${formatCurrency(kpis.averageOrderValue)}/order`}
          color="success"
        />
        <KpiCard
          icon={MdTrendingUp}
          label="Completion Rate"
          value={`${kpis.completionRate ?? 0}%`}
          subtext="Order completion"
          color="info"
        />
        <KpiCard
          icon={MdTrendingUp}
          label="On-Time Delivery"
          value={`${kpis.onTimeDeliveryRate ?? 0}%`}
          subtext="Delivery performance"
          color="success"
        />
        <KpiCard
          icon={MdStar}
          label="Low Rated"
          value={kpis.lowRatedCount ?? 0}
          subtext="Below 3.0 rating"
          color="danger"
        />
      </div>

      {kpis.topPerformers && kpis.topPerformers.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-surface-400 uppercase tracking-wide mb-2">Top Performing Suppliers</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                  <th className="pb-2 font-medium">Supplier</th>
                  <th className="pb-2 font-medium text-right">Rating</th>
                  <th className="pb-2 font-medium text-right">Orders</th>
                  <th className="pb-2 font-medium text-right">Completion</th>
                </tr>
              </thead>
              <tbody>
                {kpis.topPerformers.slice(0, 5).map((supplier) => (
                  <tr key={supplier.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <td className="py-2">
                      <p className="font-medium text-surface-800 dark:text-surface-100">{supplier.name}</p>
                      <p className="text-[10px] text-surface-400 font-mono">{supplier.code}</p>
                    </td>
                    <td className="py-2 text-right">
                      <span className="inline-flex items-center gap-0.5">
                        <MdStar size={10} className="text-warning-500" />
                        {supplier.rating?.toFixed(1) ?? '—'}
                      </span>
                    </td>
                    <td className="py-2 text-right text-surface-600 dark:text-surface-300">{supplier.orderCount}</td>
                    <td className="py-2 text-right">
                      <span className={`font-medium ${supplier.completionRate >= 80 ? 'text-success-500' : supplier.completionRate >= 50 ? 'text-warning-500' : 'text-danger-500'}`}>
                        {supplier.completionRate?.toFixed(0) ?? 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SupplierKpiCards;
