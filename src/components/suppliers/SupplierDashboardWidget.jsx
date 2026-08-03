import { useState, useEffect, useCallback } from 'react';
import { MdLocalShipping, MdTrendingUp, MdStar, MdShoppingCart, MdPeople } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import supplierService from '@api/services/supplierService';

const formatCurrency = (n) => {
  if (n === undefined || n === null) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString()}`;
};

const SupplierDashboardWidget = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierService.getDashboard();
      setDashboard(res?.data);
    } catch {
      // Silently fail - widget is optional
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) {
    return (
      <Card padding="md">
        <div className="space-y-3">
          <div className="h-5 w-32 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface-200 dark:bg-surface-700 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!dashboard) return null;

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-info-500/10 flex items-center justify-center flex-shrink-0">
            <MdLocalShipping size={16} className="text-info-500" />
          </div>
          <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">Supplier Overview</h3>
        </div>
        <button
          onClick={() => navigate('/suppliers')}
          className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
        >
          View All →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <div className="flex items-center gap-2 mb-1">
            <MdPeople size={14} className="text-info-500" />
            <span className="text-xs text-surface-400">Total</span>
          </div>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{dashboard.totalSuppliers}</p>
          <p className="text-xs text-surface-400">{dashboard.activeSuppliers} active</p>
        </div>
        <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <div className="flex items-center gap-2 mb-1">
            <MdStar size={14} className="text-warning-500" />
            <span className="text-xs text-surface-400">Avg Rating</span>
          </div>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{dashboard.averageRating?.toFixed(1) ?? '—'}</p>
          <p className="text-xs text-surface-400">out of 5.0</p>
        </div>
        <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <div className="flex items-center gap-2 mb-1">
            <MdShoppingCart size={14} className="text-primary-500" />
            <span className="text-xs text-surface-400">Active POs</span>
          </div>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{dashboard.activePOCount}</p>
          <p className="text-xs text-surface-400">{dashboard.pendingPOCount} pending</p>
        </div>
        <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <div className="flex items-center gap-2 mb-1">
            <MdTrendingUp size={14} className="text-success-500" />
            <span className="text-xs text-surface-400">PO Value</span>
          </div>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{formatCurrency(dashboard.totalPOValue)}</p>
          <p className="text-xs text-surface-400">total spend</p>
        </div>
      </div>

      {dashboard.topSuppliersByValue && dashboard.topSuppliersByValue.length > 0 && (
        <div>
          <p className="text-xs text-surface-400 uppercase tracking-wide mb-2">Top Suppliers by Value</p>
          <div className="space-y-1.5">
            {dashboard.topSuppliersByValue.slice(0, 3).map((supplier) => (
              <div
                key={supplier.id}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/suppliers/${supplier.id}`)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <MdLocalShipping size={12} className="text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-surface-800 dark:text-surface-100 truncate">{supplier.name}</p>
                    <p className="text-[10px] text-surface-400 font-mono">{supplier.code}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-surface-800 dark:text-surface-100">{formatCurrency(supplier.totalOrderValue)}</p>
                  {supplier.rating && (
                    <div className="flex items-center gap-0.5 justify-end">
                      <MdStar size={10} className="text-warning-500" />
                      <span className="text-[10px] text-surface-400">{supplier.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboard.statusDistribution && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {dashboard.statusDistribution.map((item) => (
            <Badge key={item.status} variant={item.status === 'ACTIVE' ? 'success' : item.status === 'INACTIVE' ? 'warning' : 'danger'} size="sm">
              {item.status}: {item.count}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};

export default SupplierDashboardWidget;
