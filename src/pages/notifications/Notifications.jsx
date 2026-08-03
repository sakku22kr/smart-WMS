import { useState, useEffect, useCallback, useRef } from 'react';
import { MdNotifications, MdDone, MdDoneAll, MdDelete, MdWarningAmber, MdCheckCircle, MdInfo, MdShoppingCart, MdWarehouse, MdPeople, MdBuild, MdPowerSettingsNew, MdRestore } from 'react-icons/md';
import { motion } from 'framer-motion';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Skeleton from '@components/common/Skeleton';
import activityService from '@/api/services/activityService';

const TYPE_CONFIG = {
  warning: { icon: <MdWarningAmber size={18} />, color: 'bg-warning-500/10 text-warning-500' },
  success: { icon: <MdCheckCircle  size={18} />, color: 'bg-success-500/10 text-success-500' },
  info:    { icon: <MdInfo         size={18} />, color: 'bg-info-500/10    text-info-500'    },
  order:   { icon: <MdShoppingCart size={18} />, color: 'bg-primary-500/10 text-primary-500' },
  warehouse: { icon: <MdWarehouse size={18} />, color: 'bg-info-500/10 text-info-500' },
  user:    { icon: <MdPeople      size={18} />, color: 'bg-warning-500/10 text-warning-500' },
  activate:{ icon: <MdCheckCircle size={18} />, color: 'bg-success-500/10 text-success-500' },
  deactivate: { icon: <MdPowerSettingsNew size={18} />, color: 'bg-danger-500/10 text-danger-500' },
  maintenance: { icon: <MdBuild size={18} />, color: 'bg-warning-500/10 text-warning-500' },
  restore: { icon: <MdRestore size={18} />, color: 'bg-info-500/10 text-info-500' },
};

function mapActivityType(activityType) {
  if (!activityType) return 'info';
  const t = activityType.toUpperCase();
  if (t.includes('WAREHOUSE_CREATED') || t.includes('PRODUCT_CREATED') || t.includes('USER_CREATED')) return 'success';
  if (t.includes('WAREHOUSE_UPDATED') || t.includes('PRODUCT_UPDATED')) return 'info';
  if (t.includes('WAREHOUSE_DELETED') || t.includes('PRODUCT_DELETED') || t.includes('USER_DELETED')) return 'warning';
  if (t.includes('WAREHOUSE_RESTORED')) return 'restore';
  if (t.includes('WAREHOUSE_ACTIVATED') || t.includes('USER_ACTIVATED')) return 'activate';
  if (t.includes('WAREHOUSE_DEACTIVATED') || t.includes('USER_DEACTIVATED')) return 'deactivate';
  if (t.includes('WAREHOUSE_MAINTENANCE')) return 'maintenance';
  if (t.includes('USER_LOGIN')) return 'success';
  if (t.includes('ROLE_ASSIGNED') || t.includes('ROLE_ADDED') || t.includes('ROLE_REMOVED')) return 'user';
  return 'info';
}

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
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr < 24)  return `${diffHr} hours ago`;
  if (diffDay < 7)  return `${diffDay} days ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

const INITIAL = [
  { id: 1, type: 'warning', title: 'Low Stock Alert',        body: 'Wireless Headset Pro X200 has only 3 units remaining.',          time: '2 minutes ago', read: false },
  { id: 2, type: 'success', title: 'Purchase Order Approved', body: 'PO #1042 from TechSupply Co. has been approved by the manager.', time: '1 hour ago',    read: false },
  { id: 3, type: 'info',    title: 'New Supplier Added',      body: 'QuickStock PVT. has been added as a verified supplier.',          time: '3 hours ago',   read: false },
  { id: 4, type: 'order',   title: 'Order Received',          body: 'PO #1040 items have been received at Mumbai Central Hub.',        time: '1 day ago',     read: true  },
  { id: 5, type: 'warning', title: 'Warehouse at Capacity',   body: 'Bangalore Tech Zone is at 91% capacity.',                        time: '2 days ago',    read: true  },
  { id: 6, type: 'success', title: 'Report Generated',        body: 'Monthly inventory report for June 2025 is ready to download.',   time: '3 days ago',    read: true  },
];

const Notifications = () => {
  const [items, setItems] = useState(INITIAL);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityService.getRecent();
      if (!mountedRef.current) return;
      const logs = Array.isArray(res?.data) ? res.data : [];
      if (logs.length > 0) {
        const mapped = logs.slice(0, 15).map((log, i) => ({
          id: `log-${log.id ?? i}`,
          type: mapActivityType(log.activityType),
          title: log.activityType?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'Activity',
          body: log.description || '',
          time: formatRelativeTime(log.createdAt),
          read: i > 4,
        }));
        setItems(mapped);
      }
    } catch (err) {
      console.error('[Notifications] Failed to fetch activity logs:', err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchLogs();
    return () => { mountedRef.current = false; };
  }, [fetchLogs]);

  const unread = items.filter((n) => !n.read).length;

  const markAll  = () => setItems((i) => i.map((n) => ({...n, read: true })));
  const markOne  = (id) => setItems((i) => i.map((n) => n.id === id ? {...n, read: true} : n));
  const remove   = (id) => setItems((i) => i.filter((n) => n.id !== id));

  return (
    <PageWrapper>
      <div className="page-container max-w-3xl">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <h1 className="page-title">Notifications</h1>
            {unread > 0 && <Badge variant="danger">{unread} new</Badge>}
          </div>
          {unread > 0 && (
            <Button variant="secondary" size="sm" leftIcon={<MdDoneAll />} onClick={markAll}>
              Mark All Read
            </Button>
          )}
        </div>

        <Card>
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton circle height="36px" width="36px" className="flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton height="14px" className="w-2/3" />
                    <Skeleton height="12px" className="w-full" />
                    <Skeleton height="10px" className="w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {items.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-start gap-4 p-4 transition-colors ${!n.read ? 'bg-primary-50/40 dark:bg-primary-950/10' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${!n.read ? 'text-surface-900 dark:text-white' : 'text-surface-600 dark:text-surface-400'}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5 leading-snug">{n.body}</p>
                      <p className="text-xs text-surface-400 mt-1">{n.time}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!n.read && (
                        <button onClick={() => markOne(n.id)} title="Mark as read" className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-success-500 transition-colors">
                          <MdDone size={16} />
                        </button>
                      )}
                      <button onClick={() => remove(n.id)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-danger-50 dark:hover:bg-danger-950/20 hover:text-danger-500 transition-colors">
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {items.length === 0 && (
                <div className="py-16 text-center">
                  <MdNotifications size={40} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
                  <p className="text-surface-400">You're all caught up!</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

export default Notifications;
