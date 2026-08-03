import clsx from 'clsx';

const VARIANTS = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300',
  success: 'bg-success-500/10 text-success-600 dark:text-success-400',
  warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-400',
  danger:  'bg-danger-500/10  text-danger-600  dark:text-danger-400',
  info:    'bg-info-500/10    text-info-600    dark:text-info-400',
  surface: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-2.5 py-0.5 text-xs rounded-lg',
  lg: 'px-3 py-1 text-sm rounded-xl',
};

/**
 * Badge — status/label chip with dot indicator option.
 */
const Badge = ({
  children,
  variant   = 'primary',
  size      = 'md',
  dot       = false,
  className = '',
  ...props
}) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1.5 font-semibold leading-none',
      VARIANTS[variant],
      SIZES[size],
      className,
    )}
    {...props}
  >
    {dot && (
      <span className={clsx(
        'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0',
        {
          'bg-primary-500': variant === 'primary',
          'bg-success-500': variant === 'success',
          'bg-warning-500': variant === 'warning',
          'bg-danger-500':  variant === 'danger',
          'bg-info-500':    variant === 'info',
          'bg-surface-500': variant === 'surface',
        }
      )} />
    )}
    {children}
  </span>
);

export default Badge;
