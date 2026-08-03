import { useState, useEffect, useCallback } from 'react';
import { MdBarChart } from 'react-icons/md';
import Card from '@components/ui/Card';
import supplierService from '@api/services/supplierService';

const MiniBarChart = ({ data, labelKey = 'month', valueKey = 'orderCount', color = 'primary' }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d[valueKey] || 0), 1);

  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => {
        const val = d[valueKey] || 0;
        const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-surface-400 font-medium">{val}</span>
            <div
              className={`w-full rounded-t bg-${color}-500/60 hover:bg-${color}-500/80 transition-all duration-300 cursor-default`}
              style={{ height: `${Math.max(height, 2)}%` }}
              title={`${d[labelKey]}: ${val}`}
            />
            <span className="text-[9px] text-surface-400 leading-none">{d[labelKey]?.slice(5) || ''}</span>
          </div>
        );
      })}
    </div>
  );
};

const SupplierPerformanceChart = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
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

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <Card padding="md">
        <div className="space-y-3">
          <div className="h-5 w-48 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
          <div className="h-40 bg-surface-200 dark:bg-surface-700 rounded-xl skeleton-shimmer" />
        </div>
      </Card>
    );
  }

  if (!kpis) return null;

  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
          <MdBarChart size={16} className="text-primary-500" />
        </div>
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">Performance Trends</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-surface-400 uppercase tracking-wide mb-2">Monthly Orders (Last 6 Months)</p>
          {kpis.monthlyTrends && kpis.monthlyTrends.length > 0 ? (
            <MiniBarChart data={kpis.monthlyTrends} valueKey="orderCount" color="primary" />
          ) : (
            <p className="text-xs text-surface-400 text-center py-4">No data available</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-surface-200 dark:border-surface-700">
          <div>
            <p className="text-xs text-surface-400 mb-1">Completion Rate</p>
            <div className="relative h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-success-500 rounded-full transition-all duration-500"
                style={{ width: `${kpis.completionRate || 0}%` }}
              />
            </div>
            <p className="text-xs font-medium text-surface-600 dark:text-surface-300 mt-1">{kpis.completionRate?.toFixed(1) ?? 0}%</p>
          </div>
          <div>
            <p className="text-xs text-surface-400 mb-1">On-Time Delivery</p>
            <div className="relative h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-info-500 rounded-full transition-all duration-500"
                style={{ width: `${kpis.onTimeDeliveryRate || 0}%` }}
              />
            </div>
            <p className="text-xs font-medium text-surface-600 dark:text-surface-300 mt-1">{kpis.onTimeDeliveryRate?.toFixed(1) ?? 0}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SupplierPerformanceChart;
