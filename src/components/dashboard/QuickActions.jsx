import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  MdInventory2, MdWarehouse, MdShoppingCart,
  MdBarChart, MdPeople, MdArrowForward, MdCategory, MdLocalShipping,
} from 'react-icons/md';
import Skeleton from '@components/common/Skeleton';

// ─── Quick action definitions ─────────────────────────────────
const ACTIONS = [
  {
    id:       'add-product',
    label:    'Add Product',
    desc:     'Register a new product to inventory',
    icon:     MdInventory2,
    path:     '/products',
    gradient: 'from-primary-500 to-violet-500',
    shadow:   'hover:shadow-[0_8px_24px_-4px_rgba(99,102,241,0.45)]',
    ring:     'focus-visible:ring-primary-500/40',
  },
  {
    id:       'add-category',
    label:    'Add Category',
    desc:     'Organize products into categories',
    icon:     MdCategory,
    path:     '/categories/new',
    gradient: 'from-violet-500 to-purple-400',
    shadow:   'hover:shadow-[0_8px_24px_-4px_rgba(139,92,246,0.40)]',
    ring:     'focus-visible:ring-violet-500/40',
  },
  {
    id:       'add-warehouse',
    label:    'Add Warehouse',
    desc:     'Register a new warehouse location',
    icon:     MdWarehouse,
    path:     '/warehouses',
    gradient: 'from-info-500 to-sky-400',
    shadow:   'hover:shadow-[0_8px_24px_-4px_rgba(14,165,233,0.40)]',
    ring:     'focus-visible:ring-info-500/40',
  },
  {
    id:       'add-supplier',
    label:    'Add Supplier',
    desc:     'Register a new vendor/supplier',
    icon:     MdLocalShipping,
    path:     '/suppliers/create',
    gradient: 'from-warning-500 to-amber-400',
    shadow:   'hover:shadow-[0_8px_24px_-4px_rgba(245,158,11,0.40)]',
    ring:     'focus-visible:ring-warning-500/40',
  },
  {
    id:       'create-order',
    label:    'Create Purchase Order',
    desc:     'Raise a new PO with supplier',
    icon:     MdShoppingCart,
    path:     '/purchase-orders',
    gradient: 'from-success-500 to-emerald-400',
    shadow:   'hover:shadow-[0_8px_24px_-4px_rgba(34,197,94,0.40)]',
    ring:     'focus-visible:ring-success-500/40',
  },
  {
    id:       'view-reports',
    label:    'View Reports',
    desc:     'Analyse inventory and sales data',
    icon:     MdBarChart,
    path:     '/reports',
    gradient: 'from-warning-500 to-amber-400',
    shadow:   'hover:shadow-[0_8px_24px_-4px_rgba(249,115,22,0.40)]',
    ring:     'focus-visible:ring-warning-500/40',
  },
  {
    id:       'manage-users',
    label:    'Manage Users',
    desc:     'Control access and roles',
    icon:     MdPeople,
    path:     '/users',
    gradient: 'from-danger-500 to-rose-400',
    shadow:   'hover:shadow-[0_8px_24px_-4px_rgba(239,68,68,0.40)]',
    ring:     'focus-visible:ring-danger-500/40',
  },
];

// ─── Single action card ───────────────────────────────────────
const ActionCard = ({ action, index }) => {
  const navigate = useNavigate();
  const Icon     = action.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(action.path)}
      className={clsx(
        'group w-full flex items-center gap-4 p-4 rounded-xl text-left',
        'bg-surface-50/60 dark:bg-surface-800/50',
        'border border-surface-200/80 dark:border-surface-700/50',
        'hover:bg-white dark:hover:bg-surface-700/70',
        'hover:border-surface-300 dark:hover:border-surface-600',
        'transition-all duration-200',
        action.shadow,
        'focus:outline-none focus-visible:ring-2', action.ring,
      )}
    >
      {/* Gradient icon */}
      <div className={clsx(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        'bg-gradient-to-br', action.gradient,
        'shadow-sm group-hover:scale-105 transition-transform duration-200',
      )}>
        <Icon size={20} className="text-white" />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 leading-tight">
          {action.label}
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 truncate">
          {action.desc}
        </p>
      </div>

      {/* Arrow */}
      <MdArrowForward
        size={16}
        className="text-surface-300 dark:text-surface-600 group-hover:text-surface-500 dark:group-hover:text-surface-300 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
      />
    </motion.button>
  );
};

// ─── QuickActions ─────────────────────────────────────────────
/**
 * QuickActions — 5 navigable action cards with gradient icons.
 * @param {boolean} loading
 */
const QuickActions = ({ loading = false }) => (
  <div className={clsx(
    'rounded-2xl overflow-hidden',
    'bg-white/80 dark:bg-surface-800/80',
    'backdrop-blur-xl',
    'border border-white/60 dark:border-surface-700/50',
    'shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.28)]',
  )}>
    {/* Header */}
    <div className="px-5 py-4 border-b border-surface-100 dark:border-surface-700/50">
      <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">Quick Actions</h3>
      <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">Jump to common tasks</p>
    </div>

    {/* Action list */}
    <div className="p-4 space-y-2.5">
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <Skeleton height="40px" width="40px" className="rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton height="13px" className="w-1/2" />
                <Skeleton height="11px" className="w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        ACTIONS.map((action, index) => (
          <ActionCard key={action.id} action={action} index={index} />
        ))
      )}
    </div>
  </div>
);

export default QuickActions;
