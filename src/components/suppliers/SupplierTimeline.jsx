import { useState, useEffect, useCallback } from 'react';
import { MdHistory, MdEdit, MdAddCircle, MdDelete, MdRestore, MdCheckCircle, MdBlock, MdStar, MdLocalShipping, MdShoppingCart } from 'react-icons/md';
import toast from 'react-hot-toast';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import supplierService from '@api/services/supplierService';

const ENTRY_ICONS = {
  SUPPLIER_CREATED: { icon: MdAddCircle, color: 'success' },
  SUPPLIER_UPDATED: { icon: MdEdit, color: 'info' },
  SUPPLIER_DELETED: { icon: MdDelete, color: 'danger' },
  SUPPLIER_RESTORED: { icon: MdRestore, color: 'success' },
  SUPPLIER_ACTIVATED: { icon: MdCheckCircle, color: 'success' },
  SUPPLIER_DEACTIVATED: { icon: MdBlock, color: 'warning' },
  SUPPLIER_RATING_UPDATED: { icon: MdStar, color: 'warning' },
  SUPPLIER_NOTES_UPDATED: { icon: MdEdit, color: 'info' },
};

const PO_STATUS_VARIANT = {
  DRAFT: 'surface',
  PENDING: 'warning',
  APPROVED: 'info',
  REJECTED: 'danger',
  ORDERED: 'primary',
  PARTIALLY_RECEIVED: 'warning',
  RECEIVED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const TimelineItem = ({ entry }) => {
  const isActivity = entry.entryType === 'ACTIVITY';
  const iconConfig = isActivity ? ENTRY_ICONS[entry.type] : null;
  const IconComp = iconConfig?.icon || MdShoppingCart;
  const iconColor = iconConfig?.color || 'info';

  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-${iconColor}-500/10 group-hover:bg-${iconColor}-500/20 transition-colors`}>
          <IconComp size={14} className={`text-${iconColor}-500`} />
        </div>
        <div className="w-px flex-1 bg-surface-200 dark:bg-surface-700 min-h-[20px]" />
      </div>
      <div className="pb-4 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-surface-700 dark:text-surface-200 leading-snug">
            {entry.description}
          </p>
          {isActivity ? (
            <Badge variant="surface" size="sm">Activity</Badge>
          ) : (
            <Badge variant={PO_STATUS_VARIANT[entry.type] || 'info'} size="sm" dot>{entry.type}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-surface-400">{entry.actor}</span>
          <span className="text-xs text-surface-300 dark:text-surface-600">·</span>
          <span className="text-xs text-surface-400">
            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
          </span>
        </div>
        {entry.orderNumber && (
          <div className="mt-1">
            <Badge variant="primary" size="sm">
              <MdLocalShipping size={10} className="mr-1" />
              {entry.orderNumber}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

const SupplierTimeline = ({ supplierId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierService.getTimeline(supplierId, { limit: 25 });
      setTimeline(res?.data ?? []);
    } catch {
      toast.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => { fetchTimeline(); }, [fetchTimeline]);

  if (loading) {
    return (
      <Card padding="md">
        <div className="space-y-3">
          <div className="h-5 w-32 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 skeleton-shimmer" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
                <div className="h-3 w-24 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
          <MdHistory size={16} className="text-primary-500" />
        </div>
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">Activity Timeline</h3>
      </div>

      {timeline.length === 0 ? (
        <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-4">No activity recorded yet.</p>
      ) : (
        <div className="space-y-0">
          {timeline.map((entry, idx) => (
            <TimelineItem key={`${entry.entryType}-${entry.id}-${idx}`} entry={entry} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default SupplierTimeline;
