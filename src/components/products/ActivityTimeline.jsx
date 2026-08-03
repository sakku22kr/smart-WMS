import { motion } from 'framer-motion';
import clsx from 'clsx';
import { MdAdd, MdEdit, MdDelete, MdRestore, MdCheckCircle, MdPauseCircle, MdInventory2, MdLocalShipping, MdStore, MdCategory } from 'react-icons/md';

const EVENT_CONFIG = {
  PRODUCT_CREATED:          { icon: MdAdd, color: 'bg-success-500', textColor: 'text-success-600 dark:text-success-400', label: 'Created' },
  PRODUCT_UPDATED:          { icon: MdEdit, color: 'bg-primary-500', textColor: 'text-primary-600 dark:text-primary-400', label: 'Updated' },
  PRODUCT_DELETED:          { icon: MdDelete, color: 'bg-danger-500', textColor: 'text-danger-600 dark:text-danger-400', label: 'Deleted' },
  PRODUCT_RESTORED:         { icon: MdRestore, color: 'bg-info-500', textColor: 'text-info-600 dark:text-info-400', label: 'Restored' },
  PRODUCT_ACTIVATED:        { icon: MdCheckCircle, color: 'bg-success-500', textColor: 'text-success-600 dark:text-success-400', label: 'Activated' },
  PRODUCT_DEACTIVATED:      { icon: MdPauseCircle, color: 'bg-warning-500', textColor: 'text-warning-600 dark:text-warning-400', label: 'Deactivated' },
  PRODUCT_STOCK_ADJUSTED:   { icon: MdInventory2, color: 'bg-info-500', textColor: 'text-info-600 dark:text-info-400', label: 'Stock Adjusted' },
  PRODUCT_STOCK_RESERVED:   { icon: MdInventory2, color: 'bg-warning-500', textColor: 'text-warning-600 dark:text-warning-400', label: 'Stock Reserved' },
  PRODUCT_STOCK_RELEASED:   { icon: MdInventory2, color: 'bg-info-500', textColor: 'text-info-600 dark:text-info-400', label: 'Stock Released' },
  PRODUCT_DISPATCHED:       { icon: MdInventory2, color: 'bg-danger-500', textColor: 'text-danger-600 dark:text-danger-400', label: 'Dispatched' },
  PRODUCT_STATUS_CHANGED:   { icon: MdEdit, color: 'bg-primary-500', textColor: 'text-primary-600 dark:text-primary-400', label: 'Status Changed' },
  PRODUCT_CATEGORY_CHANGED: { icon: MdCategory, color: 'bg-info-500', textColor: 'text-info-600 dark:text-info-400', label: 'Category Changed' },
  PRODUCT_SUPPLIER_CHANGED: { icon: MdLocalShipping, color: 'bg-warning-500', textColor: 'text-warning-600 dark:text-warning-400', label: 'Supplier Changed' },
  PRODUCT_WAREHOUSE_CHANGED:{ icon: MdStore, color: 'bg-surface-500', textColor: 'text-surface-600 dark:text-surface-400', label: 'Warehouse Changed' },
};

const formatTimestamp = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatFullTimestamp = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const EventIcon = ({ eventType }) => {
  const config = EVENT_CONFIG[eventType] || EVENT_CONFIG.PRODUCT_UPDATED;
  const Icon = config.icon;
  return (
    <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', config.color)}>
      <Icon size={16} className="text-white" />
    </div>
  );
};

const ActivityTimeline = ({ logs = [], compact = false }) => {
  if (!logs.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-surface-400">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-surface-200 dark:bg-surface-700" />

      <div className="space-y-0">
        {logs.map((log, idx) => {
          const config = EVENT_CONFIG[log.eventType] || EVENT_CONFIG.PRODUCT_UPDATED;
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="relative flex items-start gap-3 py-3"
            >
              <EventIcon eventType={log.eventType} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={clsx('text-xs font-semibold', config.textColor)}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-surface-400 font-mono">
                    {formatTimestamp(log.performedAt)}
                  </span>
                </div>
                {log.description && (
                  <p className="text-sm text-surface-700 dark:text-surface-200 mt-0.5 truncate">
                    {log.description}
                  </p>
                )}
                {!compact && (
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-surface-400">
                      by <span className="font-medium text-surface-500 dark:text-surface-300">{log.performedBy}</span>
                    </span>
                    <span className="text-[11px] text-surface-400" title={formatFullTimestamp(log.performedAt)}>
                      {formatFullTimestamp(log.performedAt)}
                    </span>
                  </div>
                )}
                {!compact && log.oldValue && log.newValue && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-danger-500/5 border border-danger-500/10">
                      <p className="text-[10px] uppercase text-danger-500 font-semibold mb-0.5">Before</p>
                      <p className="text-[11px] text-surface-600 dark:text-surface-300 font-mono truncate">{log.oldValue}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-success-500/5 border border-success-500/10">
                      <p className="text-[10px] uppercase text-success-500 font-semibold mb-0.5">After</p>
                      <p className="text-[11px] text-surface-600 dark:text-surface-300 font-mono truncate">{log.newValue}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export { EVENT_CONFIG, formatTimestamp, formatFullTimestamp };
export default ActivityTimeline;
