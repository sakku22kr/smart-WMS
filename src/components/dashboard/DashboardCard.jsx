import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  MdTrendingUp, MdTrendingDown, MdTrendingFlat,
} from 'react-icons/md';
import Skeleton from '@components/common/Skeleton';

// ─── Color palette map ────────────────────────────────────────
const COLORS = {
  primary: {
    icon:   'bg-primary-500/10 text-primary-600 dark:text-primary-400',
    glow:   'hover:shadow-[0_0_30px_-4px_rgba(99,102,241,0.35)]',
    bar:    'bg-gradient-to-r from-primary-500 to-primary-400',
    ring:   'ring-primary-500/30',
    badge:  'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  },
  success: {
    icon:   'bg-success-500/10 text-success-600 dark:text-success-400',
    glow:   'hover:shadow-[0_0_30px_-4px_rgba(34,197,94,0.30)]',
    bar:    'bg-gradient-to-r from-success-500 to-emerald-400',
    ring:   'ring-success-500/30',
    badge:  'bg-success-500/10 text-success-600 dark:text-success-400',
  },
  warning: {
    icon:   'bg-warning-500/10 text-warning-600 dark:text-warning-400',
    glow:   'hover:shadow-[0_0_30px_-4px_rgba(249,115,22,0.30)]',
    bar:    'bg-gradient-to-r from-warning-500 to-amber-400',
    ring:   'ring-warning-500/30',
    badge:  'bg-warning-500/10 text-warning-600 dark:text-warning-400',
  },
  danger: {
    icon:   'bg-danger-500/10 text-danger-600 dark:text-danger-400',
    glow:   'hover:shadow-[0_0_30px_-4px_rgba(239,68,68,0.30)]',
    bar:    'bg-gradient-to-r from-danger-500 to-rose-400',
    ring:   'ring-danger-500/30',
    badge:  'bg-danger-500/10 text-danger-600 dark:text-danger-400',
  },
  info: {
    icon:   'bg-info-500/10 text-info-600 dark:text-info-400',
    glow:   'hover:shadow-[0_0_30px_-4px_rgba(59,130,246,0.30)]',
    bar:    'bg-gradient-to-r from-info-500 to-sky-400',
    ring:   'ring-info-500/30',
    badge:  'bg-info-500/10 text-info-600 dark:text-info-400',
  },
  violet: {
    icon:   'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    glow:   'hover:shadow-[0_0_30px_-4px_rgba(139,92,246,0.30)]',
    bar:    'bg-gradient-to-r from-violet-500 to-purple-400',
    ring:   'ring-violet-500/30',
    badge:  'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
};

// ─── Trend badge ─────────────────────────────────────────────
const TrendBadge = ({ trend }) => {
  if (!trend) return null;

  const { value, label } = trend;
  const isPositive  = value > 0;
  const isNeutral   = value === 0;

  const Icon  = isNeutral ? MdTrendingFlat : isPositive ? MdTrendingUp : MdTrendingDown;
  const color = isNeutral
    ? 'bg-surface-100 dark:bg-surface-700/60 text-surface-500 dark:text-surface-400'
    : isPositive
      ? 'bg-success-500/10 text-success-600 dark:text-success-400'
      : 'bg-danger-500/10  text-danger-600  dark:text-danger-400';

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={clsx('inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold', color)}>
        <Icon size={13} />
        {!isNeutral && <>{Math.abs(value)}%</>}
        {isNeutral && 'Stable'}
      </span>
      {label && (
        <span className="text-[10px] text-surface-400 dark:text-surface-500 text-right leading-tight">
          {label}
        </span>
      )}
    </div>
  );
};

// ─── DashboardCard ────────────────────────────────────────────
/**
 * DashboardCard — premium glassmorphism KPI card.
 *
 * Props:
 *  @param {string}   label       - Metric name
 *  @param {string}   value       - Display value (e.g. "4,821" or "₹28.4L")
 *  @param {ReactNode} icon       - Icon element (20–24px recommended)
 *  @param {object}   trend       - { value: number, label: string }
 *  @param {string}   color       - 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'violet'
 *  @param {string}   subtext     - Small helper text below value
 *  @param {boolean}  loading     - Show skeleton placeholder
 *  @param {number}   delay       - Stagger delay for entry animation (seconds)
 *  @param {string}   className   - Extra CSS
 */
const DashboardCard = ({
  label,
  value,
  icon,
  trend,
  color     = 'primary',
  subtext,
  loading   = false,
  delay     = 0,
  className = '',
}) => {
  const c = COLORS[color] ?? COLORS.primary;

  if (loading) {
    return <Skeleton.StatsCard className={className} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={clsx(
        // Glass base
        'relative overflow-hidden rounded-2xl',
        'bg-white/80 dark:bg-surface-800/80',
        'backdrop-blur-xl',
        'border border-white/60 dark:border-surface-700/50',
        'shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.3)]',
        // Hover glow per color
        c.glow,
        'transition-all duration-300 cursor-default',
        // Focus ring on keyboard nav
        'focus-within:ring-2', c.ring,
        className,
      )}
    >
      {/* Subtle top accent bar */}
      <div className={clsx('absolute top-0 left-0 right-0 h-[2px]', c.bar)} />

      {/* Background glow blob */}
      <div className={clsx(
        'absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] blur-2xl pointer-events-none',
        c.bar,
      )} />

      <div className="p-5">
        {/* Top row: icon + trend */}
        <div className="flex items-start justify-between gap-3">
          {/* Icon container */}
          <div className={clsx(
            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
            'text-[22px]',
            c.icon,
          )}>
            {icon}
          </div>
          <TrendBadge trend={trend} />
        </div>

        {/* Value + label */}
        <div className="mt-4 space-y-1">
          <p className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-50 tabular-nums">
            {value}
          </p>
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
            {label}
          </p>
          {subtext && (
            <p className="text-[11px] text-surface-400 dark:text-surface-500 leading-relaxed">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
