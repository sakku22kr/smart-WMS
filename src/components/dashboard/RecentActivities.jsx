import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  MdInventory2, MdWarehouse, MdShoppingCart, MdPeople,
  MdArrowUpward, MdArrowDownward, MdEdit, MdAddCircle,
  MdCheckCircle, MdLocalShipping, MdWarningAmber,
  MdPowerSettingsNew, MdBuild, MdRestore, MdCategory,
} from 'react-icons/md';
import { HiOutlineClock } from 'react-icons/hi2';
import Skeleton from '@components/common/Skeleton';
import activityService from '@/api/services/activityService';

// ─── Activity color/icon map ──────────────────────────────────
const TYPE_CONFIG = {
  stock_in:  { icon: MdArrowDownward, bg: 'bg-success-500/10', text: 'text-success-600 dark:text-success-400', dot: 'bg-success-500' },
  stock_out: { icon: MdArrowUpward,   bg: 'bg-danger-500/10',  text: 'text-danger-600  dark:text-danger-400',  dot: 'bg-danger-500'  },
  order:     { icon: MdShoppingCart,  bg: 'bg-primary-500/10', text: 'text-primary-600 dark:text-primary-400', dot: 'bg-primary-500' },
  product:   { icon: MdInventory2,    bg: 'bg-violet-500/10',  text: 'text-violet-600  dark:text-violet-400',  dot: 'bg-violet-500'  },
  warehouse: { icon: MdWarehouse,     bg: 'bg-info-500/10',    text: 'text-info-600    dark:text-info-400',    dot: 'bg-info-500'    },
  category:  { icon: MdCategory,      bg: 'bg-violet-500/10',  text: 'text-violet-600  dark:text-violet-400',  dot: 'bg-violet-500'  },
  user:      { icon: MdPeople,        bg: 'bg-warning-500/10', text: 'text-warning-600 dark:text-warning-400', dot: 'bg-warning-500' },
  edit:      { icon: MdEdit,          bg: 'bg-surface-100 dark:bg-surface-700', text: 'text-surface-500 dark:text-surface-400', dot: 'bg-surface-400' },
  approved:  { icon: MdCheckCircle,   bg: 'bg-success-500/10', text: 'text-success-600 dark:text-success-400', dot: 'bg-success-500' },
  shipped:   { icon: MdLocalShipping, bg: 'bg-info-500/10',    text: 'text-info-600    dark:text-info-400',    dot: 'bg-info-500'    },
  added:     { icon: MdAddCircle,     bg: 'bg-primary-500/10', text: 'text-primary-600 dark:text-primary-400', dot: 'bg-primary-500' },
  low_stock: { icon: MdWarningAmber,  bg: 'bg-warning-500/10', text: 'text-warning-600 dark:text-warning-400', dot: 'bg-warning-500' },
  out_stock: { icon: MdWarningAmber,  bg: 'bg-danger-500/10',  text: 'text-danger-600  dark:text-danger-400',  dot: 'bg-danger-500'  },
  activate:  { icon: MdCheckCircle,   bg: 'bg-success-500/10', text: 'text-success-600 dark:text-success-400', dot: 'bg-success-500' },
  deactivate:{ icon: MdPowerSettingsNew, bg: 'bg-danger-500/10', text: 'text-danger-600 dark:text-danger-400', dot: 'bg-danger-500' },
  maintenance:{ icon: MdBuild,        bg: 'bg-warning-500/10', text: 'text-warning-600 dark:text-warning-400', dot: 'bg-warning-500' },
  restore:   { icon: MdRestore,       bg: 'bg-info-500/10',    text: 'text-info-600 dark:text-info-400',       dot: 'bg-info-500'    },
};

// ─── Map activityType to TYPE_CONFIG key ──────────────────────
function mapActivityType(activityType) {
  if (!activityType) return 'edit';
  const t = activityType.toUpperCase();
  if (t.includes('WAREHOUSE_CREATED') || t.includes('PRODUCT_CREATED') || t.includes('CATEGORY_CREATED'))  return 'added';
  if (t.includes('WAREHOUSE_UPDATED') || t.includes('PRODUCT_UPDATED') || t.includes('CATEGORY_UPDATED'))  return 'edit';
  if (t.includes('WAREHOUSE_DELETED') || t.includes('PRODUCT_DELETED') || t.includes('CATEGORY_DELETED'))  return 'out_stock';
  if (t.includes('WAREHOUSE_RESTORED') || t.includes('CATEGORY_RESTORED'))                                 return 'restore';
  if (t.includes('WAREHOUSE_ACTIVATED') || t.includes('CATEGORY_ACTIVATED'))                               return 'activate';
  if (t.includes('WAREHOUSE_DEACTIVATED') || t.includes('CATEGORY_DEACTIVATED'))                           return 'deactivate';
  if (t.includes('WAREHOUSE_MAINTENANCE'))                                                                 return 'maintenance';
  if (t.includes('USER_CREATED'))     return 'added';
  if (t.includes('USER_DELETED'))     return 'out_stock';
  if (t.includes('USER_ACTIVATED'))   return 'activate';
  if (t.includes('USER_DEACTIVATED')) return 'deactivate';
  if (t.includes('USER_LOGIN'))       return 'approved';
  if (t.includes('ROLE_ASSIGNED') || t.includes('ROLE_ADDED') || t.includes('ROLE_REMOVED')) return 'user';
  if (t.includes('PURCHASE_ORDER'))   return 'order';
  if (t.includes('ORDER_APPROVED'))   return 'approved';
  if (t.includes('ORDER_RECEIVED'))   return 'shipped';
  if (t.includes('ORDER_CANCELLED'))  return 'out_stock';
  if (t.includes('ORDER_REJECTED'))   return 'out_stock';
  if (t.includes('STOCK_RECEIVED'))   return 'shipped';
  if (t.includes('CATEGORY_')) return 'category';
  return 'edit';
}

// ─── Format relative time ─────────────────────────────────────
function formatRelativeTime(dateStr) {
  if (!dateStr) return 'recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24)  return `${diffHr}h ago`;
  if (diffDay < 7)  return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

// ─── Fallback static activities (shown when no live data) ─────
const STATIC_ACTIVITIES = [
  { id: 's1', type: 'stock_in',  title: 'Stock received — Wireless Headset Pro', detail: '200 units added to Warehouse A',         time: 'recently', user: 'System' },
  { id: 's2', type: 'order',     title: 'Purchase Order #PO-1042 approved',      detail: 'TechSupply Co. — ₹2,40,000 — 24 items', time: 'recently', user: 'Admin'  },
  { id: 's3', type: 'stock_out', title: 'Stock dispatched — USB-C Hub 7-Port',   detail: '50 units shipped from Warehouse B',      time: 'recently', user: 'System' },
  { id: 's4', type: 'added',     title: 'New product added',                     detail: 'Use Add Product to register inventory',  time: 'recently', user: 'Admin'  },
];

// ─── Build live activity list from backend data ───────────────
function buildStockActivities(lowStock, outOfStock) {
  const activities = [];

  outOfStock.slice(0, 3).forEach((p, i) => {
    activities.push({
      id:     `oos-${p.id ?? i}`,
      type:   'out_stock',
      title:  `Out of Stock — ${p.name}`,
      detail: `SKU: ${p.sku} · ${p.category?.name ?? 'Uncategorised'} — 0 units remaining`,
      time:   'now',
      user:   'System',
    });
  });

  lowStock.slice(0, 4).forEach((p, i) => {
    activities.push({
      id:     `low-${p.id ?? i}`,
      type:   'low_stock',
      title:  `Low stock alert — ${p.name}`,
      detail: `SKU: ${p.sku} · Only ${p.currentStock} unit${p.currentStock !== 1 ? 's' : ''} left (min: ${p.reorderLevel})`,
      time:   'now',
      user:   'System',
    });
  });

  return activities;
}

// ─── Build activities from backend activity logs ──────────────
function buildFromLogs(logs) {
  return logs.slice(0, 10).map((log) => ({
    id:     `log-${log.id}`,
    type:   mapActivityType(log.activityType),
    title:  log.description || log.activityType?.replace(/_/g, ' ').toLowerCase(),
    detail: log.actorName ? `By ${log.actorName}` : log.actorEmail || '',
    time:   formatRelativeTime(log.createdAt),
    user:   log.actorName || log.actorEmail || 'System',
  }));
}

// ─── Single activity row ──────────────────────────────────────
const ActivityItem = ({ activity, isLast, index }) => {
  const cfg  = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.edit;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="relative flex gap-3"
    >
      {/* Timeline spine */}
      {!isLast && (
        <div className="absolute left-[18px] top-10 bottom-0 w-px bg-surface-200 dark:bg-surface-700/60" />
      )}

      {/* Icon bubble */}
      <div className={clsx(
        'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 z-10',
        cfg.bg,
      )}>
        <Icon size={17} className={cfg.text} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <p className="text-sm font-medium text-surface-800 dark:text-surface-100 leading-snug">
          {activity.title}
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 leading-relaxed truncate">
          {activity.detail}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <HiOutlineClock size={11} className="text-surface-400 flex-shrink-0" />
          <span className="text-[11px] text-surface-400 dark:text-surface-500">
            {activity.time}
          </span>
          <span className="text-surface-300 dark:text-surface-600 text-xs">·</span>
          <span className="text-[11px] text-surface-400 dark:text-surface-500 truncate">
            {activity.user}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────
const ActivitySkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-3">
        <Skeleton circle height="36px" width="36px" className="flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton height="13px" className="w-3/4" />
          <Skeleton height="11px" className="w-1/2" />
          <Skeleton height="10px" className="w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

// ─── RecentActivities ─────────────────────────────────────────
/**
 * RecentActivities — timeline-style activity feed.
 * Fetches real activity logs from backend, merges with stock alerts.
 *
 * @param {Array}   lowStock   - Live low-stock products
 * @param {Array}   outOfStock - Live out-of-stock products
 * @param {boolean} loading
 */
const RecentActivities = ({ lowStock = [], outOfStock = [], loading = false }) => {
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await activityService.getRecent();
      if (!mountedRef.current) return;
      setLogs(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[RecentActivities] Failed to fetch activity logs:', err);
      setLogs([]);
    } finally {
      if (mountedRef.current) setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchLogs();
    return () => { mountedRef.current = false; };
  }, [fetchLogs]);

  const activities = useMemo(() => {
    const logActivities = buildFromLogs(logs);
    const stockActivities = buildStockActivities(lowStock, outOfStock);
    const combined = [...logActivities, ...stockActivities];
    return combined.length > 0 ? combined : STATIC_ACTIVITIES;
  }, [logs, lowStock, outOfStock]);

  const isDataLoading = loading || logsLoading;

  return (
    <div className={clsx(
      'rounded-2xl overflow-hidden',
      'bg-white/80 dark:bg-surface-800/80',
      'backdrop-blur-xl',
      'border border-white/60 dark:border-surface-700/50',
      'shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.28)]',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-700/50">
        <div>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">Recent Activity</h3>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
            {logs.length > 0 ? 'System activity logs' : 'Latest inventory operations'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Activity list */}
      <div className="p-5 overflow-y-auto max-h-[420px] no-scrollbar">
        {isDataLoading ? (
          <ActivitySkeleton />
        ) : (
          <div>
            {activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={index === activities.length - 1}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-surface-100 dark:border-surface-700/50">
        <button className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline underline-offset-2 transition-all">
          View all activity →
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
