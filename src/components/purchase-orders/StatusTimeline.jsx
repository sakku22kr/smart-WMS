import { MdCheckCircle, MdCancel, MdSend, MdInventory, MdCreate, MdRemoveCircleOutline } from 'react-icons/md';

const STATUS_CONFIG = {
  DRAFT:              { color: 'bg-surface-400',    textColor: 'text-surface-500',    icon: MdCreate,                label: 'Created' },
  PENDING:            { color: 'bg-warning-500',    textColor: 'text-warning-600',    icon: MdSend,                  label: 'Pending Approval' },
  APPROVED:           { color: 'bg-success-500',    textColor: 'text-success-600',    icon: MdCheckCircle,            label: 'Approved' },
  REJECTED:           { color: 'bg-danger-500',     textColor: 'text-danger-600',     icon: MdCancel,                 label: 'Rejected' },
  ORDERED:            { color: 'bg-info-500',       textColor: 'text-info-600',       icon: MdSend,                   label: 'Ordered' },
  PARTIALLY_RECEIVED: { color: 'bg-warning-500',    textColor: 'text-warning-600',    icon: MdInventory,              label: 'Partially Received' },
  RECEIVED:           { color: 'bg-success-500',    textColor: 'text-success-600',    icon: MdInventory,              label: 'Received' },
  COMPLETED:          { color: 'bg-primary-500',    textColor: 'text-primary-600',    icon: MdCheckCircle,            label: 'Completed' },
  CANCELLED:          { color: 'bg-danger-500',     textColor: 'text-danger-600',     icon: MdRemoveCircleOutline,    label: 'Cancelled' },
};

const formatDateTime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const StatusTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-surface-400 py-2">No status changes recorded.</p>
    );
  }

  return (
    <div className="relative">
      {history.map((entry, index) => {
        const config = STATUS_CONFIG[entry.toStatus] || STATUS_CONFIG.DRAFT;
        const Icon = config.icon;
        const isLast = index === history.length - 1;

        return (
          <div key={entry.id || index} className="flex gap-3 pb-4 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                <Icon size={14} className="text-white" />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-surface-200 dark:bg-surface-700 mt-1" />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${config.textColor}`}>{config.label}</span>
                {entry.fromStatus && (
                  <span className="text-xs text-surface-400">from {STATUS_CONFIG[entry.fromStatus]?.label || entry.fromStatus}</span>
                )}
              </div>
              <p className="text-xs text-surface-400 mt-0.5">
                {entry.changedBy} &middot; {formatDateTime(entry.changedAt)}
              </p>
              {entry.remarks && (
                <p className="text-xs text-surface-500 mt-1 italic">{entry.remarks}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
