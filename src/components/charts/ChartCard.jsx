import { motion } from 'framer-motion';
import clsx from 'clsx';
import Skeleton from '@components/common/Skeleton';

/**
 * ChartCard — Glassmorphism container for all dashboard chart panels.
 *
 * Props:
 *  @param {string}    title       - Card heading
 *  @param {string}    subtitle    - Optional supporting text
 *  @param {ReactNode} action      - Optional right-aligned element (badge, button, select)
 *  @param {ReactNode} children    - Chart content
 *  @param {boolean}   loading     - Show skeleton instead of content
 *  @param {string}    className   - Extra CSS
 *  @param {number}    delay       - Framer Motion stagger delay (seconds)
 *  @param {string}    skeletonH   - Height string for skeleton chart area (default '260px')
 */
const ChartCard = ({
  title,
  subtitle,
  action,
  children,
  loading    = false,
  className  = '',
  delay      = 0,
  skeletonH  = '260px',
}) => {
  if (loading) {
    return <Skeleton.ChartCard className={className} height={skeletonH} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={clsx(
        'relative rounded-2xl overflow-hidden',
        'bg-white/80 dark:bg-surface-800/80',
        'backdrop-blur-xl',
        'border border-white/60 dark:border-surface-700/50',
        'shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.28)]',
        'transition-shadow duration-300 hover:shadow-[0_6px_28px_-4px_rgba(0,0,0,0.11)] dark:hover:shadow-[0_6px_28px_-4px_rgba(0,0,0,0.38)]',
        className,
      )}
    >
      {/* Header */}
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-0">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 leading-tight truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5 leading-tight">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0 mt-0.5">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-5 pt-4">
        {children}
      </div>
    </motion.div>
  );
};

export default ChartCard;
