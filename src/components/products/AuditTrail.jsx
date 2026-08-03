import { useEffect, useState } from 'react';
import { MdHistory, MdFilterList, MdRefresh } from 'react-icons/md';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import productAuditService from '@/api/services/productAuditService';
import ActivityTimeline from './ActivityTimeline';

const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'All Events' },
  { value: 'PRODUCT_CREATED', label: 'Created' },
  { value: 'PRODUCT_UPDATED', label: 'Updated' },
  { value: 'PRODUCT_DELETED', label: 'Deleted' },
  { value: 'PRODUCT_RESTORED', label: 'Restored' },
  { value: 'PRODUCT_ACTIVATED', label: 'Activated' },
  { value: 'PRODUCT_DEACTIVATED', label: 'Deactivated' },
  { value: 'PRODUCT_STOCK_ADJUSTED', label: 'Stock Adjusted' },
  { value: 'PRODUCT_STOCK_RESERVED', label: 'Stock Reserved' },
  { value: 'PRODUCT_STOCK_RELEASED', label: 'Stock Released' },
  { value: 'PRODUCT_DISPATCHED', label: 'Dispatched' },
];

const AuditTrailSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-start gap-3 py-3 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-surface-200 dark:bg-surface-700 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded" />
          <div className="h-3 w-48 bg-surface-200 dark:bg-surface-700 rounded" />
          <div className="h-3 w-24 bg-surface-200 dark:bg-surface-700 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const AuditTrail = ({ productId, compact = false }) => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventType, setEventType] = useState('');
  const [page, setPage] = useState(0);
  const size = compact ? 10 : 20;

  const fetchLogs = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const params = { page, size };
      if (eventType) params.eventType = eventType;
      const res = await productAuditService.getAuditLogs(productId, params);
      const payload = res?.data;
      setLogs(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [productId, page, eventType]);
  useEffect(() => { setPage(0); }, [productId]);

  return (
    <Card
      padding="md"
      title={compact ? 'Activity' : 'Activity History'}
      subtitle={compact ? `Last ${logs.length} of ${total} events` : `${total} events total`}
      headerAction={
        <div className="flex items-center gap-2">
          {!compact && (
            <div className="relative">
              <select
                value={eventType}
                onChange={(e) => { setEventType(e.target.value); setPage(0); }}
                className="appearance-none text-xs bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg px-3 py-1.5 pr-8 text-surface-700 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <MdFilterList size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<MdRefresh />}
            onClick={() => fetchLogs()}
            disabled={loading}
          />
        </div>
      }
    >
      {loading ? (
        <AuditTrailSkeleton />
      ) : (
        <ActivityTimeline logs={logs} compact={compact} />
      )}

      {!compact && total > size && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100 dark:border-surface-700">
          <span className="text-xs text-surface-400">
            Page {page + 1} of {Math.ceil(total / size)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * size >= total}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {!compact && logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MdHistory size={32} className="text-surface-300 dark:text-surface-600 mb-2" />
          <p className="text-sm text-surface-400">No activity recorded yet for this product.</p>
        </div>
      )}
    </Card>
  );
};

export default AuditTrail;
