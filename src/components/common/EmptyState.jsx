import { motion } from 'framer-motion';
import Button from '@components/ui/Button';
import clsx from 'clsx';

/**
 * EmptyState — zero-data illustration with optional CTA.
 */
const EmptyState = ({
  icon,
  title        = 'No data found',
  description  = '',
  action,
  actionLabel  = 'Get started',
  onAction,
  compact      = false,
  className    = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={clsx(
      'flex flex-col items-center justify-center text-center',
      compact ? 'py-8 px-4' : 'py-20 px-8',
      className,
    )}
  >
    {icon && (
      <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-4xl text-surface-400 dark:text-surface-500 mb-4">
        {icon}
      </div>
    )}
    <h3 className={clsx('font-semibold text-surface-700 dark:text-surface-300', compact ? 'text-base' : 'text-lg')}>
      {title}
    </h3>
    {description && (
      <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400 max-w-xs">{description}</p>
    )}
    {(action || onAction) && (
      <div className="mt-5">
        {action ?? (
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    )}
  </motion.div>
);

export default EmptyState;
