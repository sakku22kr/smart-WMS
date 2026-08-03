import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * StatsCard — KPI card with icon, value, label, trend indicator.
 */
const StatsCard = ({
  label,
  value,
  icon,
  trend,       // { value: number, label: string }
  color    = 'primary',
  loading  = false,
  className = '',
}) => {
  const colorMap = {
    primary: { icon: 'bg-primary-500/10 text-primary-600 dark:text-primary-400', glow: 'shadow-glow' },
    success: { icon: 'bg-success-500/10 text-success-600 dark:text-success-400', glow: '' },
    warning: { icon: 'bg-warning-500/10 text-warning-600 dark:text-warning-400', glow: '' },
    danger:  { icon: 'bg-danger-500/10  text-danger-600  dark:text-danger-400',  glow: '' },
    info:    { icon: 'bg-info-500/10    text-info-600    dark:text-info-400',     glow: '' },
  };

  const c = colorMap[color] ?? colorMap.primary;
  const isPositive = trend?.value >= 0;

  if (loading) {
    return (
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-5 w-20 rounded-lg" />
        </div>
        <div className="skeleton h-8 w-28 rounded-lg" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      className={clsx('glass-card p-6 hover:-translate-y-1 hover:shadow-glow transition-all duration-300', className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0', c.icon)}>
          {icon}
        </div>

        {/* Trend */}
        {trend && (
          <span className={clsx(
            'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            isPositive
              ? 'bg-success-500/10 text-success-600 dark:text-success-400'
              : 'bg-danger-500/10  text-danger-600  dark:text-danger-400',
          )}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">{value}</p>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{label}</p>
        {trend?.label && (
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{trend.label}</p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
