import { motion } from 'framer-motion';
import {
  MdPersonAdd, MdPersonRemove, MdEdit, MdLock, MdPhotoCamera,
  MdLogin, MdLogout, MdSwapHoriz, MdBlock, MdCheckCircle,
  MdDelete, MdOutlineHistory
} from 'react-icons/md';
import Badge from '@components/ui/Badge';
import Loader from '@components/common/Loader';

const ACTIVITY_CONFIG = {
  USER_CREATED:         { icon: MdPersonAdd,    color: 'text-success-500',  bg: 'bg-success-500/10',  label: 'Account Created' },
  USER_UPDATED:         { icon: MdEdit,          color: 'text-info-500',     bg: 'bg-info-500/10',     label: 'Account Updated' },
  USER_DELETED:         { icon: MdDelete,        color: 'text-danger-500',   bg: 'bg-danger-500/10',   label: 'Account Deleted' },
  USER_ACTIVATED:       { icon: MdCheckCircle,   color: 'text-success-500',  bg: 'bg-success-500/10',  label: 'Account Activated' },
  USER_DEACTIVATED:     { icon: MdBlock,         color: 'text-danger-500',   bg: 'bg-danger-500/10',   label: 'Account Deactivated' },
  USER_PROFILE_UPDATED: { icon: MdEdit,          color: 'text-info-500',     bg: 'bg-info-500/10',     label: 'Profile Updated' },
  USER_PASSWORD_CHANGED:{ icon: MdLock,          color: 'text-warning-500',  bg: 'bg-warning-500/10',  label: 'Password Changed' },
  USER_PICTURE_UPDATED: { icon: MdPhotoCamera,   color: 'text-primary-500',  bg: 'bg-primary-500/10',  label: 'Picture Updated' },
  ROLE_ASSIGNED:        { icon: MdSwapHoriz,     color: 'text-info-500',     bg: 'bg-info-500/10',     label: 'Roles Assigned' },
  ROLE_ADDED:           { icon: MdPersonAdd,     color: 'text-primary-500',  bg: 'bg-primary-500/10',  label: 'Role Added' },
  ROLE_REMOVED:         { icon: MdPersonRemove,  color: 'text-warning-500',  bg: 'bg-warning-500/10',  label: 'Role Removed' },
  USER_LOGIN:           { icon: MdLogin,         color: 'text-success-500',  bg: 'bg-success-500/10',  label: 'Logged In' },
  USER_LOGOUT:          { icon: MdLogout,        color: 'text-surface-500',  bg: 'bg-surface-500/10',  label: 'Logged Out' },
};

const formatTimestamp = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24)  return `${diffHr}h ago`;
  if (diffDay < 7)  return `${diffDay}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * ActivityTimeline — vertical timeline showing a user's activity history.
 *
 * Props:
 *  - logs     : ActivityLogResponse[] — list of log entries
 *  - loading  : boolean
 *  - error    : string | null
 *  - compact  : boolean — show compact layout (for cards)
 */
const ActivityTimeline = ({ logs = [], loading = false, error = null, compact = false }) => {
  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader size="md" label="Loading activities…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-danger-500">{error}</p>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="py-8 text-center">
        <MdOutlineHistory className="mx-auto text-surface-300 dark:text-surface-600" size={32} />
        <p className="mt-2 text-sm text-surface-400">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-surface-200 dark:bg-surface-700" />

      <div className="space-y-0">
        {logs.map((log, i) => {
          const config = ACTIVITY_CONFIG[log.activityType] || {
            icon: MdOutlineHistory,
            color: 'text-surface-500',
            bg: 'bg-surface-500/10',
            label: log.activityType?.replace(/_/g, ' ') || 'Activity',
          };
          const Icon = config.icon;

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="relative flex items-start gap-3 py-3"
            >
              {/* Icon circle */}
              <div className={`
                relative z-10 flex items-center justify-center
                w-8 h-8 rounded-full flex-shrink-0
                ${config.bg} ${config.color}
              `}>
                <Icon size={16} />
              </div>

              {/* Content */}
              <div className={`flex-1 ${compact ? 'min-w-0' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-100 truncate">
                      {log.description}
                    </p>
                    {!compact && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant={config.color.includes('success') ? 'success' : config.color.includes('danger') ? 'danger' : config.color.includes('warning') ? 'warning' : config.color.includes('info') ? 'info' : 'surface'}
                          size="sm"
                        >
                          {config.label}
                        </Badge>
                        {log.actorEmail && (
                          <span className="text-xs text-surface-400">
                            by {log.actorName || log.actorEmail}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-surface-400 dark:text-surface-500 whitespace-nowrap flex-shrink-0">
                    {formatTimestamp(log.createdAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
