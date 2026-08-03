const COLOR_MAP = {
  primary: { bg: 'bg-primary-500/10', text: 'text-primary-500' },
  success: { bg: 'bg-success-500/10', text: 'text-success-500' },
  warning: { bg: 'bg-warning-500/10', text: 'text-warning-500' },
  danger:  { bg: 'bg-danger-500/10',  text: 'text-danger-500' },
  info:    { bg: 'bg-info-500/10',    text: 'text-info-500' },
  surface: { bg: 'bg-surface-500/10', text: 'text-surface-500' },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-500' },
};

const MetricCard = ({ icon: Icon, label, value, color = 'primary' }) => {
  const c = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
      <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={c.text} />
      </div>
      <div>
        <p className="text-lg font-bold text-surface-800 dark:text-surface-100">{value}</p>
        <p className="text-xs text-surface-400">{label}</p>
      </div>
    </div>
  );
};

export default MetricCard;
