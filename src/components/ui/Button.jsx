import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const VARIANTS = {
  primary:   'bg-gradient-primary text-white shadow-glow hover:shadow-glow-lg hover:opacity-90',
  secondary: 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-600',
  outline:   'border border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30',
  ghost:     'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
  danger:    'bg-danger-500 text-white hover:bg-danger-600 shadow-sm',
  success:   'bg-success-500 text-white hover:bg-success-600 shadow-sm',
  warning:   'bg-warning-500 text-white hover:bg-warning-600 shadow-sm',
  glass:     'glass-card text-surface-700 dark:text-surface-200 hover:shadow-glow border-white/20',
};

const SIZES = {
  xs: 'h-7  px-2.5 text-xs  gap-1.5 rounded-lg',
  sm: 'h-8  px-3   text-sm  gap-1.5 rounded-xl',
  md: 'h-10 px-4   text-sm  gap-2   rounded-xl',
  lg: 'h-11 px-5   text-base gap-2   rounded-xl',
  xl: 'h-12 px-6   text-base gap-2.5 rounded-2xl',
};

const ICON_SIZES = {
  xs: 'h-7  w-7  rounded-lg',
  sm: 'h-8  w-8  rounded-xl',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-11 w-11 rounded-xl',
  xl: 'h-12 w-12 rounded-2xl',
};

const Spinner = ({ size }) => {
  const s = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 }[size] ?? 16;
  return (
    <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
    </svg>
  );
};

/**
 * Button — production-grade button with variants, sizes, loading, icon-only modes.
 */
const Button = forwardRef(({
  children,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  iconOnly  = false,
  leftIcon  = null,
  rightIcon = null,
  fullWidth = false,
  className = '',
  onClick,
  type      = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      whileHover={!isDisabled ? { scale: 1.01 } : {}}
      transition={{ duration: 0.15 }}
      className={clsx(
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-200 cursor-pointer select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        VARIANTS[variant],
        iconOnly ? ICON_SIZES[size] : SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size={size} /> : leftIcon}
      {!iconOnly && children && (
        <span className={loading || leftIcon ? 'ml-0' : ''}>{children}</span>
      )}
      {!loading && rightIcon}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
