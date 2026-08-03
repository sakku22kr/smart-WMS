import { useState, useEffect, useCallback } from 'react';
import { MdReceipt, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import supplierService from '@api/services/supplierService';

const formatCurrency = (n) => {
  if (n === undefined || n === null) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString()}`;
};

const SupplierTransactionSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierService.getTransactionSummary();
      setSummary(res?.data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  if (loading) {
    return (
      <Card padding="md">
        <div className="space-y-3">
          <div className="h-5 w-48 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface-200 dark:bg-surface-700 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!summary) return null;

  const growth = summary.monthOverMonthGrowth || 0;

  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-success-500/10 flex items-center justify-center flex-shrink-0">
          <MdReceipt size={16} className="text-success-500" />
        </div>
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">Transaction Summary</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <p className="text-xs text-surface-400">Total Transactions</p>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{summary.totalTransactions}</p>
          <p className="text-xs text-surface-400">{formatCurrency(summary.totalValue)} total</p>
        </div>
        <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <p className="text-xs text-surface-400">Avg Transaction</p>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{formatCurrency(summary.averageValue)}</p>
          <p className="text-xs text-surface-400">per order</p>
        </div>
        <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <p className="text-xs text-surface-400">This Month</p>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{summary.thisMonthCount}</p>
          <p className="text-xs text-surface-400">{formatCurrency(summary.thisMonthValue)}</p>
        </div>
        <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <p className="text-xs text-surface-400">MoM Growth</p>
          <div className="flex items-center gap-1">
            <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{Math.abs(growth).toFixed(1)}%</p>
            {growth > 0 ? (
              <MdTrendingUp size={16} className="text-success-500" />
            ) : growth < 0 ? (
              <MdTrendingDown size={16} className="text-danger-500" />
            ) : null}
          </div>
          <p className="text-xs text-surface-400">vs last month</p>
        </div>
      </div>

      {summary.statusBreakdown && summary.statusBreakdown.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-surface-400 uppercase tracking-wide mb-2">By Status</p>
          <div className="flex items-center gap-2 flex-wrap">
            {summary.statusBreakdown.map((item) => (
              <Badge key={item.status} variant={item.status === 'COMPLETED' ? 'success' : item.status === 'PENDING' ? 'warning' : 'surface'} size="sm">
                {item.status}: {item.count}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {summary.topSuppliers && summary.topSuppliers.length > 0 && (
        <div>
          <p className="text-xs text-surface-400 uppercase tracking-wide mb-2">Top Suppliers by Transactions</p>
          <div className="space-y-1.5">
            {summary.topSuppliers.slice(0, 3).map((supplier) => (
              <div key={supplier.supplierId} className="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-surface-800 dark:text-surface-100 truncate">{supplier.supplierName}</p>
                  <p className="text-[10px] text-surface-400 font-mono">{supplier.supplierCode}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-surface-800 dark:text-surface-100">{supplier.transactionCount} orders</p>
                  <p className="text-[10px] text-surface-400">{formatCurrency(supplier.totalValue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SupplierTransactionSummary;
