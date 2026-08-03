import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Card — glassmorphism card with optional header, footer, hover lift, and padding variants.
 */
const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  padding    = 'md',
  hover      = false,
  glass      = true,
  border     = true,
  className  = '',
  bodyClass  = '',
  ...props
}) => {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

  const base = clsx(
    'rounded-2xl overflow-hidden',
    glass  && 'bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl',
    !glass && 'bg-white dark:bg-surface-800',
    border && 'border border-surface-200/70 dark:border-surface-700/50',
    'shadow-card dark:shadow-card-dark',
    hover  && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-glow cursor-pointer',
    className,
  );

  return (
    <motion.div
      className={base}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {/* Header */}
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div>
            {title    && <h3 className="text-base font-semibold text-surface-900 dark:text-surface-50">{title}</h3>}
            {subtitle && <p  className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Body */}
      <div className={clsx(paddings[padding], bodyClass)}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-900/30">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;
