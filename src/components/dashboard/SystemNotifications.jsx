import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  MdWarningAmber, MdError, MdCheckCircle, MdInfo,
  MdShoppingCart, MdClose, MdNotificationsActive,
} from 'react-icons/md';
import { HiOutlineClock } from 'react-icons/hi2';
import Skeleton from '@components/common/Skeleton';

// ─── Notification type config ─────────────────────────────────
const NOTIF_CONFIG = {
  warning: {
    icon:      MdWarningAmber,
    bg:        'bg-warning-500/8 dark:bg-warning-500/10',
    border:    'border-warning-200 dark:border-warning-800/60',
    iconBg:    'bg-warning-500/12',
    iconText:  'text-warning-600 dark:text-warning-400',
    dot:       'bg-warning-500',
  },
  error: {
    icon:      MdError,
    bg:        'bg-danger-500/8 dark:bg-danger-500/10',
    border:    'border-danger-200 dark:border-danger-800/60',
    iconBg:    'bg-danger-500/12',
    iconText:  'text-danger-600 dark:text-danger-400',
    dot:       'bg-danger-500',
  },
  success: {
    icon:      MdCheckCircle,
    bg:        'bg-success-500/8 dark:bg-success-500/10',
    border:    'border-success-200 dark:border-success-800/60',
    iconBg:    'bg-success-500/12',
    iconText:  'text-success-600 dark:text-success-400',
    dot:       'bg-success-500',
  },
  info: {
    icon:      MdInfo,
    bg:        'bg-info-500/8 dark:bg-info-500/10',
    border:    'border-info-200 dark:border-info-800/60',
    iconBg:    'bg-info-500/12',
    iconText:  'text-info-600 dark:text-info-400',
    dot:       'bg-info-500',
  },
  order: {
    icon:      MdShoppingCart,
    bg:        'bg-primary-500/8 dark:bg-primary-500/10',
    border:    'border-primary-200 dark:border-primary-800/60',
    iconBg:    'bg-primary-500/12',
    iconText:  'text-primary-600 dark:text-primary-400',
    dot:       'bg-primary-500',
  },
};

// ─── Build live notifications from backend stock data + stats ──
function buildNotifications(lowStock, outOfStock, stats) {
  const notifs = [];

  // Purchase Order notifications
  if (stats) {
    const pendingOrders = Number(stats.pendingOrders) || 0;
    if (pendingOrders > 0) {
      notifs.push({
        id:      'pending-orders',
        type:    'order',
        title:   'Pending Purchase Orders',
        message: `${pendingOrders} purchase order${pendingOrders !== 1 ? 's' : ''} awaiting approval. Review and approve to proceed with procurement.`,
        time:    'now',
        read:    false,
      });
    }

    const completedOrders = Number(stats.completedOrders) || 0;
    if (completedOrders > 0) {
      notifs.push({
        id:      'completed-orders',
        type:    'success',
        title:   'Orders Completed',
        message: `${completedOrders} purchase order${completedOrders !== 1 ? 's have' : ' has'} been successfully received and completed.`,
        time:    'now',
        read:    true,
      });
    }
  }

  outOfStock.slice(0, 3).forEach((p, i) => {
    notifs.push({
      id:      `oos-${p.id ?? i}`,
      type:    'error',
      title:   'Out of Stock',
      message: `${p.name} (${p.sku}) has 0 units remaining. Reorder level: ${p.reorderLevel}.`,
      time:    'now',
      read:    false,
    });
  });

  lowStock.slice(0, 4).forEach((p, i) => {
    notifs.push({
      id:      `low-${p.id ?? i}`,
      type:    'warning',
      title:   'Low Stock Alert',
      message: `${p.name} has only ${p.currentStock} unit${p.currentStock !== 1 ? 's' : ''} left. Reorder level: ${p.reorderLevel}.`,
      time:    'now',
      read:    false,
    });
  });

  if (stats) {
    const inactiveCats = Number(stats.inactiveCategories) || 0;
    if (inactiveCats > 0) {
      notifs.push({
        id:      'inactive-cats',
        type:    'warning',
        title:   'Inactive Categories',
        message: `${inactiveCats} categor${inactiveCats !== 1 ? 'ies are' : 'y is'} inactive. Review and activate them to keep inventory organized.`,
        time:    'now',
        read:    false,
      });
    }

    const rootCats = Number(stats.rootCategories) || 0;
    if (rootCats === 0 && Number(stats.totalCategories) > 0) {
      notifs.push({
        id:      'no-root-cats',
        type:    'info',
        title:   'Category Hierarchy',
        message: 'All categories have parent categories. Consider creating root-level categories.',
        time:    'now',
        read:    true,
      });
    }
  }

  if (notifs.length === 0) {
    notifs.push({
      id:      'info-all-ok',
      type:    'success',
      title:   'All Stock Levels Healthy',
      message: 'No low-stock or out-of-stock products at this time.',
      time:    'now',
      read:    true,
    });
  }

  return notifs;
}

// ─── Single notification card ─────────────────────────────────
const NotifItem = ({ notif, onDismiss }) => {
  const cfg  = NOTIF_CONFIG[notif.type] ?? NOTIF_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      exit={{    opacity: 0, x: 40, scale: 0.95  }}
      transition={{ duration: 0.25 }}
      className={clsx(
        'relative flex gap-3 p-3.5 rounded-xl border',
        'transition-colors duration-200',
        cfg.bg, cfg.border,
        !notif.read && 'ring-1 ring-inset ring-current/10',
      )}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className={clsx('absolute top-3 right-8 w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
      )}

      {/* Icon */}
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', cfg.iconBg)}>
        <Icon size={16} className={cfg.iconText} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-4">
        <p className={clsx(
          'text-sm font-semibold leading-snug',
          notif.read ? 'text-surface-600 dark:text-surface-300' : 'text-surface-900 dark:text-surface-50',
        )}>
          {notif.title}
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 leading-relaxed">
          {notif.message}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          <HiOutlineClock size={11} className="text-surface-400" />
          <span className="text-[11px] text-surface-400 dark:text-surface-500">{notif.time}</span>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(notif.id)}
        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-md flex items-center justify-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-200/60 dark:hover:bg-surface-600/40 transition-all"
        aria-label="Dismiss notification"
      >
        <MdClose size={13} />
      </button>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────
const NotifSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex gap-3 p-3 rounded-xl border border-surface-100 dark:border-surface-700/50">
        <Skeleton circle height="32px" width="32px" className="flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton height="13px" className="w-2/3" />
          <Skeleton height="11px" className="w-full" />
          <Skeleton height="10px" className="w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

// ─── SystemNotifications ──────────────────────────────────────
/**
 * SystemNotifications — live stock alerts as dismissible notification cards.
 *
 * @param {Array}   lowStock   - Live low-stock products from useDashboard
 * @param {Array}   outOfStock - Live out-of-stock products from useDashboard
 * @param {boolean} loading
 */
const SystemNotifications = ({ lowStock = [], outOfStock = [], stats = null, loading = false }) => {
  // Build fresh list whenever backend data changes
  const liveNotifs = useMemo(
    () => buildNotifications(lowStock, outOfStock, stats),
    [lowStock, outOfStock, stats],
  );

  // Dismissed IDs (local state — won't survive page refresh)
  const [dismissed, setDismissed] = useState(new Set());

  const notifs      = liveNotifs.filter((n) => !dismissed.has(n.id));
  const unreadCount = notifs.filter((n) => !n.read).length;

  const handleDismiss = (id) =>
    setDismissed((prev) => new Set([...prev, id]));

  const markAllRead = () =>
    setDismissed((prev) => new Set([...prev, ...notifs.filter((n) => !n.read).map((n) => n.id)]));

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
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <MdNotificationsActive size={18} className="text-surface-600 dark:text-surface-300" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[14px] h-3.5 rounded-full bg-danger-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5"
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">Notifications</h3>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{unreadCount} unread</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline underline-offset-2"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="p-4 space-y-2.5 overflow-y-auto max-h-[420px] no-scrollbar">
        {loading ? (
          <NotifSkeleton />
        ) : notifs.length === 0 ? (
          <div className="py-10 text-center">
            <MdCheckCircle size={32} className="text-success-500 mx-auto mb-2" />
            <p className="text-sm text-surface-500 dark:text-surface-400">All caught up!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifs.map((notif) => (
              <NotifItem
                key={notif.id}
                notif={notif}
                onDismiss={handleDismiss}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SystemNotifications;
