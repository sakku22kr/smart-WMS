import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import Button from './Button';
import clsx from 'clsx';

const SIZES = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
  full: 'max-w-full mx-4',
};

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden:  { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: { type: 'spring', damping: 25, stiffness: 350 } },
  exit:    { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.18 } },
};

/**
 * Modal — animated dialog with backdrop blur, customizable size, header & footer.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size         = 'md',
  closable     = true,
  closeOnOverlay = true,
  className    = '',
}) => {
  const handleClose = useCallback(() => {
    if (closable) onClose?.();
  }, [closable, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && handleClose();
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm"
            onClick={closeOnOverlay ? handleClose : undefined}
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={clsx(
              'relative w-full z-10',
              'bg-white dark:bg-surface-800',
              'rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700',
              SIZES[size],
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            {(title || closable) && (
              <div className="flex items-start justify-between p-6 pb-4">
                <div>
                  {title       && <h2 id="modal-title" className="text-lg font-semibold text-surface-900 dark:text-surface-50">{title}</h2>}
                  {description && <p  className="text-sm text-surface-500 dark:text-surface-400 mt-1">{description}</p>}
                </div>
                {closable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    onClick={handleClose}
                    aria-label="Close modal"
                    className="ml-4 -mt-1 -mr-2 flex-shrink-0"
                  >
                    <MdClose size={18} />
                  </Button>
                )}
              </div>
            )}

            {/* Body */}
            <div className={clsx('px-6', !title && 'pt-6', 'pb-2')}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 mt-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
