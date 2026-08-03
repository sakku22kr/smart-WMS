import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdKeyboardArrowDown } from 'react-icons/md';
import clsx from 'clsx';

/**
 * Dropdown — headless dropdown menu with animated panel.
 * @param {React.ReactNode}   trigger  - The toggle element
 * @param {Array}             items    - [{ label, icon, onClick, danger, divider }]
 * @param {'left'|'right'}    align    - Panel alignment
 */
const Dropdown = ({
  trigger,
  items      = [],
  align      = 'right',
  className  = '',
  menuClass  = '',
  showArrow  = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [close]);

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  return (
    <div ref={ref} className={clsx('relative inline-block', className)}>
      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
        className="flex items-center gap-1 cursor-pointer outline-none"
      >
        {trigger}
        {showArrow && (
          <MdKeyboardArrowDown
            className={clsx('transition-transform duration-200', open && 'rotate-180')}
            size={18}
          />
        )}
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={clsx(
              'absolute z-50 mt-2 min-w-[180px]',
              'bg-white dark:bg-surface-800',
              'border border-surface-200 dark:border-surface-700',
              'rounded-xl shadow-2xl dark:shadow-card-dark',
              'py-1 overflow-hidden',
              align === 'right' ? 'right-0' : 'left-0',
              menuClass,
            )}
            role="menu"
          >
            {items.map((item, idx) =>
              item.divider ? (
                <hr key={idx} className="my-1 border-surface-200 dark:border-surface-700" />
              ) : (
                <button
                  key={idx}
                  role="menuitem"
                  onClick={() => { item.onClick?.(); close(); }}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left',
                    'transition-colors duration-150',
                    item.danger
                      ? 'text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/30'
                      : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50',
                  )}
                >
                  {item.icon && <span className="text-lg flex-shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
