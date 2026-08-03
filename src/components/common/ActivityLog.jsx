import { useState, useEffect } from 'react';
import { MdHistory, MdCategory, MdAdd, MdEdit, MdDelete, MdCheckCircle, MdPowerSettingsNew, MdRestoreFromTrash } from 'react-icons/md';
import activityService from '@/api/services/activityService';
import Badge from '@components/ui/Badge';

const ACTIVITY_CONFIG = {
  CATEGORY_CREATED:    { icon: <MdAdd size={14} />, variant: 'success', label: 'Created' },
  CATEGORY_UPDATED:    { icon: <MdEdit size={14} />, variant: 'info', label: 'Updated' },
  CATEGORY_DELETED:    { icon: <MdDelete size={14} />, variant: 'danger', label: 'Deleted' },
  CATEGORY_RESTORED:   { icon: <MdRestoreFromTrash size={14} />, variant: 'warning', label: 'Restored' },
  CATEGORY_ACTIVATED:  { icon: <MdCheckCircle size={14} />, variant: 'success', label: 'Activated' },
  CATEGORY_DEACTIVATED:{ icon: <MdPowerSettingsNew size={14} />, variant: 'danger', label: 'Deactivated' },
};

const ActivityLog = ({ targetId, limit = 10 }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetId) return;
    let cancelled = false;
    setLoading(true);
    activityService.getByTargetId(targetId, { page: 0, size: limit })
      .then((res) => {
        if (!cancelled) setLogs(res?.data?.content ?? []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [targetId, limit]);

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-surface-200 dark:bg-surface-700" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-3/4 rounded bg-surface-200 dark:bg-surface-700" />
              <div className="h-2 w-1/2 rounded bg-surface-200 dark:bg-surface-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-surface-400">
        <MdHistory size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-xs">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log) => {
        const config = ACTIVITY_CONFIG[log.activityType] || {
          icon: <MdHistory size={14} />,
          variant: 'surface',
          label: log.activityType,
        };
        const timestamp = log.createdAt
          ? new Date(log.createdAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })
          : '';

        return (
          <div
            key={log.id}
            className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-surface-700 dark:text-surface-200 leading-snug">
                {log.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={config.variant} size="sm">{config.label}</Badge>
                <span className="text-xs text-surface-400">{timestamp}</span>
                {log.actorName && (
                  <span className="text-xs text-surface-400">by {log.actorName}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityLog;
