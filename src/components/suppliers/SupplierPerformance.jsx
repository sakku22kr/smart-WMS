import { useState, useEffect, useCallback } from 'react';
import { MdTrendingUp, MdShoppingCart, MdCheckCircle, MdCancel, MdPendingActions, MdLocalShipping, MdInventory2, MdStar, MdCalendarToday } from 'react-icons/md';
import toast from 'react-hot-toast';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import supplierService from '@api/services/supplierService';

const MetricCard = ({ icon: Icon, label, value, subtext, color = 'primary' }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-${color}-500/10`}>
      <Icon size={18} className={`text-${color}-500`} />
    </div>
    <div className="min-w-0">
      <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{value}</p>
      <p className="text-xs text-surface-400 truncate">{label}</p>
      {subtext && <p className="text-xs text-surface-500 mt-0.5">{subtext}</p>}
    </div>
  </div>
);

const MiniBarChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.orderCount), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-primary-500/60 transition-all duration-300"
            style={{ height: `${(d.orderCount / maxVal) * 100}%`, minHeight: d.orderCount > 0 ? '4px' : '0px' }}
            title={`${d.month}: ${d.orderCount} orders`}
          />
          <span className="text-[9px] text-surface-400 leading-none">{d.month.slice(5)}</span>
        </div>
      ))}
    </div>
  );
};

const SupplierPerformance = ({ supplierId }) => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierService.getPerformance(supplierId);
      setPerformance(res?.data);
    } catch {
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => { fetchPerformance(); }, [fetchPerformance]);

  if (loading) {
    return (
      <Card padding="md">
        <div className="space-y-3">
          <div className="h-5 w-40 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface-200 dark:bg-surface-700 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!performance) return null;

  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
          <MdTrendingUp size={16} className="text-primary-500" />
        </div>
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">Performance Analytics</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={MdShoppingCart} label="Total Orders" value={performance.totalOrders} color="primary" />
        <MetricCard icon={MdCheckCircle} label="Completed" value={performance.completedOrders} color="success" />
        <MetricCard icon={MdCancel} label="Cancelled" value={performance.cancelledOrders} color="danger" />
        <MetricCard icon={MdPendingActions} label="Active" value={performance.activeOrders} color="warning" />
        <MetricCard
          icon={MdTrendingUp}
          label="Completion Rate"
          value={`${performance.completionRate ?? 0}%`}
          color="info"
        />
        <MetricCard
          icon={MdLocalShipping}
          label="On-Time Delivery"
          value={`${performance.onTimeDeliveryRate ?? 0}%`}
          color="success"
        />
        <MetricCard
          icon={MdInventory2}
          label="Products Supplied"
          value={performance.totalProducts}
          color="primary"
        />
        <MetricCard
          icon={MdStar}
          label="Rating"
          value={performance.rating ? `${performance.rating.toFixed(1)} / 5.0` : '—'}
          color="warning"
        />
      </div>

      <div className="mt-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-surface-400 uppercase tracking-wide">Financial Summary</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-surface-400">Total Order Value</p>
            <p className="text-sm font-bold text-surface-800 dark:text-surface-100">
              ₹{(performance.totalOrderValue || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-surface-400">Avg Order Value</p>
            <p className="text-sm font-bold text-surface-800 dark:text-surface-100">
              ₹{(performance.averageOrderValue || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {performance.lastOrderDate && (
        <div className="mt-3 flex items-center gap-2 text-xs text-surface-400">
          <MdCalendarToday size={12} />
          <span>Last order: {new Date(performance.lastOrderDate).toLocaleDateString()}</span>
          {performance.daysSinceLastOrder != null && (
            <Badge variant="surface" size="sm">{performance.daysSinceLastOrder}d ago</Badge>
          )}
        </div>
      )}

      {performance.monthlyOrders && performance.monthlyOrders.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <p className="text-xs text-surface-400 uppercase tracking-wide mb-2">Monthly Orders (Last 6 Months)</p>
          <MiniBarChart data={performance.monthlyOrders} />
        </div>
      )}
    </Card>
  );
};

export default SupplierPerformance;
