import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Loader — full-screen and inline spinner variants.
 */
const Loader = ({
  fullscreen = false,
  size       = 'md',
  label      = '',
  className  = '',
}) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
    xl: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className={clsx('flex flex-col items-center justify-center gap-4', className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className={clsx(
          'rounded-full border-surface-200 dark:border-surface-700',
          sizes[size],
        )} />
        {/* Spinning arc */}
        <div className={clsx(
          'absolute inset-0 rounded-full border-primary-500 border-t-transparent animate-spin',
          sizes[size],
        )} />
      </div>
      {label && (
        <p className="text-sm text-surface-500 dark:text-surface-400 animate-pulse">{label}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm"
      >
        <div className="glass-card p-8">
          <Loader size="lg" label={label || 'Loading…'} />
        </div>
      </motion.div>
    );
  }

  return spinner;
};

export default Loader;
